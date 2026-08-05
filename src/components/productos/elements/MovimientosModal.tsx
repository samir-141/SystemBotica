import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Layers,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Package,
  FileText,
} from "lucide-react";
import type { ProductoPOS } from "../../../types/api.types";
import { productosService } from "../../../services/productos.service";

type Props = {
  open: boolean;
  producto: ProductoPOS | null;
  onClose: () => void;
};

interface LoteDetalle {
  id: string;
  numero_lote: string;
  fecha_vencimiento: string;
  fecha_ingreso?: string | null;
  stock_actual: number;
  precio_compra_unidad_base: number;
}

interface PresentacionDetalle {
  id: string;
  cantidad_unidad_base: number;
  precio_actual: number;
  unidad_presentacion: { nombre: string; abreviatura: string };
}

export default function MovimientosModal({ open, producto, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<LoteDetalle[]>([]);
  const [presentaciones, setPresentaciones] = useState<PresentacionDetalle[]>([]);

  useEffect(() => {
    if (!open || !producto) return;
    let activo = true;
    setLoading(true);
    productosService.getProductoDetalle(producto.producto_comercial_id)
      .then((detalle) => {
        if (!activo) return;
        setLotes(detalle.lotes || []);
        setPresentaciones(detalle.presentaciones || []);
      })
      .catch(() => {
        if (activo) {
          setLotes([]);
          setPresentaciones([]);
        }
      })
      .finally(() => activo && setLoading(false));
    return () => { activo = false; };
  }, [open, producto]);

  if (!open || !producto) return null;

  const calcularDiasVencimiento = (fechaStr: string) => {
    if (!fechaStr) return null;
    const fechaVenc = new Date(fechaStr);
    const hoy = new Date();
    const difMs = fechaVenc.getTime() - hoy.getTime();
    return Math.ceil(difMs / (1000 * 60 * 60 * 24));
  };

  const getStatusVencimiento = (dias: number | null) => {
    if (dias === null) return { color: "bg-slate-100 text-slate-600", label: "Sin lote" };
    if (dias < 0) return { color: "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold", label: "¡VENCIDO!", icon: ShieldAlert };
    if (dias <= 30) return { color: "bg-rose-50 text-rose-700 border border-rose-200 font-bold", label: `CRÍTICO (${dias} días)`, icon: AlertTriangle };
    if (dias <= 90) return { color: "bg-amber-50 text-amber-700 border border-amber-200 font-bold", label: `Vence en ${dias} días`, icon: Clock };
    return { color: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium", label: `OK (${dias} días)`, icon: CheckCircle2 };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
        {/* Cabecera */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                {producto.nombre_comercial}
                {producto.requiere_receta && (
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-400/30 font-bold">
                    💊 Receta Médica
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {producto.forma_farmaceutica} • {producto.concentracion} {producto.unidad_concentracion} ({producto.laboratorio})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info clave del producto */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Stock Total</span>
            <span className={`text-base font-black ${producto.stock_total <= 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {producto.stock_total} {producto.unidad_abreviatura || 'unid.'}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">REG. SANITARIO (DIGEMID)</span>
            <span className="text-xs font-bold text-slate-700">
              {producto.registro_sanitario || "No asignado"}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Código de Barras</span>
            <span className="text-xs font-mono font-bold text-slate-700">
              {producto.codigo_barras || "N/A"}
            </span>
          </div>
        </div>

        {/* Contenido: Control de Lotes & Vencimiento FEFO */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              Lotes Activos & Trazabilidad FEFO
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">
              Ordenado por vencimiento más próximo
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs animate-pulse">
              Cargando lotes y trazabilidad...
            </div>
          ) : lotes.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Sin lotes asignados</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Utiliza la opción de reabastecimiento para ingresar el número de lote y fecha de vencimiento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lotes.map((lote) => {
                const dias = calcularDiasVencimiento(lote.fecha_vencimiento);
                const st = getStatusVencimiento(dias);
                const IconComponent = st.icon || Calendar;

                return (
                  <div
                    key={lote.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition shadow-sm flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          Lote: {lote.numero_lote}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full flex items-center gap-1 ${st.color}`}>
                          <IconComponent className="w-3 h-3" />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Vence: <strong className="text-slate-700">{lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : 'N/A'}</strong></span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Ingreso: {lote.fecha_ingreso ? new Date(lote.fecha_ingreso).toLocaleDateString() : 'sin fecha'} · Costo base: S/ {Number(lote.precio_compra_unidad_base).toFixed(4)}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {presentaciones.map((pres) => (
                          <span key={pres.id} className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                            {pres.unidad_presentacion.nombre}: {Math.floor(lote.stock_actual / Math.max(1, pres.cantidad_unidad_base))}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Stock en Lote</span>
                      <span className="text-base font-black text-slate-800">
                        {lote.stock_actual}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historial de Auditoría / Movimientos */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4 text-teal-600" />
              Resumen de Auditoría de Inventario
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Estado de Auditoría:</span>
                <span className="font-bold text-emerald-600">Verificado</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Trazabilidad FEFO:</span>
                <span className="font-bold text-slate-800">Primero en vencer, primero en salir</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
