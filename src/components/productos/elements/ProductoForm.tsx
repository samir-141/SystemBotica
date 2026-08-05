// src/components/productos/elements/ProductoForm.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import {
  X,
  Save,
  Loader2,
  Package,
  Tag,
  Barcode,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Pill,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  ScanLine,
  RefreshCw,
} from "lucide-react";
import type { ProductoPOS } from "../../../types/api.types";
import type { ProductoFormData, FormMode, TipoCatalogo } from "../types";
import { VIAS_ADMINISTRACION, UNIDADES_CONCENTRACION } from "../types";
import type { CatalogosMap } from "../hooks/useCatalogos";
import type { CreateProductoDto, UpdateProductoDto } from "../../../types/dto";
import CatalogoSelect from "./CatalogoSelect";
import { generateSkuSuggestion } from "../../../utils/productCodes";

type Props = {
  open: boolean;
  mode: FormMode;
  producto: ProductoPOS | null;
  presentaciones?: ProductoPOS[];
  catalogos: CatalogosMap;
  onClose: () => void;
  onSave: (data: CreateProductoDto | UpdateProductoDto, mode: FormMode) => Promise<void>;
  onCatalogoRefresh: (tipo: TipoCatalogo) => void;
};

const EMPTY_FORM: ProductoFormData = {
  nombre_comercial: "",
  sku: "",
  codigo_interno: "",
  tipo_producto: "MEDICAMENTO",
  controla_lote: true,
  requiere_vencimiento: true,
  atributo_nombre: "",
  atributo_valor: "",
  principio_activo_id: "",
  forma_farmaceutica_id: "",
  laboratorio_id: "",
  categoria_id: "",
  concentracion: "",
  unidad_concentracion: "mg",
  via_administracion: "Oral",
  requiere_receta: false,
  afecto_igv: true,
  presentacion_id: "",
  cantidad_unidad_base: 1,
  precio_actual: "",
  codigo_barras: "",
  registro_sanitario: "",
};

export default function ProductoForm({
  open,
  mode,
  producto,
  presentaciones = [],
  catalogos,
  onClose,
  onSave,
  onCatalogoRefresh,
}: Props) {
  const [form, setForm] = useState<ProductoFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skuManual, setSkuManual] = useState(false);

  const foundProduct = false;

  // Estado para la ventana de ayuda sobre presentaciones
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [presentacionesExtra, setPresentacionesExtra] = useState<Array<{
    unidad_presentacion_id: string;
    cantidad_unidad_base: number | "";
    precio_actual: number | "";
    codigo_barras: string;
  }>>([]);
  const [scannerAbierto, setScannerAbierto] = useState(false);
  const videoScannerRef = useRef<HTMLVideoElement>(null);

  const isEdit = mode === "editar";
  const set = (key: keyof ProductoFormData, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));
  const presentacionesEdicion = useMemo(
    () => (presentaciones.length > 0 ? [...presentaciones] : producto ? [producto] : [])
      .sort((a, b) => a.cantidad_unidad_base - b.cantidad_unidad_base),
    [presentaciones, producto],
  );
  const presentacionEditando = presentacionesEdicion.find(
    (item) => item.presentacion_id === form.presentacion_id,
  );

  const seleccionarPresentacionEdicion = (presentacionId: string) => {
    const seleccionada = presentacionesEdicion.find(
      (item) => item.presentacion_id === presentacionId,
    );
    if (!seleccionada) return;
    setForm((prev) => ({
      ...prev,
      presentacion_id: seleccionada.presentacion_id,
      cantidad_unidad_base: seleccionada.cantidad_unidad_base,
      precio_actual: seleccionada.precio_actual,
      codigo_barras: seleccionada.codigo_barras || "",
    }));
  };

  /* Pre-fill form on open */
  useEffect(() => {
    if (!open) return;
    setError(null);
    setPresentacionesExtra([]);
    setSkuManual(false);

    if (isEdit && producto) {
      setForm({
        nombre_comercial: producto.nombre_comercial,
        sku: producto.sku,
        codigo_interno: producto.codigo_interno || "",
        tipo_producto: (producto.tipo_producto as ProductoFormData["tipo_producto"]) || "MEDICAMENTO",
        controla_lote: producto.controla_lote ?? true,
        requiere_vencimiento: producto.requiere_vencimiento ?? true,
        atributo_nombre: "",
        atributo_valor: "",
        principio_activo_id: "",
        forma_farmaceutica_id: "",
        laboratorio_id: "",
        categoria_id: "",
        concentracion: producto.concentracion,
        unidad_concentracion: producto.unidad_concentracion,
        via_administracion: producto.via_administracion,
        requiere_receta: producto.requiere_receta,
        afecto_igv: producto.afecto_igv,
        presentacion_id: producto.presentacion_id,
        cantidad_unidad_base: producto.cantidad_unidad_base,
        precio_actual: producto.precio_actual,
        codigo_barras: producto.codigo_barras || "",
        registro_sanitario: producto.registro_sanitario || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, mode, producto, isEdit]);

  useEffect(() => {
    if (!scannerAbierto || !videoScannerRef.current) return;
    const reader = new BrowserMultiFormatReader();
    reader.decodeFromConstraints(
      { video: { facingMode: { ideal: "environment" } } },
      videoScannerRef.current,
      (result, error) => {
        if (result) {
          set("codigo_barras", result.getText());
          setScannerAbierto(false);
        } else if (error && !(error instanceof NotFoundException)) {
          console.warn("[ProductoBarcodeScanner]", error);
        }
      },
    ).catch(() => setError("No se pudo abrir la cámara. Puedes escribir o usar un lector USB en el campo de código."));
    return () => reader.reset();
  }, [scannerAbierto]);

  /* Generación automática de SKU sugerido */
  const suggestedSku = useMemo(() => {
    if (isEdit || skuManual || !form.nombre_comercial.trim()) return "";

    const esMedicamento = form.tipo_producto === "MEDICAMENTO";
    const unidadBase = catalogos["unidades-presentacion"].find(
      (u) => u.id === form.presentacion_id,
    );

    return generateSkuSuggestion({
      nombreComercial: form.nombre_comercial,
      laboratorioNombre: catalogos.laboratorios.find(
        (l) => l.id === form.laboratorio_id,
      )?.nombre,
      categoriaNombre: catalogos.categorias.find(
        (c) => c.id === form.categoria_id,
      )?.nombre,
      cantidad: esMedicamento ? form.concentracion : undefined,
      unidadMedida: esMedicamento
        ? form.unidad_concentracion
        : unidadBase?.abreviatura,
    });
  }, [
    isEdit,
    skuManual,
    form.nombre_comercial,
    form.tipo_producto,
    form.concentracion,
    form.unidad_concentracion,
    form.laboratorio_id,
    form.categoria_id,
    form.presentacion_id,
    catalogos,
  ]);

  useEffect(() => {
    if (!suggestedSku || suggestedSku === form.sku) return;
    setForm((prev) => ({ ...prev, sku: suggestedSku }));
  }, [suggestedSku, form.sku]);

  const unidadesSugeridas = useMemo(() => {
    const todas = catalogos["unidades-presentacion"];
    const forma = catalogos["formas-farmaceuticas"].find((item) => item.id === form.forma_farmaceutica_id)?.nombre.toLowerCase() || "";
    let patron: RegExp | null = null;
    if (/(tableta|cápsula|comprimido|gragea|pastilla)/.test(forma)) patron = /(tableta|cápsula|comprimido|blíster|caja|sobre)/i;
    else if (/(jarabe|solución|suspensión|gota|líquido)/.test(forma)) patron = /(frasco|botella|ml|caja|sobre)/i;
    else if (/(ampolla|inyectable|vial)/.test(forma)) patron = /(ampolla|vial|jeringa|caja)/i;
    else if (/(crema|gel|pomada|ungüento)/.test(forma)) patron = /(tubo|tarro|sobre|caja)/i;
    const filtradas = patron ? todas.filter((unidad) => patron!.test(unidad.nombre)) : todas;
    return filtradas.length > 0 ? filtradas : todas;
  }, [catalogos, form.forma_farmaceutica_id]);

  // Caja, blíster y sobre son empaques comerciales; no pueden ser la unidad base.
  // La unidad base representa el tipo físico que se consume: tableta, frasco, ampolla, tubo, etc.
  const unidadesBaseSugeridas = useMemo(() => {
    const empaques = /(caja|blíster|blister|sobre|display|pack)/i;
    const candidatas = unidadesSugeridas.filter((unidad) => !empaques.test(unidad.nombre));
    return candidatas.length > 0 ? candidatas : unidadesSugeridas;
  }, [unidadesSugeridas]);

  const formaSeleccionada = catalogos["formas-farmaceuticas"].find(
    (item) => item.id === form.forma_farmaceutica_id,
  )?.nombre;

  const alternarPresentacionExtra = (unidadId: string) => {
    setPresentacionesExtra((prev) => prev.some((item) => item.unidad_presentacion_id === unidadId)
      ? prev.filter((item) => item.unidad_presentacion_id !== unidadId)
      : [...prev, { unidad_presentacion_id: unidadId, cantidad_unidad_base: "", precio_actual: "", codigo_barras: "" }]);
  };

  if (!open) return null;

  /* Submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEdit) {
      if (form.tipo_producto === "MEDICAMENTO") {
        if (!form.principio_activo_id) {
          setError("Selecciona un principio activo.");
          return;
        }
        if (!form.forma_farmaceutica_id) {
          setError("Selecciona una forma farmacéutica.");
          return;
        }
        if (!form.laboratorio_id) {
          setError("Selecciona un laboratorio.");
          return;
        }
      }
      if (!form.categoria_id) {
        setError("Selecciona una categoría.");
        return;
      }
      if (!form.presentacion_id) {
        setError("Selecciona la unidad base del producto.");
        return;
      }
      const unidadesSeleccionadas = [form.presentacion_id, ...presentacionesExtra.map((p) => p.unidad_presentacion_id)];
      if (unidadesSeleccionadas.some((id) => !id) || new Set(unidadesSeleccionadas).size !== unidadesSeleccionadas.length) {
        setError("Cada presentación debe tener una unidad distinta.");
        return;
      }
      if (presentacionesExtra.some((p) => !p.cantidad_unidad_base || Number(p.cantidad_unidad_base) <= 1 || p.precio_actual === "" || Number(p.precio_actual) < 0)) {
        setError("Completa equivalencia y precio de cada presentación adicional. Deben contener más de una unidad base.");
        return;
      }
    }

    if (form.precio_actual === "" || Number(form.precio_actual) < 0) {
      setError("El precio de venta debe ser un número válido mayor o igual a 0.");
      return;
    }

    if (!isEdit && !form.nombre_comercial.trim()) {
      setError("El nombre comercial es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const data = isEdit
        ? ({
            producto_comercial_id: producto?.producto_comercial_id || "",
            presentacion_id: form.presentacion_id,
            nombre_comercial: form.nombre_comercial.trim(),
            tipo_producto: form.tipo_producto,
            controla_lote: form.controla_lote,
            requiere_vencimiento: form.requiere_vencimiento,
            precio_actual: Number(form.precio_actual),
            codigo_barras: form.codigo_barras || undefined,
            requiere_receta: form.requiere_receta,
            afecto_igv: form.afecto_igv,
            registro_sanitario: form.registro_sanitario || undefined,
          } as UpdateProductoDto)
        : ({
            ...form,
            producto_comercial_id: undefined,
            unidad_base_id: form.presentacion_id,
            cantidad_unidad_base: 1,
            ...(form.tipo_producto !== "MEDICAMENTO" ? {
              principio_activo_id: undefined,
              forma_farmaceutica_id: undefined,
              concentracion: undefined,
              unidad_concentracion: undefined,
              via_administracion: undefined,
            } : {}),
            presentaciones: [
              {
                unidad_presentacion_id: form.presentacion_id,
                cantidad_unidad_base: 1,
                precio_actual: Number(form.precio_actual),
                codigo_barras: form.codigo_barras || undefined,
              },
              ...presentacionesExtra.map((p) => ({
                unidad_presentacion_id: p.unidad_presentacion_id,
                cantidad_unidad_base: Number(p.cantidad_unidad_base),
                precio_actual: Number(p.precio_actual),
                codigo_barras: p.codigo_barras || undefined,
              })),
            ],
          } as CreateProductoDto);
      await onSave(data, mode);
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          {/* ── Header ──────────────────────────────────── */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">
                  {isEdit 
                    ? "Editar Producto" 
                    : form.tipo_producto === "MEDICAMENTO" 
                      ? "Nuevo Producto Farmacéutico" 
                      : "Nuevo Producto General"
                  }
                </h2>
                <p className="text-xs text-slate-400">
                  {isEdit
                    ? `Modificando: ${producto?.nombre_comercial ?? ""}`
                    : form.tipo_producto === "MEDICAMENTO"
                      ? "Registro unificado de medicamentos y presentaciones"
                      : "Registro unificado de productos y empaques comerciales"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Form Body ───────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            {/* ─── Sección: Datos Comerciales ───────────── */}
            {!isEdit && (
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                  <Tag className="w-3 h-3" /> Datos Comerciales
                </legend>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Tipo de Producto <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={form.tipo_producto}
                    onChange={(e) => {
                      const tipo = e.target.value as ProductoFormData["tipo_producto"];
                      setForm((prev) => ({
                        ...prev,
                        tipo_producto: tipo,
                        ...(tipo !== "MEDICAMENTO" ? {
                          principio_activo_id: "",
                          forma_farmaceutica_id: "",
                          concentracion: "",
                          registro_sanitario: "",
                          via_administracion: "Oral",
                          unidad_concentracion: "mg",
                          requiere_receta: false,
                        } : {}),
                      }));
                    }}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition cursor-pointer"
                    required
                  >
                    <option value="MEDICAMENTO">💊 Medicamento / Fármaco</option>
                    <option value="HIGIENE">🧴 Higiene / Cuidado Personal</option>
                    <option value="BEBE">🍼 Bebé y Maternidad (Pañales, Fórmulas, etc.)</option>
                    <option value="COSMETICO">💅 Cosmético / Estética</option>
                    <option value="ACCESORIO">🩹 Accesorio Médico / Material de Botiquín</option>
                    <option value="OTRO">🥤 Otros (Aguas, Snacks, Bebidas, etc.)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                    Nombre Comercial <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre_comercial}
                    onChange={(e) => set("nombre_comercial", e.target.value)}
                    disabled={foundProduct}
                    placeholder="ej. Paracetamol 500mg, Panadol Forte, Apronax"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      SKU / Código Unificado
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) => {
                          const value = e.target.value;
                          set("sku", value);
                          setSkuManual(value.trim() !== "");
                        }}
                        disabled={foundProduct}
                        placeholder="Se genera automáticamente"
                        className="min-w-0 flex-1 px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                      />
                      {!isEdit && (
                        <button
                          type="button"
                          onClick={() => setSkuManual(false)}
                          title="Regenerar SKU sugerido"
                          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl border border-teal-200 bg-teal-50 px-2.5 text-xs font-bold text-teal-700 hover:bg-teal-100 disabled:opacity-50"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {!isEdit && !skuManual && form.sku && (
                      <p className="mt-1 text-[10px] text-teal-600">
                        SKU sugerido automáticamente. Escribe para editarlo manualmente.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Código Interno
                    </label>
                    <input
                      type="text"
                      value={form.codigo_interno}
                      onChange={(e) => set("codigo_interno", e.target.value)}
                      disabled={foundProduct}
                      placeholder="Automático: PRD-XXXXXX"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Si lo dejas vacío, el sistema generará un código interno seguro.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1 text-ellipsis overflow-hidden whitespace-nowrap">
                      {form.tipo_producto === "MEDICAMENTO" ? "REG. SANITARIO (DIGEMID)" : "REG. SANITARIO (DIGESA/OTROS)"}
                    </label>
                    <input
                      type="text"
                      value={form.registro_sanitario}
                      onChange={(e) => set("registro_sanitario", e.target.value)}
                      disabled={foundProduct}
                      placeholder="ej. N-29381"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Selección de Laboratorio y Categoría */}
                <div className="grid grid-cols-2 gap-3">
                  <CatalogoSelect
                    tipo="laboratorios"
                    items={catalogos.laboratorios}
                    value={form.laboratorio_id}
                    onChange={(id) => set("laboratorio_id", id)}
                    onItemCreated={onCatalogoRefresh}
                    disabled={foundProduct}
                    required
                  />
                  <CatalogoSelect
                    tipo="categorias"
                    items={catalogos.categorias}
                    value={form.categoria_id}
                    onChange={(id) => set("categoria_id", id)}
                    onItemCreated={onCatalogoRefresh}
                    disabled={foundProduct}
                    required
                  />
                </div>
              </fieldset>
            )}

            {/* ─── Sección: Ficha Farmacéutica ──────────── */}
            {!isEdit && form.tipo_producto === "MEDICAMENTO" && (
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                  <Pill className="w-3 h-3" /> Ficha Farmacéutica
                </legend>

                <div className="grid grid-cols-2 gap-3">
                  <CatalogoSelect
                    tipo="principios-activos"
                    items={catalogos["principios-activos"]}
                    value={form.principio_activo_id}
                    onChange={(id) => set("principio_activo_id", id)}
                    onItemCreated={onCatalogoRefresh}
                    disabled={foundProduct}
                    required
                  />
                  <CatalogoSelect
                    tipo="formas-farmaceuticas"
                    items={catalogos["formas-farmaceuticas"]}
                    value={form.forma_farmaceutica_id}
                    onChange={(id) => {
                      set("forma_farmaceutica_id", id);
                      set("presentacion_id", "");
                      setPresentacionesExtra([]);
                    }}
                    onItemCreated={onCatalogoRefresh}
                    disabled={foundProduct}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Concentración
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.concentracion}
                      onChange={(e) => set("concentracion", e.target.value === "" ? "" : Number(e.target.value))}
                      disabled={foundProduct}
                      placeholder="ej. 500"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Unidad Conc.
                    </label>
                    <select
                      value={form.unidad_concentracion}
                      onChange={(e) => set("unidad_concentracion", e.target.value)}
                      disabled={foundProduct}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    >
                      {UNIDADES_CONCENTRACION.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Vía Admin.
                    </label>
                    <select
                      value={form.via_administracion}
                      onChange={(e) => set("via_administracion", e.target.value)}
                      disabled={foundProduct}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:outline-none transition disabled:bg-slate-50"
                    >
                      {VIAS_ADMINISTRACION.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>
            )}

            {/* ─── Sección: Presentación y Precio (con Ayuda `❓`) ─── */}
            <fieldset className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" /> Presentaciones Unificadas & Precio
                </legend>

                <button
                  type="button"
                  onClick={() => setMostrarAyuda(!mostrarAyuda)}
                  className="text-teal-700 hover:text-teal-800 text-xs font-extrabold flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 cursor-pointer"
                >
                  <HelpCircle size={14} />
                  <span>❓ ¿Cómo funciona?</span>
                </button>
              </div>

              {/* Caja de Ayuda Explicativa */}
              {mostrarAyuda && (
                <div className="p-4 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl border border-teal-500/30 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-black text-teal-300">
                    <Sparkles size={16} />
                    <span>Explicación del Manejo Unificado por Producto:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    En esta farmacia, <strong className="text-white">cada producto es un registro único</strong> (ej. <em>Paracetamol 500mg</em>). No necesitas crear productos independientes para Caja, Blíster o Tabletas.
                  </p>
                  <div className="space-y-1 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] font-mono">
                    <p>💊 <strong>Pastillas:</strong> Unidad Base = Pastilla (1). Blíster = 10. Caja = 100.</p>
                    <p>🧴 <strong>Jarabes/Líquidos:</strong> Unidad Base = Frasco (1). Caja = 12.</p>
                    <p>💉 <strong>Ampollas:</strong> Unidad Base = Ampolla (1). Caja = 5.</p>
                  </div>
                  <p className="text-[11px] text-teal-300">
                    Al realizar una venta en el POS, el cajero puede elegir cualquier presentación y el sistema descontará automáticamente el stock exacto en unidades base de tus lotes FEFO.
                  </p>
                </div>
              )}

              {!isEdit && (
                <>
                  <CatalogoSelect
                    tipo="unidades-presentacion"
                    label={form.tipo_producto === "MEDICAMENTO" ? "Unidad base del medicamento" : "Unidad base del producto"}
                    items={unidadesBaseSugeridas}
                    value={form.presentacion_id}
                    onChange={(id) => {
                      set("presentacion_id", id);
                      set("cantidad_unidad_base", 1);
                    }}
                    onItemCreated={onCatalogoRefresh}
                    required
                  />
                  <p className="-mt-2 text-[10px] text-slate-400">
                    {form.tipo_producto === "MEDICAMENTO"
                      ? (formaSeleccionada
                          ? `Unidad base para ${formaSeleccionada}. Los empaques se seleccionan abajo.`
                          : "Primero selecciona la forma farmacéutica para filtrar la unidad base.")
                      : "Unidad física de consumo (ej. Unidad, Botella, Frasco, Paquete). Las presentaciones compuestas se añaden abajo."
                    }
                  </p>

                  {/* Preajustes rápidos de equivalencia */}
                  <div className="hidden">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ajustes rápidos:</span>
                    <button
                      type="button"
                      onClick={() => set("cantidad_unidad_base", 1)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      💊 Pastilla (x1)
                    </button>
                    <button
                      type="button"
                      onClick={() => set("cantidad_unidad_base", 10)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      📦 Blíster (x10)
                    </button>
                    <button
                      type="button"
                      onClick={() => set("cantidad_unidad_base", 100)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      📦 Caja (x100)
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Cant. Unidades Base que Contiene esta Presentación
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.cantidad_unidad_base}
                      readOnly
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">La unidad base siempre equivale a 1. Agrega caja, blíster, frasco u otro empaque abajo.</p>
                  </div>
                </>
              )}

              {isEdit && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
                  <label className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider block mb-1">
                    Presentación que deseas editar
                  </label>
                  <select
                    value={form.presentacion_id}
                    onChange={(e) => seleccionarPresentacionEdicion(e.target.value)}
                    className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {presentacionesEdicion.map((presentacion) => (
                      <option key={presentacion.presentacion_id} value={presentacion.presentacion_id}>
                        {presentacion.presentacion_nombre} (equivale a {presentacion.cantidad_unidad_base} unidad{presentacion.cantidad_unidad_base !== 1 ? "es" : ""} base)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[10px] text-slate-500">
                    Cada presentación mantiene su propio precio y código de barras.
                  </p>
                </div>
              )}

              {/* Precio */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Precio de Venta{isEdit && presentacionEditando ? ` — ${presentacionEditando.presentacion_nombre}` : ""} (S/) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    S/
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.precio_actual}
                    onChange={(e) =>
                      set("precio_actual", e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono text-right focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Código de barras */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1 flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5" /> Código de Barras de la unidad base
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.codigo_barras}
                    onChange={(e) => set("codigo_barras", e.target.value)}
                    placeholder="ej. 7751234567890"
                    className="min-w-0 flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono tracking-wider focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:outline-none transition"
                  />
                  {!isEdit && (
                    <button type="button" onClick={() => setScannerAbierto(true)} title="Escanear código con cámara" className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100">
                      <ScanLine className="h-4 w-4" /> Escanear
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Opcional: también puedes enfocar este campo y usar un lector USB.</p>
                {!isEdit && scannerAbierto && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-indigo-200 bg-black">
                    <video ref={videoScannerRef} className="max-h-56 w-full object-cover" playsInline muted />
                    <button type="button" onClick={() => setScannerAbierto(false)} className="w-full bg-slate-900 px-3 py-2 text-xs font-bold text-white">Cerrar cámara</button>
                  </div>
                )}
              </div>

              {!isEdit && !foundProduct && (
                <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Presentaciones de venta adicionales</p>
                      <p className="text-[10px] text-slate-500">Sugeridas según la forma farmacéutica; puedes marcar varias y configurar cada una.</p>
                    </div>
                    <button type="button" onClick={() => setPresentacionesExtra((prev) => [...prev, { unidad_presentacion_id: "", cantidad_unidad_base: "", precio_actual: "", codigo_barras: "" }])} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-teal-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-teal-700">
                      <Plus className="h-3.5 w-3.5" /> Añadir
                    </button>
                  </div>
                  {form.presentacion_id && (
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-teal-100 bg-white p-2.5 sm:grid-cols-3">
                      {unidadesSugeridas.filter((unidad) => unidad.id !== form.presentacion_id).map((unidad) => {
                        const seleccionada = presentacionesExtra.some((item) => item.unidad_presentacion_id === unidad.id);
                        return <label key={unidad.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-bold ${seleccionada ? "border-teal-400 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                          <input type="checkbox" checked={seleccionada} onChange={() => alternarPresentacionExtra(unidad.id)} className="accent-teal-600" />
                          {unidad.nombre}
                        </label>;
                      })}
                    </div>
                  )}
                  {presentacionesExtra.map((pres, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-teal-100 bg-white p-2.5">
                      <div className="col-span-2">
                        <CatalogoSelect
                          tipo="unidades-presentacion"
                          label="Presentación"
                          items={catalogos["unidades-presentacion"]}
                          value={pres.unidad_presentacion_id}
                          onChange={(id) => setPresentacionesExtra((prev) => prev.map((item, i) => i === index ? { ...item, unidad_presentacion_id: id } : item))}
                          onItemCreated={onCatalogoRefresh}
                        />
                      </div>
                      <input type="number" min={2} placeholder="Equivale a (base)" value={pres.cantidad_unidad_base} onChange={(e) => setPresentacionesExtra((prev) => prev.map((item, i) => i === index ? { ...item, cantidad_unidad_base: e.target.value === "" ? "" : Number(e.target.value) } : item))} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs" />
                      <input type="number" min={0} step={0.01} placeholder="Precio S/" value={pres.precio_actual} onChange={(e) => setPresentacionesExtra((prev) => prev.map((item, i) => i === index ? { ...item, precio_actual: e.target.value === "" ? "" : Number(e.target.value) } : item))} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs" />
                      <input type="text" placeholder="Código de barras (opcional)" value={pres.codigo_barras} onChange={(e) => setPresentacionesExtra((prev) => prev.map((item, i) => i === index ? { ...item, codigo_barras: e.target.value } : item))} className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs" />
                      <button type="button" onClick={() => setPresentacionesExtra((prev) => prev.filter((_, i) => i !== index))} className="inline-flex items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50" title="Quitar presentación"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </fieldset>

            {/* ─── Sección: Opciones ────────────────────── */}
            <fieldset className="space-y-3">
              <legend className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                {form.tipo_producto === "MEDICAMENTO" ? "Opciones Farmacéuticas" : "Opciones de Configuración"}
              </legend>

              {form.tipo_producto === "MEDICAMENTO" && (
                <button
                  type="button"
                  onClick={() => !foundProduct && set("requiere_receta", !form.requiere_receta)}
                  disabled={foundProduct}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span className="text-sm text-slate-700 font-medium">Requiere Receta Médica</span>
                  {form.requiere_receta ? (
                    <ToggleRight className={`w-6 h-6 ${foundProduct ? "text-teal-400" : "text-teal-600"}`} />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-300" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => !foundProduct && set("afecto_igv", !form.afecto_igv)}
                disabled={foundProduct}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span className="text-sm text-slate-700 font-medium">Afecto a IGV (18%)</span>
                {form.afecto_igv ? (
                  <ToggleRight className={`w-6 h-6 ${foundProduct ? "text-teal-400" : "text-teal-600"}`} />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-300" />
                )}
              </button>
            </fieldset>

            {/* Info readonly en modo editar */}
            {isEdit && producto && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-500">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                  {producto.tipo_producto === "MEDICAMENTO" ? "Información de Referencia Farmacéutica" : "Información de Referencia"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {producto.tipo_producto === "MEDICAMENTO" && (
                    <>
                      <div>
                        <span className="text-slate-400">Principio Activo:</span>
                        <p className="font-medium text-slate-700">{producto.principio_activo || "No registrado"}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Forma:</span>
                        <p className="font-medium text-slate-700">{producto.forma_farmaceutica || "No registrado"}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-slate-400">Laboratorio / Marca:</span>
                    <p className="font-medium text-slate-700">{producto.laboratorio || "No registrado"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Categoría:</span>
                    <p className="font-medium text-slate-700">{producto.categoria}</p>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* ── Footer ──────────────────────────────────── */}
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Producto"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
