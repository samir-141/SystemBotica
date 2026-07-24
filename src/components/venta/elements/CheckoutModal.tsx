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
  Store,
  Hash,
  User,
  MapPin,
  Calculator,
  Sparkles,
  Loader2,
} from "lucide-react";
import type {
  ItemCarrito,
  TipoComprobante,
  MetodoPago,
  DatosCliente,
} from "../types";
import { formatMoney } from "../utils";
import { posApi } from "../../api/api.data";


/* ─── props ─────────────────────────────────────────── */
type Props = {
  open: boolean;
  onClose: () => void;
  carrito: ItemCarrito[];
  montoBrutoFinal: number;
  baseImponible: number;
  igvCalculado: number;
  tipoPago: "CONTADO" | "ABONO" | "ANTICIPO";
  onVentaExitosa?: () => void;
};

/* ─── constants ─────────────────────────────────────── */
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

const PASO_LABELS = ["Comprobante", "Datos y Pago", "Ticket"];

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function CheckoutModal({
  open,
  onClose,
  carrito,
  montoBrutoFinal,
  baseImponible,
  igvCalculado,
  tipoPago,
  onVentaExitosa,
}: Props) {
  /* ── state ──────────────────────────────────────────── */
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

  const panelRef = useRef<HTMLDivElement>(null);

  /* reset on open */
  useEffect(() => {
    if (open) {
      setPaso(0);
      setTipoComprobante(null);
      setMetodoPago("EFECTIVO");
      setMontoRecibido("");
      setDatosCliente({
        tipo_documento: "NINGUNO",
        numero_documento: "",
        nombre_razon_social: "",
        direccion: "",
      });
      setAnimatingOut(false);
      setProcesando(false);
      setErrorVenta(null);
      setConsultandoPadron(false);
      setOrigenBadge(null);
    }
  }, [open]);

  const handleConsultarPadron = async (numeroDoc: string, tipoDocOverride?: string) => {
    const tipoDoc = tipoDocOverride || (tipoComprobante === "BOLETA" ? "DNI" : tipoComprobante === "FACTURA" ? "RUC" : "DNI");
    if (!numeroDoc || (tipoDoc === "DNI" && numeroDoc.length !== 8) && (tipoDoc === "RUC" && numeroDoc.length !== 11)) {
      return;
    }

    setConsultandoPadron(true);
    setOrigenBadge(null);

    try {
      const res = await posApi.consultarDocumentoPadron(tipoDoc, numeroDoc);
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
    setProcesando(true);
    setErrorVenta(null);

    try {
      const payload = {
        tipo_comprobante: tipoComprobante,
        tipo_pago: tipoPago,
        metodo_pago: metodoPago,
        monto_recibido: montoRecibido ? parseFloat(montoRecibido) : montoBrutoFinal,
        vuelto: Math.max(vuelto, 0),
        datos_cliente: tipoComprobante !== "NOTA_VENTA" ? datosCliente : undefined,
        subtotal: baseImponible,
        igv: igvCalculado,
        total: montoBrutoFinal,
        items: carrito.map((item) => ({
          producto_comercial_id: item.producto_comercial_id,
          presentacion_nombre: item.presentacion_nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        })),
      };

      await posApi.registrarVenta(payload);

      if (onVentaExitosa) {
        onVentaExitosa();
      }
      handleClose();
    } catch (err: any) {
      console.error("Error al registrar venta:", err);
      setErrorVenta(err.message || "Error al procesar la venta en el servidor");
    } finally {
      setProcesando(false);
    }
  };


  /* close with animation */
  const handleClose = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setAnimatingOut(false);
      onClose();
    }, 200);
  };

  /* ── derived ────────────────────────────────────────── */
  const vuelto =
    metodoPago === "EFECTIVO" && montoRecibido
      ? parseFloat(montoRecibido) - montoBrutoFinal
      : 0;

  /* ── navigation ─────────────────────────────────────── */
  const canNext = (): boolean => {
    if (paso === 0) return tipoComprobante !== null;
    if (paso === 1) {
      if (tipoComprobante === "BOLETA" && datosCliente.numero_documento.length !== 8) return false;
      if (tipoComprobante === "FACTURA" && datosCliente.numero_documento.length !== 11) return false;
      if (tipoComprobante === "FACTURA" && !datosCliente.nombre_razon_social.trim()) return false;
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

  const serieNumero =
    tipoComprobante === "BOLETA"
      ? "B001-00004821"
      : tipoComprobante === "FACTURA"
        ? "F001-00001247"
        : "NV01-00009103";

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
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
        {/* ── HEADER ──────────────────────────────────── */}
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

        {/* ── STEPPER ─────────────────────────────────── */}
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


        {/* ── BODY (steps) ────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div
            key={paso}
            className={`p-5 animate-slideIn`}
            style={{
              // @ts-expect-error CSS custom property
              "--slide-from": slideDir === "left" ? "24px" : "-24px",
            }}
          >
            {/* ═════════ PASO 0 — Tipo de Comprobante ═════════ */}
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
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setTipoComprobante(c.key)}
                        className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200
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
                          </div>
                          {selected && (
                            <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick summary */}
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

            {/* ═════════ PASO 1 — Datos + Método de Pago ═════════ */}
            {paso === 1 && (
              <div className="space-y-5">
                {/* Datos del cliente */}
                {tipoComprobante !== "NOTA_VENTA" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      Datos del Cliente
                    </h3>

                    {/* Nro Documento */}
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


                    {/* Nombre / Razón Social */}
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

                    {/* Dirección (solo factura) */}
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

                {/* Método de pago */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Método de Pago
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
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

                {/* Monto recibido (solo efectivo) */}
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

            {/* ═════════ PASO 2 — Preview del Ticket ═════════ */}
            {paso === 2 && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xs">
                  {/* ticket container */}
                  <div
                    className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-5 shadow-inner
                      font-mono text-[11px] text-slate-700 leading-relaxed relative overflow-hidden"
                  >
                    {/* Decorative top zigzag */}
                    <div className="absolute top-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,white_8px,white_16px)] opacity-50" />

                    {/* Header */}
                    <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3 space-y-0.5">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Store className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-sm text-slate-900 tracking-wide">
                          FARMACIA POS
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500">RUC: 20612345678</p>
                      <p className="text-[9px] text-slate-500">Av. Ejemplo 456, Lima — Perú</p>
                      <p className="text-[9px] text-slate-500">Tel: (01) 234-5678</p>
                    </div>

                    {/* Tipo comprobante + serie */}
                    <div className="text-center mb-3 space-y-0.5">
                      <p className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        {tipoComprobante === "BOLETA" && "BOLETA DE VENTA ELECTRÓNICA"}
                        {tipoComprobante === "FACTURA" && "FACTURA ELECTRÓNICA"}
                        {tipoComprobante === "NOTA_VENTA" && "NOTA DE VENTA"}
                      </p>
                      <p className="text-teal-600 font-bold">{serieNumero}</p>
                    </div>

                    {/* Datos cliente */}
                    {tipoComprobante !== "NOTA_VENTA" && (
                      <div className="border-b border-dashed border-slate-300 pb-2 mb-2 space-y-0.5 text-[10px]">
                        <p>
                          <span className="text-slate-400">
                            {tipoComprobante === "BOLETA" ? "DNI:" : "RUC:"}
                          </span>{" "}
                          {datosCliente.numero_documento || "--------"}
                        </p>
                        <p>
                          <span className="text-slate-400">Cliente:</span>{" "}
                          {datosCliente.nombre_razon_social || "CLIENTE GENERAL"}
                        </p>
                        {tipoComprobante === "FACTURA" && datosCliente.direccion && (
                          <p>
                            <span className="text-slate-400">Dir:</span> {datosCliente.direccion}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Fecha / hora */}
                    <div className="border-b border-dashed border-slate-300 pb-2 mb-2 text-[10px] flex justify-between text-slate-500">
                      <span>
                        {new Date().toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <span>
                        {new Date().toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Items header */}
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase border-b border-dashed border-slate-200 pb-1 mb-1">
                      <span className="flex-1">Descripción</span>
                      <span className="w-8 text-center">Cant</span>
                      <span className="w-14 text-right">P.Unit</span>
                      <span className="w-16 text-right">Subtot</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {carrito.map((item) => (
                        <div key={item.id_carrito} className="flex justify-between text-[10px]">
                          <span className="flex-1 truncate pr-1">
                            {item.nombre_comercial}
                          </span>
                          <span className="w-8 text-center font-bold">{item.cantidad}</span>
                          <span className="w-14 text-right">{item.precio_unitario.toFixed(2)}</span>
                          <span className="w-16 text-right font-bold">
                            {(item.precio_unitario * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-dashed border-slate-300 pt-2 space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Op. Grabada</span>
                        <span>{formatMoney(baseImponible)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IGV (18%)</span>
                        <span>{formatMoney(igvCalculado)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-double border-slate-400 mt-1">
                        <span>TOTAL</span>
                        <span>{formatMoney(montoBrutoFinal)}</span>
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="border-t border-dashed border-slate-300 mt-2 pt-2 text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Método</span>
                        <span className="font-bold">
                          {METODOS_PAGO.find((m) => m.key === metodoPago)?.label}
                        </span>
                      </div>
                      {metodoPago === "EFECTIVO" && montoRecibido && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Recibido</span>
                            <span>{formatMoney(parseFloat(montoRecibido))}</span>
                          </div>
                          <div className="flex justify-between font-bold text-emerald-700">
                            <span>Vuelto</span>
                            <span>{formatMoney(Math.max(vuelto, 0))}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-4 pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400 space-y-1">
                      <p className="font-bold">¡Gracias por su compra!</p>
                      <p>Representación impresa del comprobante electrónico</p>
                      <p>Autorizado mediante Res. N° 0340-2024/SUNAT</p>
                      {/* barcode visual */}
                      <div className="flex items-center justify-center gap-[1px] mt-2 opacity-60">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-slate-700"
                            style={{
                              width: Math.random() > 0.5 ? "2px" : "1px",
                              height: "20px",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Decorative bottom zigzag */}
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,white_8px,white_16px)] opacity-50" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER (navigation) ─────────────────────── */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {paso > 0 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800
                px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Atrás
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700
                px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
          )}

          {paso < 2 ? (
            <button
              onClick={goNext}
              disabled={!canNext()}
              className="flex items-center gap-1.5 text-xs font-bold text-white
                px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200
                disabled:text-slate-400 shadow-sm transition active:scale-[0.98]"
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
        </div>
      </div>


      {/* slide animation style */}
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
  );
}
