import { useState } from "react";
import { Pen, Calendar, Layers, Package, AlertTriangle } from "lucide-react";
import type { ProductoItem, Lote } from "./elementosglobales/types";
import EditarModulo from "./modulos/Editar.modulo";

interface ProductoElementoProps {
    item: ProductoItem;
    lotes?: Lote[];                    // ← Nuevo: pasamos los lotes del producto
    onAgregar?: (producto: ProductoItem, loteId: string, cantidad: number) => void;
}

export default function ProductoElemento({ item, lotes = [] }: ProductoElementoProps) {
    const [open, setOpen] = useState(false);

    // Filtrar lotes de este producto
    const lotesProducto = lotes.filter(l => l.producto_id === item.id);

    // Calcular stock total
    const stockTotal = lotesProducto.reduce((sum, lote) => sum + lote.stock, 0);

    // Encontrar lote más próximo a vencer (para mostrar alerta)
    const loteMasCritico = lotesProducto
        .filter(l => l.stock > 0)
        .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())[0];

    const fechaVencimientoCritica = loteMasCritico?.fecha_vencimiento;
    const estaVencido = fechaVencimientoCritica ? new Date(fechaVencimientoCritica) < new Date() : false;
    const stockBajo = stockTotal <= (loteMasCritico?.stock_minimo || 20);

    const precioFormateado = typeof item.precio_venta === "number"
        ? item.precio_venta.toFixed(2)
        : "0.00";

    return (
        <>
            <div className="flex flex-col justify-between h-full min-h-[280px] p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">

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

                    {/* SKU y Laboratorio */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                            {item.sku}
                        </span>
                    </div>

                    {/* Información técnica */}
                    <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">

                        <div className="flex items-center gap-2">
                            <Package size={14} className="text-slate-400 shrink-0" />
                            <span>
                                Stock Total:{" "}
                                <strong className={`font-semibold ${stockBajo ? 'text-amber-600' : 'text-slate-700'}`}>
                                    {stockTotal} {item.unidad}
                                </strong>
                                {stockBajo && (
                                    <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                        BAJO
                                    </span>
                                )}
                            </span>
                        </div>

                        {loteMasCritico && (
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400 shrink-0" />
                                <span className="flex items-center gap-1">
                                    Vence:
                                    <strong className={estaVencido ? "text-rose-600 font-semibold" : "text-slate-700"}>
                                        {fechaVencimientoCritica}
                                    </strong>
                                    {estaVencido && (
                                        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold animate-pulse">
                                            <AlertTriangle size={12} />
                                            VENCIDO
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}

                        {lotesProducto.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Layers size={14} className="text-slate-400 shrink-0" />
                                <span>
                                    Lotes activos: <strong className="text-slate-700">{lotesProducto.length}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="mt-5 border-t border-slate-100 pt-4 space-y-2">
                    <button
                        onClick={() => setOpen(true)}
                        type="button"
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Pen size={14} />
                        Editar Medicamento
                    </button>

                    {stockTotal > 0 && (
                        <button
                            onClick={() => {/* Lógica para agregar al carrito */ }}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            Agregar a Venta
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Edición */}
            {open && (
                <EditarModulo
                    item={item}
                    lotes={lotesProducto}   // ← Pasamos los lotes también
                    setModal={setOpen}
                />
            )}
        </>
    );
}