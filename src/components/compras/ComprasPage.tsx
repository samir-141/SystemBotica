import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { proveedoresService } from "../../services/proveedores.service";
import { comprasService } from "../../services/compras.service";
import { productosService } from "../../services/productos.service";
import type {
  CompraRegistradaDto,
  CompraResumenDto,
  ProductoPOS,
  ProveedorDto,
} from "../../types/api.types";
import type { CreateCompraDto } from "../../types/dto";
import { fechaCivil, formatearFechaCivil } from "../../utils/localDate";
import ProveedorModal from "../proveedores/ProveedorModal";
import SelectMedicamento from "./SelectMedicamento";
import {
  calcularTotales,
  estadoLotePorVencimiento,
  lotesConFechaVencimiento,
  mensajeCompraError,
  nuevaLineaCompra,
  unidadesBase,
  type CompraLineDraft,
  type LoteExistente,
} from "./compras.utils";

const money = (value: number) => `S/ ${Number(value || 0).toFixed(2)}`;
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export default function ComprasPage() {
  const { sucursalActual, sucursales, cambiarSucursal } = useAuth();
  const [proveedores, setProveedores] = useState<ProveedorDto[]>([]);
  const [proveedorQuery, setProveedorQuery] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [proveedorModal, setProveedorModal] = useState(false);
  const [productos, setProductos] = useState<ProductoPOS[]>([]);
  const [productoQuery, setProductoQuery] = useState("");
  const [lotesPorProducto, setLotesPorProducto] = useState<
    Record<string, LoteExistente[]>
  >({});
  const [lineas, setLineas] = useState<CompraLineDraft[]>([nuevaLineaCompra()]);
  const [serie, setSerie] = useState("F001");
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState(fechaCivil());
  const [saving, setSaving] = useState(false);
  const submitLock = useRef(false);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);
  const [compras, setCompras] = useState<CompraResumenDto[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [detail, setDetail] = useState<CompraRegistradaDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadProviders = useCallback(async () => {
    const response = await proveedoresService.getProveedores({
      page: 1,
      limit: 50,
      buscar: proveedorQuery || undefined,
    });
    setProveedores(response.data);
  }, [proveedorQuery]);

  const loadHistory = useCallback(async () => {
    if (!sucursalActual?.id) return;
    setLoadingHistory(true);
    try {
      const response = await comprasService.getCompras({
        page,
        limit: 10,
        buscar: historyQuery || undefined,
        sucursal_id: sucursalActual.id,
      });
      setCompras(response.data);
      setTotalPages(Math.max(1, response.meta.total_pages));
    } catch (error) {
      setNotice({ kind: "error", text: mensajeCompraError(error) });
    } finally {
      setLoadingHistory(false);
    }
  }, [historyQuery, page, sucursalActual?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProviders(), 250);
    return () => window.clearTimeout(timer);
  }, [loadProviders]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await productosService.getProductos({
          page: 1,
          limit: 300,
          buscar: productoQuery || undefined,
          orden: "nombre_asc",
        });
        setProductos((current) => {
          const merged = new Map(
            current.map((item) => [item.presentacion_id, item]),
          );
          response.data.forEach((item) =>
            merged.set(item.presentacion_id, item),
          );
          return [...merged.values()];
        });
      } catch (error) {
        setNotice({ kind: "error", text: mensajeCompraError(error) });
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [productoQuery, sucursalActual?.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadHistory(), 250);
    return () => window.clearTimeout(timer);
  }, [loadHistory]);

  const totals = useMemo(
    () => calcularTotales(lineas, productos),
    [lineas, productos],
  );

  const productoQueryNorm = productoQuery.trim().toLowerCase();

  const productosFiltrados = useMemo(() => {
    if (!productoQueryNorm) return productos;
    return productos.filter((item) =>
      [
        item.nombre_comercial,
        item.sku,
        item.codigo_barras,
        item.codigo_interno,
        item.principio_activo,
        item.laboratorio,
        item.presentacion_nombre,
      ]
        .join(" ")
        .toLowerCase()
        .includes(productoQueryNorm),
    );
  }, [productos, productoQueryNorm]);

  const productosAgrupados = useMemo(() => {
    const mapa = new Map<
      string,
      { producto: ProductoPOS; presentaciones: ProductoPOS[] }
    >();
    productosFiltrados.forEach((item) => {
      const grupo = mapa.get(item.producto_comercial_id);
      if (grupo) {
        grupo.presentaciones.push(item);
      } else {
        mapa.set(item.producto_comercial_id, {
          producto: item,
          presentaciones: [item],
        });
      }
    });
    return [...mapa.values()].sort((a, b) =>
      a.producto.nombre_comercial.localeCompare(b.producto.nombre_comercial, "es"),
    );
  }, [productosFiltrados]);

  const presentacionesDe = (productoId: string) =>
    productosAgrupados.find(
      (grupo) => grupo.producto.producto_comercial_id === productoId,
    )?.presentaciones ?? [];

  const seleccionarProducto = async (
    line: CompraLineDraft,
    productoId: string,
  ) => {
    const presentaciones = presentacionesDe(productoId);
    const unica =
      presentaciones.length === 1 ? presentaciones[0].presentacion_id : "";

    if (!productoId) {
      updateLine(line.key, {
        productoId,
        presentacionId: unica,
        numeroLote: "",
        fechaFabricacion: "",
        fechaVencimiento: "",
      });
      return;
    }

    let lotes = lotesPorProducto[productoId];

    if (!lotes) {
      try {
        const detalle = await productosService.getProductoDetalle(productoId);
        lotes = (detalle.lotes || []).map((lote: any) => ({
          id: lote.id,
          numero_lote: lote.numero_lote,
          fecha_fabricacion: lote.fecha_fabricacion || null,
          fecha_vencimiento: lote.fecha_vencimiento || null,
          stock_actual: lote.stock_actual,
        }));
        setLotesPorProducto((current) => ({
          ...current,
          [productoId]: lotes,
        }));
      } catch {
        lotes = [];
      }
    }

    // Si el producto tiene exactamente 1 lote registrado, lo auto-seleccionamos de inmediato
    if (lotes && lotes.length === 1) {
      updateLine(line.key, {
        productoId,
        presentacionId: unica,
        numeroLote: lotes[0].numero_lote,
        fechaFabricacion: lotes[0].fecha_fabricacion?.slice(0, 10) || "",
        fechaVencimiento: lotes[0].fecha_vencimiento?.slice(0, 10) || "",
      });
    } else {
      updateLine(line.key, {
        productoId,
        presentacionId: unica,
        numeroLote: "",
        fechaFabricacion: "",
        fechaVencimiento: "",
      });
    }
  };

  const onLoteChange = (line: CompraLineDraft, numeroLote: string) => {
    const patch: Partial<CompraLineDraft> = {
      numeroLote: numeroLote.toUpperCase(),
    };
    if (numeroLote.trim()) {
      const lote = (lotesPorProducto[line.productoId] ?? []).find(
        (item) =>
          item.numero_lote.toUpperCase() ===
          numeroLote.trim().toUpperCase(),
      );
      if (lote) {
        patch.fechaVencimiento = lote.fecha_vencimiento?.slice(0, 10) || "";
        patch.fechaFabricacion = lote.fecha_fabricacion?.slice(0, 10) || "";
      }
    }
    updateLine(line.key, patch);
  };

  const onVencimientoChange = (
    line: CompraLineDraft,
    fechaVencimiento: string,
  ) => {
    const patch: Partial<CompraLineDraft> = { fechaVencimiento };
    if (fechaVencimiento) {
      const matching = lotesConFechaVencimiento(
        lotesPorProducto[line.productoId] ?? [],
        fechaVencimiento,
      );
      if (matching.length === 1) {
        patch.numeroLote = matching[0].numero_lote;
        patch.fechaFabricacion =
          matching[0].fecha_fabricacion?.slice(0, 10) || "";
      } else {
        patch.numeroLote = "";
      }
    } else {
      patch.numeroLote = "";
    }
    updateLine(line.key, patch);
  };

  const onElegirLote = (line: CompraLineDraft, numeroLote: string) => {
    const lote = (lotesPorProducto[line.productoId] ?? []).find(
      (item) => item.numero_lote === numeroLote,
    );
    updateLine(line.key, {
      numeroLote,
      fechaFabricacion: lote?.fecha_fabricacion?.slice(0, 10) || "",
    });
  };

  const updateLine = (key: string, patch: Partial<CompraLineDraft>) =>
    setLineas((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );

  const validate = () => {
    if (!sucursalActual?.id) return "Seleccione una sucursal activa.";
    if (!proveedorId) return "Seleccione un proveedor.";
    if (!serie.trim() || !numero.trim())
      return "Ingrese serie y número del comprobante.";
    const keys = new Set<string>();
    for (const line of lineas) {
      const product = productos.find(
        (item) => item.presentacion_id === line.presentacionId,
      );
      if (!product)
        return "Seleccione el producto y presentación en todas las líneas.";
      if (!Number.isInteger(Number(line.cantidad)) || Number(line.cantidad) < 1)
        return "La cantidad debe ser un entero mayor a cero.";
      if (!(Number(line.costoUnitario) > 0))
        return "Ingrese un costo válido por presentación.";
      if (product.controla_lote && !line.numeroLote.trim())
        return `${product.nombre_comercial}: el lote es obligatorio.`;
      if (product.controla_lote && line.numeroLote.trim()) {
        // 1. Verificar contra lotes registrados en la base de datos
        const loteRegistrado = (lotesPorProducto[line.productoId] ?? []).find(
          (l) =>
            l.numero_lote.toUpperCase() ===
            line.numeroLote.trim().toUpperCase(),
        );
        if (loteRegistrado) {
          const vencimientoRegistrado =
            loteRegistrado.fecha_vencimiento?.slice(0, 10) || "";
          const vencimientoIngresado = line.fechaVencimiento || "";
          const fabricacionRegistrada =
            loteRegistrado.fecha_fabricacion?.slice(0, 10) || "";
          const fabricacionIngresada = line.fechaFabricacion || "";
          if (
            vencimientoRegistrado !== vencimientoIngresado ||
            fabricacionRegistrada !== fabricacionIngresada
          ) {
            return `${product.nombre_comercial}: el lote ${line.numeroLote} ya existe con fechas diferentes en el sistema. Usa la fecha registrada o ingresa un lote nuevo.`;
          }
        }

        // 2. Verificar contra otras líneas del mismo formulario para evitar duplicidad conflictiva
        const duplicateLine = lineas.find(
          (other) =>
            other.key !== line.key &&
            other.productoId === line.productoId &&
            other.numeroLote.trim().toUpperCase() === line.numeroLote.trim().toUpperCase() &&
            (other.fechaVencimiento !== line.fechaVencimiento ||
              other.fechaFabricacion !== line.fechaFabricacion)
        );
        if (duplicateLine) {
          return `${product.nombre_comercial}: el lote "${line.numeroLote}" está ingresado en otra línea con fechas diferentes. Consolida las fechas para evitar duplicados en la base de datos.`;
        }
      }
      if (product.requiere_vencimiento && !line.fechaVencimiento)
        return `${product.nombre_comercial}: el vencimiento es obligatorio.`;
      if (line.fechaVencimiento && line.fechaVencimiento < fechaCivil())
        return `${product.nombre_comercial}: no se puede ingresar un lote vencido.`;
      if (line.fechaFabricacion && line.fechaFabricacion > fechaCivil())
        return "La fecha de fabricación no puede estar en el futuro.";
      if (
        line.fechaFabricacion &&
        line.fechaVencimiento &&
        line.fechaFabricacion > line.fechaVencimiento
      )
        return "La fabricación no puede ser posterior al vencimiento.";
      const key = `${line.presentacionId}:${line.numeroLote.trim().toUpperCase()}`;
      if (keys.has(key))
        return "Consolide las líneas que repiten presentación y lote.";
      keys.add(key);
    }
    return "";
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitLock.current) return;
    const validation = validate();
    if (validation) {
      setNotice({ kind: "error", text: validation });
      return;
    }
    submitLock.current = true;
    setSaving(true);
    setNotice(null);
    const payload: CreateCompraDto = {
      proveedor_id: proveedorId,
      sucursal_id: sucursalActual!.id,
      serie: serie.trim().toUpperCase(),
      numero: numero.trim().toUpperCase(),
      fecha,
      subtotal: totals.subtotal,
      igv: totals.igv,
      total: totals.total,
      detalles: lineas.map((line) => ({
        producto_presentacion_id: line.presentacionId,
        cantidad: Number(line.cantidad),
        costo_unitario: Number(line.costoUnitario),
        numero_lote: line.numeroLote.trim() || undefined,
        fecha_fabricacion: line.fechaFabricacion || undefined,
        fecha_vencimiento: line.fechaVencimiento || undefined,
      })),
    };
    try {
      const response = await comprasService.crearCompra(payload);
      setNotice({
        kind: "ok",
        text: response.idempotente
          ? `El comprobante ${response.serie}-${response.numero} ya estaba registrado; no se duplicó stock.`
          : `Compra ${response.serie}-${response.numero} registrada por ${money(response.total)}.`,
      });
      await loadHistory();
    } catch (error) {
      setNotice({ kind: "error", text: mensajeCompraError(error) });
    } finally {
      submitLock.current = false;
      setSaving(false);
    }
  };

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      setDetail(await comprasService.getCompraById(id));
    } catch (error) {
      setNotice({ kind: "error", text: mensajeCompraError(error) });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <main className="min-h-full bg-slate-100 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-4 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-950 text-amber-300">
              <ShoppingBag />
            </span>
            <div>
              <h1 className="text-xl font-black text-emerald-950">
                Compras y proveedores
              </h1>
              <p className="text-xs text-slate-500">
                Ingreso formal de mercadería, lotes e inversión
              </p>
            </div>
          </div>
          <label className="min-w-64 text-xs font-bold text-slate-600">
            Sucursal operativa
            <select
              value={sucursalActual?.id || ""}
              onChange={(event) => cambiarSucursal(event.target.value)}
              className={`${inputClass} mt-1`}
            >
              <option value="" disabled>
                Seleccione sucursal
              </option>
              {sucursales.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>
        </header>

        {notice && (
          <div
            role="status"
            className={`rounded-xl border p-3 text-sm font-bold ${notice.kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}
          >
            {notice.text}
          </div>
        )}

        <form
          onSubmit={submit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <label className="flex-1 text-xs font-bold text-slate-700">
              Buscar proveedor
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  value={proveedorQuery}
                  onChange={(e) => setProveedorQuery(e.target.value)}
                  placeholder="RUC o razón social"
                  className={`${inputClass} pl-9`}
                />
              </div>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className={`${inputClass} mt-2`}
              >
                <option value="">— Seleccionar proveedor —</option>
                {proveedores.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.ruc} · {item.razon_social}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setProveedorModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-emerald-950"
            >
              <Building2 className="h-4 w-4" />
              Nuevo proveedor
            </button>
            <label className="text-xs font-bold text-slate-700">
              Serie
              <input
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                maxLength={10}
                className={`${inputClass} mt-1 lg:w-28`}
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Número
              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                maxLength={20}
                className={`${inputClass} mt-1 lg:w-40`}
              />
            </label>
            <label className="text-xs font-bold text-slate-700">
              Fecha
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={`${inputClass} mt-1 lg:w-40`}
              />
            </label>
          </div>

          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-black text-emerald-950">
                  Detalle de mercadería
                </h2>
                <p className="text-xs text-slate-500">
                  El costo corresponde a la presentación comprada.
                </p>
              </div>
              <label className="text-xs font-bold text-slate-600 sm:w-80">
                Buscar medicamento
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    value={productoQuery}
                    onChange={(e) => setProductoQuery(e.target.value)}
                    placeholder="Nombre, P. activo, SKU o laboratorio"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </label>
            </div>
            <div className="space-y-3">
              {lineas.map((line, index) => {
                const product = productos.find(
                  (item) => item.presentacion_id === line.presentacionId,
                );
                const needsLot = product?.controla_lote ?? true;
                const needsExpiry = product?.requiere_vencimiento ?? true;
                const estadoLote = estadoLotePorVencimiento(
                  line.fechaVencimiento,
                );
                const lotesDelProducto = line.productoId
                  ? lotesPorProducto[line.productoId] ?? []
                  : [];
                 const lotesConMismoVencimiento = lotesConFechaVencimiento(
                  lotesDelProducto,
                  line.fechaVencimiento,
                );
                const loteUnico =
                  lotesConMismoVencimiento.length === 1
                    ? lotesConMismoVencimiento[0]
                    : null;
                const lotesMultiples = lotesConMismoVencimiento.length > 1;
                const loteExistente = lotesDelProducto.find(
                  (l) => l.numero_lote.toUpperCase() === line.numeroLote.trim().toUpperCase()
                );
                const loteExistenteDiferente = Boolean(
                  line.numeroLote.trim() &&
                    !loteUnico &&
                    !lotesMultiples &&
                    lotesDelProducto.some(
                      (l) =>
                        l.numero_lote.toUpperCase() ===
                          line.numeroLote.trim().toUpperCase() &&
                        (l.fecha_vencimiento?.slice(0, 10) || "") !==
                          line.fechaVencimiento,
                    ),
                );
                return (
                  <article
                    key={line.key}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <b className="text-sm text-emerald-950">
                        Línea {index + 1}
                      </b>
                      <button
                        type="button"
                        disabled={lineas.length === 1}
                        onClick={() =>
                          setLineas((current) =>
                            current.filter((item) => item.key !== line.key),
                          )
                        }
                        className="text-red-600 disabled:opacity-30"
                        aria-label={`Eliminar línea ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
                      <div className="md:col-span-2 xl:col-span-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="text-xs font-bold text-slate-600">
                            <span>Medicamento</span>
                            <SelectMedicamento
                              value={line.productoId}
                              medicamentos={productosAgrupados}
                              onChange={(productoId) =>
                                seleccionarProducto(line, productoId)
                              }
                              inputClass={inputClass}
                            />
                          </div>
                          <label className="text-xs font-bold text-slate-600">
                            Presentación
                            <select
                              value={line.presentacionId}
                              onChange={(e) =>
                                updateLine(line.key, {
                                  presentacionId: e.target.value,
                                })
                              }
                              disabled={!line.productoId}
                              className={`${inputClass} mt-1 disabled:bg-slate-100`}
                            >
                              <option value="">
                                — Seleccionar presentación —
                              </option>
                              {presentacionesDe(line.productoId).map((pres) => (
                                <option
                                  key={pres.presentacion_id}
                                  value={pres.presentacion_id}
                                >
                                  {pres.presentacion_nombre} x
                                  {pres.cantidad_unidad_base}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </div>
                      <label className="text-xs font-bold text-slate-600 xl:col-span-1">
                        Cantidad
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={line.cantidad}
                          onChange={(e) =>
                            updateLine(line.key, { cantidad: e.target.value })
                          }
                          className={`${inputClass} mt-1`}
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600 xl:col-span-2">
                        Costo/presentación
                        <input
                          type="number"
                          min="0.0001"
                          step="0.0001"
                          value={line.costoUnitario}
                          onChange={(e) =>
                            updateLine(line.key, {
                              costoUnitario: e.target.value,
                            })
                          }
                          className={`${inputClass} mt-1`}
                          placeholder="0.00"
                        />
                      </label>
                      <label className="text-xs font-bold text-slate-600 xl:col-span-2">
                        Vencimiento {needsExpiry && "*"}
                        <input
                          type="date"
                          disabled={!needsExpiry}
                          value={line.fechaVencimiento}
                          onChange={(e) =>
                            onVencimientoChange(line, e.target.value)
                          }
                          className={`${inputClass} mt-1 disabled:bg-slate-100`}
                        />
                        {loteUnico && (
                          <span className="mt-1 block rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-bold leading-tight text-teal-700">
                            Ya existe {loteUnico.numero_lote}; se agregará allí.
                          </span>
                        )}
                        {lotesMultiples && (
                          <span className="mt-1 block rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold leading-tight text-amber-800">
                            Varios lotes con esta fecha. Elige cuál.
                          </span>
                        )}
                        {line.fechaVencimiento &&
                          estadoLote.estado === "vencido" && (
                            <span className="mt-1 block rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black leading-tight text-red-700">
                              LOTE VENCIDO
                              <span className="block font-bold text-red-500">
                                hace {Math.abs(estadoLote.dias)} días
                              </span>
                            </span>
                          )}
                        {line.fechaVencimiento &&
                          estadoLote.estado === "por_vencer" && (
                            <span className="mt-1 block rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-black leading-tight text-amber-800">
                              VENCE PRONTO
                              <span className="block font-bold text-amber-600">
                                en {estadoLote.dias} días
                              </span>
                            </span>
                          )}
                      </label>

                      <label className="text-xs font-bold text-slate-600 xl:col-span-2">
                        {loteUnico || lotesMultiples
                          ? "Lote existente"
                          : `Nuevo lote ${needsLot && "*"}`}
                        {loteUnico ? (
                          <input
                            value={loteUnico.numero_lote}
                            disabled
                            className={`${inputClass} mt-1 font-mono disabled:bg-slate-100`}
                          />
                        ) : lotesMultiples ? (
                          <select
                            value={line.numeroLote}
                            onChange={(e) =>
                              onElegirLote(line, e.target.value)
                            }
                            className={`${inputClass} mt-1`}
                          >
                            <option value="">— Elegir lote —</option>
                            {lotesConMismoVencimiento.map((l) => (
                              <option key={l.id} value={l.numero_lote}>
                                {l.numero_lote} · stock {l.stock_actual ?? 0}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            disabled={!needsLot}
                            value={line.numeroLote}
                            onChange={(e) =>
                              onLoteChange(line, e.target.value)
                            }
                            className={`${inputClass} mt-1 font-mono disabled:bg-slate-100`}
                            placeholder="Ej. LOTE-2026-A1"
                          />
                        )}
                        {loteExistenteDiferente && (
                          <span className="mt-1 block rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black leading-tight text-red-700">
                            El lote {line.numeroLote} ya está registrado con
                            otra fecha.
                          </span>
                        )}
                      </label>

                      <label className="text-xs font-bold text-slate-600 xl:col-span-1">
                        Fabricación
                        <input
                          type="date"
                          disabled={Boolean(loteUnico || loteExistente)}
                          value={line.fechaFabricacion}
                          onChange={(e) =>
                            updateLine(line.key, {
                              fechaFabricacion: e.target.value,
                            })
                          }
                          className={`${inputClass} mt-1 disabled:bg-slate-100`}
                        />
                      </label>
                    </div>
                    {product && (
                      <p className="mt-2 text-xs font-bold text-emerald-700">
                        {line.cantidad || 0} {product.presentacion_nombre} ={" "}
                        {unidadesBase(line, product)} unidades base
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() =>
                setLineas((current) => [...current, nuevaLineaCompra()])
              }
              className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-2 text-xs font-black text-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Agregar línea
            </button>
          </section>

          <footer className="flex flex-col gap-4 rounded-2xl bg-emerald-950 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-3 gap-5 text-xs">
              <span>
                Subtotal
                <b className="block text-base">{money(totals.subtotal)}</b>
              </span>
              <span>
                IGV estimado
                <b className="block text-base">{money(totals.igv)}</b>
              </span>
              <span>
                Total estimado
                <b className="block text-lg text-amber-300">
                  {money(totals.total)}
                </b>
              </span>
            </div>
            <div className="text-right">
              <p className="mb-2 text-[11px] text-emerald-100">
                El backend recalcula y devuelve el total canónico.
              </p>
              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-emerald-950 disabled:opacity-60"
              >
                <PackagePlus className="h-4 w-4" />
                {saving ? "Registrando…" : "Registrar compra"}
              </button>
            </div>
          </footer>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-black text-emerald-950">
                <ClipboardList className="h-5 w-5" />
                Historial de compras
              </h2>
              <p className="text-xs text-slate-500">
                Solo de la sucursal operativa seleccionada
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={historyQuery}
                onChange={(e) => {
                  setHistoryQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Comprobante o proveedor"
                className={`${inputClass} sm:w-64`}
              />
              <button
                onClick={() => void loadHistory()}
                aria-label="Refrescar historial"
                className="rounded-xl border p-2.5 text-emerald-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingHistory ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Comprobante</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3">Sucursal</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {compras.map((compra) => (
                  <tr key={compra.id} className="border-t">
                    <td className="p-3">
                      {formatearFechaCivil(compra.fecha)}
                    </td>
                    <td className="p-3 font-bold">
                      {compra.serie}-{compra.numero}
                    </td>
                    <td className="p-3">
                      <b>{compra.proveedores.razon_social}</b>
                      <small className="block text-slate-400">
                        {compra.proveedores.ruc}
                      </small>
                    </td>
                    <td className="p-3">{compra.sucursales.nombre}</td>
                    <td className="p-3 text-right font-black text-emerald-800">
                      {money(compra.total)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        disabled={loadingDetail}
                        onClick={() => void openDetail(compra.id)}
                        aria-label={`Ver compra ${compra.serie}-${compra.numero}`}
                        className="rounded-lg border p-2 text-emerald-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loadingHistory && compras.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No hay compras registradas en esta sucursal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <footer className="flex items-center justify-end gap-3 border-t p-3 text-xs font-bold">
            <button
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
              className="rounded-lg border p-2 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            Página {page} de {totalPages}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border p-2 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </footer>
        </section>
      </div>

      <ProveedorModal
        open={proveedorModal}
        onClose={() => setProveedorModal(false)}
        onCreated={(item) => {
          setProveedores((current) => [item, ...current]);
          setProveedorId(item.id);
        }}
      />
      {detail && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compra-detail-title"
        >
          <section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white shadow-2xl">
            <header className="sticky top-0 flex items-center justify-between bg-emerald-950 p-4 text-white">
              <div>
                <h2 id="compra-detail-title" className="font-black">
                  Compra {detail.serie}-{detail.numero}
                </h2>
                <p className="text-xs text-emerald-100">
                  {detail.proveedores.razon_social} · {detail.sucursales.nombre}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                aria-label="Cerrar detalle"
              >
                <X />
              </button>
            </header>
            <div className="space-y-3 p-4">
              {detail.detalles_compras?.map((item) => (
                <article key={item.id} className="rounded-xl border p-3">
                  <div className="flex justify-between gap-4">
                    <div>
                      <b>
                        {
                          item.productos_presentaciones.productos_comerciales
                            .nombre_comercial
                        }
                      </b>
                      <p className="text-xs text-slate-500">
                        {
                          item.productos_presentaciones.unidades_presentacion
                            .nombre
                        }{" "}
                        x{item.productos_presentaciones.cantidad_unidad_base} ·{" "}
                        {item.cantidad} presentación(es)
                      </p>
                    </div>
                    <b>{money(item.cantidad * item.precio_unitario)}</b>
                  </div>
                  {item.lotes?.map((lote) => (
                    <p
                      key={lote.numero_lote}
                      className="mt-2 text-xs text-emerald-700"
                    >
                      Lote {lote.numero_lote}
                      {lote.fecha_vencimiento
                        ? ` · vence ${formatearFechaCivil(lote.fecha_vencimiento)}`
                        : ""}
                    </p>
                  ))}
                </article>
              ))}
              <div className="ml-auto grid max-w-xs grid-cols-2 gap-2 border-t pt-3 text-sm">
                <span>Subtotal</span>
                <b className="text-right">{money(detail.subtotal)}</b>
                <span>IGV</span>
                <b className="text-right">{money(detail.igv)}</b>
                <span className="font-black">Total</span>
                <b className="text-right text-lg text-emerald-800">
                  {money(detail.total)}
                </b>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
