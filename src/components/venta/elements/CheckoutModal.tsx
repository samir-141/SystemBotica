// src/components/venta/elements/CheckoutModal.tsx
import { useState, useEffect, useRef } from "react";
import {
  X,
  Receipt,
  FileText,
  StickyNote,
  Banknote,
  CreditCard,
  Smartphone,
  Landmark,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Printer,
  Hash,
  User,
  MapPin,
  Calculator,
  Sparkles,
  Loader2,
  FileCode,
  AlertTriangle,
  Share2,
  Copy,
  Settings,
} from "lucide-react";
import ImpresionComprobanteModal from "../../reportes/elements/ImpresionComprobanteModal";
import type { ComprobanteData } from "../../reportes/elements/comprobanteDocument";
import { printerService, type ReceiptData } from "../../../modules/printing";
import type {
  ItemCarrito,
  TipoComprobante,
  MetodoPago,
  DatosCliente,
} from "../types";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { formatMoney } from "../utils/calculosVenta";
import { ventasService } from "../../../services/ventas.service";
import { clientesService } from "../../../services/clientes.service";
import { facturacionService } from "../../../services/facturacion.service";
import type { EstadoComprobanteVenta } from "../../../types/dto";
import {
  buildComprobanteSnapshot,
  buildVentaPayload,
  enlaceComprobante,
  estadoComprobanteDe,
  nuevaClaveIdempotencia,
} from "./checkoutContract";
import type { ReceiptLink } from "../../../utils/networkUrls";
import { loadPrinterConfiguration, validatePrinterConfiguration } from "../../../modules/printing";


type Props = {
  open: boolean;
  onClose: () => void;
  carrito: ItemCarrito[];
  montoBrutoFinal: number;
  baseImponible: number;
  igvCalculado: number;
  tipoPago: "CONTADO" | "ABONO" | "ANTICIPO";
  onVentaExitosa?: () => void;
  /** Si los precios incluyen IGV (true) o la operación es exonerada/inafecta (false) */
  incluyeIGV?: boolean;
  /** Cliente preseleccionado desde el POS (F4) */
  clientePreseleccionado?: { nombre: string; tipo_documento: string; numero_documento: string; direccion?: string } | null;
};

const COMPROBANTES: {
  key: TipoComprobante;
  label: string;
  desc: string;
  icon: typeof Receipt;
  color: string;
  bgGradient: string;
}[] = [
  {
    key: "BOLETA",
    label: "Boleta de Venta",
    desc: "Para consumidor final — requiere DNI",
    icon: Receipt,
    color: "text-sky-600",
    bgGradient: "from-sky-50 to-sky-100/60",
  },
  {
    key: "FACTURA",
    label: "Factura Electrónica",
    desc: "Para empresa — requiere RUC 11 dígitos",
    icon: FileText,
    color: "text-violet-600",
    bgGradient: "from-violet-50 to-violet-100/60",
  },
  {
    key: "NOTA_VENTA",
    label: "Nota de Venta",
    desc: "Venta simplificada — sin datos de cliente",
    icon: StickyNote,
    color: "text-amber-600",
    bgGradient: "from-amber-50 to-amber-100/60",
  },
];

const METODOS_PAGO: {
  key: MetodoPago;
  label: string;
  icon: typeof Banknote;
  color: string;
}[] = [
  { key: "EFECTIVO", label: "Efectivo", icon: Banknote, color: "text-emerald-600" },
  { key: "TARJETA", label: "Tarjeta", icon: CreditCard, color: "text-blue-600" },
  { key: "YAPE_PLIN", label: "Yape / Plin", icon: Smartphone, color: "text-purple-600" },
  { key: "TRANSFERENCIA", label: "Transferencia", icon: Landmark, color: "text-orange-600" },
];

const PASO_LABELS = ["Comprobante", "Datos y Pago", "Impresión"];

export default function CheckoutModal({
  open,
  onClose,
  carrito,
  montoBrutoFinal,
  tipoPago,
  onVentaExitosa,
  clientePreseleccionado,
}: Props) {
  const queryClient = useQueryClient();
  const [paso, setPaso] = useState(0);
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    tipo_documento: "NINGUNO",
    numero_documento: "",
    nombre_razon_social: "",
    direccion: "",
  });
  const [animatingOut, setAnimatingOut] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [procesando, setProcesando] = useState(false);
  const [errorVenta, setErrorVenta] = useState<string | null>(null);
  const [consultandoPadron, setConsultandoPadron] = useState(false);
  const [origenBadge, setOrigenBadge] = useState<string | null>(null);
  const [showImpresionModal, setShowImpresionModal] = useState(false);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<"80mm" | "58mm" | "A4" | "xml">("80mm");
  const [comprobanteEmitidoSnapshot, setComprobanteEmitidoSnapshot] = useState<ComprobanteData | null>(null);
  const [comprobanteLink, setComprobanteLink] = useState<ReceiptLink | null>(null);
  const [estadoComprobante, setEstadoComprobante] = useState<EstadoComprobanteVenta | null>(null);
  const [mensajeComprobante, setMensajeComprobante] = useState<string | null>(null);
  const [imprimiendoDirecto, setImprimiendoDirecto] = useState(false);
  const [errorImpresion, setErrorImpresion] = useState<string | null>(null);

  // Configuración tributaria de la empresa (régimen, ambiente SUNAT)
  const { data: configTributaria } = useQuery({
    queryKey: ["config-tributaria"],
    queryFn: () => facturacionService.obtenerConfiguracion(),
    staleTime: 60_000,
    retry: false,
  });
  // Matriz de emisión: qué puede emitir la empresa según su RUC/régimen.
  // Sin configuración tributaria no se ofrecen comprobantes electrónicos.
  const comprobantesPermitidos = configTributaria?.comprobantes_permitidos ?? [];
  const motivoBloqueoComprobante = (key: TipoComprobante): string | null => {
    if (key === "NOTA_VENTA") return null; // documento interno, no SUNAT
    if (!configTributaria) {
      return "Configura primero la facturación electrónica (Administración → Facturación)";
    }
    const tipo = key === "FACTURA" ? "01" : "03";
    if (!comprobantesPermitidos.includes(tipo)) {
      return configTributaria.regimen_tributario === "NUEVO_RUS" && tipo === "01"
        ? "Una empresa en Nuevo RUS no puede emitir facturas"
        : `El régimen ${configTributaria.regimen_tributario} no permite emitir ${key === "FACTURA" ? "facturas" : "boletas"}`;
    }
    return null;
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      setPaso(0);
      setTipoComprobante(null);
      setMetodoPago("EFECTIVO");
      setMontoRecibido("");
      if (clientePreseleccionado) {
        setDatosCliente({
          tipo_documento: clientePreseleccionado.tipo_documento as any,
          numero_documento: clientePreseleccionado.numero_documento,
          nombre_razon_social: clientePreseleccionado.nombre,
          direccion: clientePreseleccionado.direccion || "",
        });
      } else {
        setDatosCliente({
          tipo_documento: "NINGUNO",
          numero_documento: "",
          nombre_razon_social: "",
          direccion: "",
        });
      }
      setAnimatingOut(false);
      setProcesando(false);
      setErrorVenta(null);
      setConsultandoPadron(false);
      setOrigenBadge(null);
      setComprobanteEmitidoSnapshot(null);
      setComprobanteLink(null);
      setEstadoComprobante(null);
      setMensajeComprobante(null);
    }
  }, [open, clientePreseleccionado]);

  const handleConsultarPadron = async (numeroDoc: string, tipoDocOverride?: string) => {
    const tipoDoc = tipoDocOverride || (tipoComprobante === "BOLETA" ? "DNI" : tipoComprobante === "FACTURA" ? "RUC" : "DNI");
    const esValido = (tipoDoc === "DNI" && numeroDoc.length === 8) || (tipoDoc === "RUC" && numeroDoc.length === 11);
    if (!numeroDoc || !esValido) {
      return;
    }


    setConsultandoPadron(true);
    setOrigenBadge(null);

    try {
      const res = await clientesService.consultarDocumentoPadron(tipoDoc, numeroDoc);
      if (res.encontrado && res.nombre) {
        setDatosCliente((prev) => ({
          ...prev,
          tipo_documento: tipoDoc as any,
          numero_documento: numeroDoc,
          nombre_razon_social: res.nombre,
          direccion: res.direccion || prev.direccion,
        }));
        setOrigenBadge(res.origen);
      }
    } catch (err) {
      console.error("Error al consultar padrón:", err);
    } finally {
      setConsultandoPadron(false);
    }
  };


  const handleEmitirVenta = async () => {
    if (!tipoComprobante) return;

    // Bloqueo por matriz de emisión (RUC/régimen) — defensa adicional al backend
    const motivoBloqueo = motivoBloqueoComprobante(tipoComprobante);
    if (motivoBloqueo) {
      setErrorVenta(motivoBloqueo);
      setProcesando(false);
      return;
    }

    // Pre-validaciones por normativa SUNAT
    if (tipoComprobante === "FACTURA") {
      const ruc = (datosCliente.numero_documento || "").trim();
      if (!ruc || ruc.length !== 11) {
        setErrorVenta("Para Factura Electrónica es obligatorio un RUC de 11 dígitos.");
        setProcesando(false);
        return;
      }
    }

    if (tipoComprobante === "BOLETA" && montoBrutoFinal >= 700) {
      const numDoc = (datosCliente.numero_documento || "").trim();
      if (!numDoc || numDoc.length < 8) {
        setErrorVenta("Por normativa SUNAT, para Boletas iguales o mayores a S/ 700.00 es obligatorio ingresar DNI (8 dígitos) o CE del cliente.");
        setProcesando(false);
        return;
      }
    }

    setProcesando(true);
    setErrorVenta(null);

    try {
      idempotencyKeyRef.current ??= nuevaClaveIdempotencia();
      const payload = buildVentaPayload({
        idempotencyKey: idempotencyKeyRef.current,
        tipoComprobante,
        tipoPago,
        metodoPago,
        montoRecibido,
        datosCliente,
        carrito,
      });

      const ventaRegistrada = await ventasService.registrarVenta(payload);
      let estado = estadoComprobanteDe(ventaRegistrada);
      let mensaje = ventaRegistrada.comprobante_error
        || ventaRegistrada.comprobante?.mensaje
        || null;

      // Emisión electrónica SUNAT (boleta/factura). La venta ya quedó
      // registrada: si SUNAT falla, el comprobante queda reintentable.
      if (tipoComprobante === "BOLETA" || tipoComprobante === "FACTURA") {
        try {
          const series = await ventasService.getSeriesDocumentos();
          const sucursalActual = localStorage.getItem("sucursalId");
          const candidatas = (Array.isArray(series) ? series : []).filter(
            (s: any) => s.activo && s.tipo_documento === tipoComprobante,
          );
          const serie =
            candidatas.find((s: any) => s.sucursal_id && s.sucursal_id === sucursalActual)
            || candidatas.find((s: any) => !s.sucursal_id)
            || candidatas[0];

          if (!serie) {
            estado = "PENDIENTE";
            mensaje = `No hay serie activa para ${tipoComprobante === "FACTURA" ? "facturas" : "boletas"}; emita el comprobante desde el historial.`;
          } else {
            const emitido = await facturacionService.emitir({
              ventaId: ventaRegistrada.venta_id,
              tipoComprobante: tipoComprobante === "FACTURA" ? "01" : "03",
              serieId: serie.id,
            });
            estado = emitido.estado.startsWith("ACEPTADO") ? "GENERADO" : "ERROR";
            mensaje = emitido.mensaje_respuesta
              || (emitido.estado.startsWith("ACEPTADO")
                ? `Comprobante ${emitido.numero} aceptado por SUNAT`
                : `Comprobante ${emitido.numero} en estado ${emitido.estado}; puede reintentarlo desde el historial.`);
          }
        } catch (errEmision: any) {
          estado = "PENDIENTE";
          mensaje = `La venta se registró; el comprobante quedó pendiente (${errEmision.message || "error de emisión"}).`;
        }
      }

      setEstadoComprobante(estado);
      setMensajeComprobante(
        mensaje
          || (estado === "PENDIENTE" ? "La venta quedó registrada; el comprobante todavía está pendiente." : null),
      );
      setComprobanteLink(enlaceComprobante(
        ventaRegistrada.comprobante_url,
        ventaRegistrada.comprobante_token,
      ));

      await queryClient.invalidateQueries({ queryKey: ["productos"] });

      const snapshot = buildComprobanteSnapshot({
        venta: ventaRegistrada,
        tipoComprobante,
        datosCliente,
        carrito,
        metodoPago,
        montoRecibido,
      });
      setComprobanteEmitidoSnapshot(snapshot);
      idempotencyKeyRef.current = null;

      if (onVentaExitosa) {
        onVentaExitosa();
      }
      
      setSlideDir("left");
      setPaso(2);
    } catch (err: any) {
      console.error("Error al registrar venta:", err);
      setErrorVenta(err.message || "Error al procesar la venta en el servidor");
    } finally {
      setProcesando(false);
    }
  };

  const handleClose = () => {
    idempotencyKeyRef.current = null;
    setAnimatingOut(true);
    setTimeout(() => {
      setAnimatingOut(false);
      onClose();
    }, 200);
  };

  const handleImprimirDirecto = async () => {
    if (!comprobanteEmitidoSnapshot) return;

    const config = loadPrinterConfiguration();
    const validation = validatePrinterConfiguration(config);
    if (!validation.valid) {
      setErrorImpresion(
        "No hay impresora configurada. Ve a Admin > Impresión para configurar tu impresora térmica.",
      );
      return;
    }

    setImprimiendoDirecto(true);
    setErrorImpresion(null);

    try {
      const receipt: ReceiptData = {
        company: {
          commercialName: "BOTICA MARIFARMA",
          legalName: "BOTICA MARIFARMA SAC",
          ruc: "20612345678",
          address: "Av. Javier Prado 1234, San Isidro, Lima",
          phone: "(01) 456-7890",
        },
        document: {
          type: comprobanteEmitidoSnapshot.tipoComprobante,
          series: comprobanteEmitidoSnapshot.serieNumero.split("-")[0] || "",
          number: comprobanteEmitidoSnapshot.serieNumero.split("-")[1] || "",
          issuedAt: comprobanteEmitidoSnapshot.fechaEmision,
        },
        branch: { name: "Sucursal Principal" },
        customer: {
          name: comprobanteEmitidoSnapshot.cliente.nombre,
          documentType: comprobanteEmitidoSnapshot.cliente.tipoDocumento,
          documentNumber: comprobanteEmitidoSnapshot.cliente.numeroDocumento,
        },
        items: comprobanteEmitidoSnapshot.items.map((item, idx) => ({
          id: String(idx + 1),
          name: item.descripcion,
          quantity: item.cantidad,
          unitPrice: item.precioUnitario,
          subtotal: item.subtotal,
        })),
        totals: {
          subtotal: comprobanteEmitidoSnapshot.subtotal,
          igv: comprobanteEmitidoSnapshot.igv,
          total: comprobanteEmitidoSnapshot.total,
        },
        payment: {
          method: comprobanteEmitidoSnapshot.metodoPago || "EFECTIVO",
          amountReceived: comprobanteEmitidoSnapshot.montoRecibido,
          change: comprobanteEmitidoSnapshot.vuelto,
        },
      };

      const result = await printerService.printReceipt(receipt);

      if (!result.success) {
        setErrorImpresion(result.message);
      }
    } catch (err) {
      setErrorImpresion("Error al imprimir. Verifique que QZ Tray esté abierto y la impresora encendida.");
    } finally {
      setImprimiendoDirecto(false);
    }
  };

  const vuelto =
    metodoPago === "EFECTIVO" && montoRecibido
      ? parseFloat(montoRecibido) - montoBrutoFinal
       : 0;

  const canNext = (): boolean => {
    if (paso === 0) return tipoComprobante !== null;
    if (paso === 1) {
      // Boleta: DNI/CE obligatorio solo cuando monto >= 700
      if (tipoComprobante === "BOLETA" && montoBrutoFinal >= 700) {
        const numDoc = datosCliente.numero_documento.trim();
        // Acepta DNI (8 dígitos) o CE (7-12 chars)
        const esValido = numDoc.length === 8 || (numDoc.length >= 7 && numDoc.length <= 12 && datosCliente.tipo_documento === "CE");
        if (!esValido) return false;
      }
      // Factura: RUC obligatorio siempre
      if (tipoComprobante === "FACTURA") {
        if (datosCliente.numero_documento.length !== 11) return false;
        if (!datosCliente.nombre_razon_social.trim()) return false;
      }
      // Efectivo: monto recibido debe ser >= total
      if (metodoPago === "EFECTIVO" && (!montoRecibido || parseFloat(montoRecibido) < montoBrutoFinal)) return false;
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (!canNext()) return;
    setSlideDir("left");
    setPaso((p) => Math.min(p + 1, 2));
  };

  const goBack = () => {
    setSlideDir("right");
    setPaso((p) => Math.max(p - 1, 0));
  };

  /* auto-set tipo_documento when comprobante changes */
  useEffect(() => {
    if (tipoComprobante === "BOLETA") {
      setDatosCliente((d) => ({ ...d, tipo_documento: "DNI", direccion: "" }));
    } else if (tipoComprobante === "FACTURA") {
      setDatosCliente((d) => ({ ...d, tipo_documento: "RUC" }));
    } else {
      setDatosCliente({
        tipo_documento: "NINGUNO",
        numero_documento: "",
        nombre_razon_social: "",
        direccion: "",
      });
    }
  }, [tipoComprobante]);

  if (!open) return null;

   return (
    <>
      <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4
        transition-all duration-200
        ${animatingOut ? "bg-black/0 backdrop-blur-none" : "bg-black/60 backdrop-blur-sm"}`}
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden
          transition-all duration-200 origin-center
          ${animatingOut ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
      >
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Procesando Venta</h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {tipoPago === "CONTADO" && "Pago al Contado"}
                {tipoPago === "ABONO" && "Registro de Abono"}
                {tipoPago === "ANTICIPO" && "Uso de Anticipo"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            {PASO_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${i < paso
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                      : i === paso
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-4 ring-teal-100"
                        : "bg-slate-200 text-slate-500"
                    }`}
                >
                  {i < paso ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block transition-colors
                    ${i <= paso ? "text-slate-800" : "text-slate-400"}`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-colors duration-300
                      ${i < paso ? "bg-teal-400" : "bg-slate-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {errorVenta && (
          <div className="mx-5 mt-3 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            <span className="font-bold">Error:</span> {errorVenta}
          </div>
        )}


        <div className="flex-1 overflow-y-auto">
          <div
            key={paso}
            className={`p-5 animate-slideIn`}
            style={{
              // @ts-expect-error CSS custom property
              "--slide-from": slideDir === "left" ? "24px" : "-24px",
            }}
          >
                {paso === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Selecciona el Comprobante
                  </h3>
                  <p className="text-xs text-slate-500">
                    Elige el tipo de documento tributario para esta venta
                  </p>
                </div>

                <div className="grid gap-3">
                  {COMPROBANTES.map((c) => {
                    const Icon = c.icon;
                    const selected = tipoComprobante === c.key;
                    const motivoBloqueo = motivoBloqueoComprobante(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        disabled={Boolean(motivoBloqueo)}
                        title={motivoBloqueo ?? undefined}
                        onClick={() => !motivoBloqueo && setTipoComprobante(c.key)}
                        className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                          ${motivoBloqueo ? "opacity-40 cursor-not-allowed border-slate-200 bg-slate-50" : ""}
                          ${selected
                            ? `border-teal-500 bg-gradient-to-r ${c.bgGradient} shadow-md shadow-teal-500/10 ring-2 ring-teal-200`
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0
                              ${selected ? "bg-white shadow-sm" : "bg-slate-100"}`}
                          >
                            <Icon className={`w-6 h-6 ${c.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800">{c.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                            {motivoBloqueo && (
                              <p className="text-[10px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {motivoBloqueo}
                              </p>
                            )}
                          </div>
                          {selected && (
                            <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">
                      {carrito.length} producto{carrito.length !== 1 ? "s" : ""} en carrito
                    </span>
                    <span className="text-sm font-black text-teal-700">
                      {formatMoney(montoBrutoFinal)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {paso === 1 && (
              <div className="space-y-5">
                {tipoComprobante !== "NOTA_VENTA" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      Datos del Cliente
                    </h3>

                    {tipoComprobante === "BOLETA" && montoBrutoFinal >= 700 && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2.5 shadow-sm">
                        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <strong className="font-extrabold text-amber-950 block">Normativa SUNAT (Monto ≥ S/ 700.00):</strong>
                          <span>Para Boletas de venta de S/ 700.00 a más, es obligatorio identificar al cliente con su DNI (8 dígitos) o CE.</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                          {tipoComprobante === "BOLETA" ? "DNI (8 dígitos)" : "RUC (11 dígitos)"}
                        </label>
                        {origenBadge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fadeIn">
                            ✓ Verificado en {origenBadge}
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          maxLength={tipoComprobante === "BOLETA" ? 8 : 11}
                          value={datosCliente.numero_documento}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            setDatosCliente((d) => ({ ...d, numero_documento: v }));
                            setOrigenBadge(null);
                            const targetLen = tipoComprobante === "BOLETA" ? 8 : 11;
                            if (v.length === targetLen) {
                              handleConsultarPadron(v);
                            }
                          }}
                          placeholder={tipoComprobante === "BOLETA" ? "Ej: 72456189" : "Ej: 20123456789"}
                          className="w-full pl-10 pr-24 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                            focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                            placeholder:text-slate-300 font-mono tracking-wider transition"
                        />
                        <button
                          type="button"
                          disabled={consultandoPadron || !datosCliente.numero_documento}
                          onClick={() => handleConsultarPadron(datosCliente.numero_documento)}
                          className="absolute right-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-lg transition active:scale-95 flex items-center gap-1 cursor-pointer"
                        >
                          {consultandoPadron ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Buscar</span>
                          )}
                        </button>
                      </div>
                    </div>


                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                        {tipoComprobante === "BOLETA" ? "Nombre Completo" : "Razón Social"}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={datosCliente.nombre_razon_social}
                          onChange={(e) =>
                            setDatosCliente((d) => ({
                              ...d,
                              nombre_razon_social: e.target.value,
                            }))
                          }
                          placeholder={
                            tipoComprobante === "BOLETA"
                              ? "Juan Pérez García"
                              : "FARMACIA SAM S.A.C."
                          }
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                            focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                            placeholder:text-slate-300 transition"
                        />
                      </div>
                    </div>

                    {tipoComprobante === "FACTURA" && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                          Dirección Fiscal
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={datosCliente.direccion}
                            onChange={(e) =>
                              setDatosCliente((d) => ({ ...d, direccion: e.target.value }))
                            }
                            placeholder="Av. Ejemplo 123, Lima"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                              focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                              placeholder:text-slate-300 transition"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tipoComprobante === "NOTA_VENTA" && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <StickyNote className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-bold">Nota de Venta</span> — No requiere datos del
                      cliente. Este comprobante no tiene valor tributario.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Método de Pago
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {METODOS_PAGO.map((m) => {
                      const Icon = m.icon;
                      const selected = metodoPago === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setMetodoPago(m.key)}
                          className={`p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3
                            ${selected
                              ? "border-teal-500 bg-teal-50/60 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${selected ? "text-teal-600" : m.color} transition`}
                          />
                          <span
                            className={`text-xs font-bold ${selected ? "text-teal-700" : "text-slate-700"}`}
                          >
                            {m.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {metodoPago === "EFECTIVO" && (
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider block mb-1">
                        Monto Recibido
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-600">
                          S/
                        </span>
                        <input
                          type="number"
                          step="0.10"
                          min={0}
                          value={montoRecibido}
                          onChange={(e) => setMontoRecibido(e.target.value)}
                          placeholder={montoBrutoFinal.toFixed(2)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm font-bold rounded-xl border border-emerald-300 bg-white
                            focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400
                            placeholder:text-emerald-300 transition font-mono text-right"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                        <Calculator className="w-3.5 h-3.5" />
                        Vuelto
                      </div>
                      <span
                        className={`text-lg font-black tabular-nums ${vuelto >= 0 ? "text-emerald-700" : "text-rose-600"}`}
                      >
                        {formatMoney(Math.max(vuelto, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paso === 2 && (
          <div
            className={`animate-in slide-in-from-${slideDir === "left" ? "right" : "left"}-8 fade-in duration-300`}
          >
                <div className="flex flex-col items-center text-center p-6 space-y-6">
                  
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">¡Venta Registrada!</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                      {estadoComprobante === "GENERADO"
                        ? "El backend generó el comprobante. Selecciona un formato para imprimir."
                        : estadoComprobante === "NO_APLICA"
                          ? "La nota de venta quedó registrada correctamente."
                          : "La venta quedó registrada, pero el comprobante aún no está disponible."}
                    </p>
                  </div>

                  {(estadoComprobante === "PENDIENTE" || estadoComprobante === "ERROR") && (
                    <div className={`w-full rounded-xl border px-4 py-3 text-left text-xs font-semibold ${estadoComprobante === "ERROR" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                      {mensajeComprobante || "El comprobante está pendiente. Podrás consultarlo nuevamente desde el historial de ventas."}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl mt-4">
                    <button
                      onClick={() => {
                        setFormatoSeleccionado("58mm");
                        setShowImpresionModal(true);
                      }}
                      className="group flex flex-col items-center gap-2 p-3 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-teal-50 text-slate-500 group-hover:text-teal-600 rounded-xl flex items-center justify-center transition-colors">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-xs text-slate-700 group-hover:text-teal-700">Ticket 58mm</span>
                        <span className="text-[9px] text-slate-400 font-medium">Impresora pequeña</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFormatoSeleccionado("80mm");
                        setShowImpresionModal(true);
                      }}
                      className="group flex flex-col items-center gap-2 p-3 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-teal-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                        POPULAR
                      </div>
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-teal-50 text-slate-500 group-hover:text-teal-600 rounded-xl flex items-center justify-center transition-colors">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-xs text-slate-700 group-hover:text-teal-700">Ticket 80mm</span>
                        <span className="text-[9px] text-slate-400 font-medium">Estándar POS</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFormatoSeleccionado("A4");
                        setShowImpresionModal(true);
                      }}
                      className="group flex flex-col items-center gap-2 p-3 bg-white border-2 border-slate-200 hover:border-teal-500 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-teal-50 text-slate-500 group-hover:text-teal-600 rounded-xl flex items-center justify-center transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-xs text-slate-700 group-hover:text-teal-700">Formato A4</span>
                        <span className="text-[9px] text-slate-400 font-medium">Impresora clásica</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setFormatoSeleccionado("xml");
                        setShowImpresionModal(true);
                      }}
                      className="group flex flex-col items-center gap-2 p-3 bg-white border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-xs text-indigo-700">Modelo XML</span>
                        <span className="text-[9px] text-indigo-500 font-medium">UBL 2.1 SUNAT</span>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => void handleImprimirDirecto()}
                    disabled={imprimiendoDirecto || !comprobanteEmitidoSnapshot}
                    className="flex items-center justify-center gap-2 w-full max-w-xl mt-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Printer className="w-5 h-5" />
                    {imprimiendoDirecto ? "Imprimiendo..." : "Imprimir Directo (QZ Tray)"}
                  </button>

                  {errorImpresion && (
                    <div className="w-full max-w-xl mt-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium space-y-2">
                      <p>{errorImpresion}</p>
                      {errorImpresion.includes("No hay impresora configurada") && (
                        <a
                          href="/admin/impresion"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition"
                        >
                          <Settings className="w-3 h-3" />
                          Configurar Impresora
                        </a>
                      )}
                    </div>
                  )}
                  {comprobanteLink && (
                    <div className="flex w-full max-w-xl flex-col items-center gap-2">
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => void navigator.clipboard.writeText(comprobanteLink.url)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          <Copy size={14}/>
                          {comprobanteLink.externallyShareable ? "Copiar enlace público" : "Copiar enlace local"}
                        </button>
                        {comprobanteLink.externallyShareable && (
                          <button
                            type="button"
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Tu comprobante: ${comprobanteLink.url}`)}`, "_blank", "noopener,noreferrer")}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                          >
                            <Share2 size={14}/>
                            Compartir WhatsApp
                          </button>
                        )}
                      </div>
                      {comprobanteLink.warning && (
                        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-[11px] font-semibold text-amber-800">
                          {comprobanteLink.warning}
                        </p>
                      )}
                    </div>
                  )}
                  
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {paso === 2 ? (
            <div className="w-full flex justify-end">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-200 hover:bg-slate-300
                  px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar y Continuar
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {paso > 0 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800
                    px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Atrás
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700
                    px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}

              {paso < 1 ? (
                <button
                  onClick={goNext}
                  disabled={!canNext()}
                  className="flex items-center gap-1.5 text-xs font-bold text-white
                    px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200
                    disabled:text-slate-400 shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleEmitirVenta}
                  disabled={procesando}
                  className="flex items-center gap-2 text-xs font-bold text-white
                    px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 shadow-md
                    shadow-emerald-500/20 transition active:scale-[0.98] cursor-pointer"
                >
                  {procesando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      PROCESANDO...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      CONFIRMAR Y EMITIR
                      <Printer className="w-4 h-4 ml-1 opacity-70" />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>


      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(var(--slide-from, 24px)); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out both;
        }
      `}</style>
    </div>

    <ImpresionComprobanteModal
      open={showImpresionModal}
      onClose={() => setShowImpresionModal(false)}
      formatoInicial={formatoSeleccionado}
      comprobante={comprobanteEmitidoSnapshot}
    />
    </>
  );
}
