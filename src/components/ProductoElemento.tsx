import { useState } from "react";
import { Pen, Calendar, Layers, Package } from "lucide-react";
import type { ProductoItem } from "./elementosglobales/types";
import EditarModulo from "./modulos/Editar.modulo";

interface ProductoElementoProps {
    item: ProductoItem;
    onAgregar?: (producto: ProductoItem, cantidad: number) => void;
}

export default function ProductoElemento({ item }: ProductoElementoProps) {
    const [open, setOpen] = useState(false);

    // Validación de fecha de vencimiento
    const vencido = new Date(item.fecha_vencimiento) < new Date();

    // Formatear precio seguro
    const precioFormateado =
        typeof item.precio_venta === "number"
            ? item.precio_venta.toFixed(2)
            : "0.00";

    return (
        <>
            <div className="flex flex-col justify-between h-full min-h-[260px] p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">

                {/* Información del producto */}
                <div className="space-y-3">

                    {/* Nombre y Precio */}
                    <div className="flex justify-between items-start gap-3">
                        <h3
                            className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 flex-1"
                            title={item.nombre}
                        >
                            {item.nombre}
                        </h3>

                        <span className="text-xs font-bold text-teal-600 bg-teal-50/80 px-2.5 py-1 rounded-lg shrink-0">
                            S/ {precioFormateado}
                        </span>
                    </div>

                    {/* SKU */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                            {item.sku}
                        </span>
                    </div>

                    {/* Información técnica */}
                    <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-2.5">

                        <div className="flex items-center gap-2">
                            <Package size={14} className="text-slate-400 shrink-0" />
                            <span>
                                Stock:{" "}
                                <strong className="text-slate-700">
                                    {item.stock_total} u.
                                </strong>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-slate-400 shrink-0" />
                            <span>
                                Lote:{" "}
                                <strong className="text-slate-700">
                                    {item.nombre_lote || "S/L"}
                                </strong>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <span className="flex items-center gap-1">
                                Vence:
                                <strong
                                    className={
                                        vencido
                                            ? "text-rose-600 font-semibold"
                                            : "text-slate-700"
                                    }
                                >
                                    {item.fecha_vencimiento}
                                </strong>

                                {vencido && (
                                    <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                                        Vencido
                                    </span>
                                )}
                            </span>
                        </div>

                    </div>
                </div>

                {/* Botón */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                    <button
                        onClick={() => setOpen(true)}
                        type="button"
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        <Pen size={14} />
                        Editar Medicamento
                    </button>
                </div>
            </div>

            {/* Modal */}
            {open && (
                <EditarModulo
                    item={item}
                    setModal={setOpen}
                />
            )}
        </>
    );
}