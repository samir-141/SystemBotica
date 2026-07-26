import { useState, useEffect, useMemo } from "react";
import { Check, Package, Layers, AlertCircle, ShieldAlert, BellRing, ShoppingCart } from "lucide-react";

export interface PresentacionOption {
    id: string;
    nombre: string;              // Ej: "Caja", "Blíster", "Comprimido"
    cantidad_unidad_base: number; // Ej: 100, 10, 1
    precio: number;               // Precio de esta presentación
}

export interface ProductoItemProps {
    item?: any;
    producto?: any;
    monedas?: { simbolo: string; nombre: string }[];
    monedaActivaIdx?: number;
    onAgregar?: (presentacionSeleccionada: PresentacionOption, equivalencia: number) => void;
    agregarAlCarrito?: (
        producto: any,
        cantidad: number,
        presentacionNombre: string,
        precioUnitario: number
    ) => void;
    onSolicitarReceta?: (producto: any, presentacionSel: PresentacionOption) => void;
    feedbackActive?: boolean;
    feedbackId?: string | null;
    modoPrecio?: string;
}

export default function Item({
    item,
    producto,
    monedas = [{ simbolo: "S/", nombre: "Soles" }],
    monedaActivaIdx = 0,
    onAgregar,
    agregarAlCarrito,
    onSolicitarReceta,
    feedbackActive = false,
    feedbackId = null,
}: ProductoItemProps) {
    const targetItem = item || producto;

    const isFeedback = targetItem ? (feedbackActive || (feedbackId ? feedbackId === targetItem.producto_comercial_id : false)) : false;
    const monedaActual = monedas[monedaActivaIdx] || { simbolo: "S/" };
    const unidadBase = targetItem?.unidad_base_nombre || "unid";

    // --- 1. Filtrar Presentaciones que TENGAN Stock Suficiente ---
    const presentacionesValidas = useMemo(() => {
        if (!targetItem) return [];
        if (!targetItem.presentaciones || targetItem.presentaciones.length === 0) {
            return [
                {
                    id: targetItem.producto_comercial_id || "unidad-std",
                    nombre: "Unidad",
                    cantidad_unidad_base: 1,
                    precio: targetItem.precio_actual || 0,
                },
            ];
        }

        // Muestra solo presentaciones que tengan al menos 1 paquete entero disponible
        return targetItem.presentaciones.filter((pres: PresentacionOption) => {
            const equiv = pres.cantidad_unidad_base || 1;
            const paquetesDisponibles = Math.floor((targetItem.stock_total || 0) / equiv);
            return paquetesDisponibles >= 1;
        });
    }, [targetItem]);

    // Estado local para la opción seleccionada por el usuario
    const [presentacionSel, setPresentacionSel] = useState<PresentacionOption | null>(
        presentacionesValidas[0] || null
    );

    // Sincronizar selección cuando cambian las presentaciones
    useEffect(() => {
        if (presentacionesValidas.length > 0) {
            setPresentacionSel(presentacionesValidas[0]);
        } else {
            setPresentacionSel(null);
        }
    }, [presentacionesValidas]);

    if (!targetItem) return null;

    const stockTotal = targetItem.stock_total || 0;
    const sinStockTotal = stockTotal <= 0;
    const requiereReceta = Boolean(targetItem.requiere_receta);

    // --- Control FEFO de Vencimiento ---
    let vencePronto = false;
    let loteVencido = false;
    if (targetItem.lote_fefo_vencimiento) {
        const hoy = new Date();
        const venc = new Date(targetItem.lote_fefo_vencimiento);
        const diffMeses = (venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
        if (venc < hoy) {
            loteVencido = true;
        } else if (diffMeses <= 3) {
            vencePronto = true;
        }
    }

    const disabledAction = sinStockTotal || loteVencido || isFeedback;

    const handleAgregarClick = () => {
        if (!presentacionSel || disabledAction) return;

        if (requiereReceta && onSolicitarReceta) {
            onSolicitarReceta(targetItem, presentacionSel);
            return;
        }

        if (onAgregar) {
            onAgregar(presentacionSel, presentacionSel.cantidad_unidad_base);
        } else if (agregarAlCarrito) {
            agregarAlCarrito(
                targetItem,
                presentacionSel.cantidad_unidad_base,
                presentacionSel.nombre,
                presentacionSel.precio
            );
        }
    };

    // --- Semáforo de Stock de Color ---
    const getStockBadgeStyle = () => {
        if (sinStockTotal) return "bg-slate-100 text-slate-400 border-slate-200 line-through";
        if (stockTotal > 20) return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (stockTotal > 5) return "bg-amber-50 text-amber-800 border-amber-200";
        return "bg-red-50 text-red-700 border-red-200 font-black animate-pulse";
    };

    return (
        <article
            className={`
        w-full bg-white rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all duration-200
        flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4
        ${requiereReceta ? "border-l-4 border-l-red-500" : ""}
        ${isFeedback
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10 scale-[0.99]"
                    : "border-slate-200 hover:border-emerald-400 hover:shadow-md"
                }
        ${disabledAction ? "bg-slate-50 opacity-75" : ""}
      `}
        >
            {/* ════════ BLOQUE 1: INFORMACIÓN DEL MEDICAMENTO ════════ */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium flex-wrap">
                    {targetItem.laboratorio && (
                        <span className="text-slate-500 font-semibold truncate max-w-[130px]">
                            {targetItem.laboratorio}
                        </span>
                    )}
                    {requiereReceta && (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-md text-[10px] font-extrabold border border-red-200">
                            <ShieldAlert size={12} className="text-red-600" /> RECETA OBLIGATORIA
                        </span>
                    )}
                    {vencePronto && !loteVencido && (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[10px] font-bold border border-amber-200">
                            <BellRing size={11} className="text-amber-600" /> Vence pronto ({targetItem.lote_fefo_vencimiento})
                        </span>
                    )}
                    {loteVencido && (
                        <span className="inline-flex items-center gap-1 text-red-800 bg-red-100 px-2 py-0.5 rounded-md text-[10px] font-black border border-red-300">
                            <AlertCircle size={11} className="text-red-700" /> LOTE VENCIDO
                        </span>
                    )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight flex items-center gap-2">
                    {targetItem.nombre_comercial}
                </h3>

                {/* Principio activo y Semáforo de stock */}
                <div className="flex items-center gap-2.5 mt-1.5 text-xs text-slate-500 flex-wrap">
                    {targetItem.principio_activo && (
                        <p className="truncate text-slate-600">
                            P.A: <span className="font-semibold text-slate-800">{targetItem.principio_activo}</span>
                        </p>
                    )}
                    <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-bold ${getStockBadgeStyle()}`}
                        title={`Lote FEFO: ${targetItem.lote_fefo_numero || "STD"} - Vence: ${targetItem.lote_fefo_vencimiento || "N/A"}`}
                    >
                        <Package size={13} />
                        <span>
                            {sinStockTotal
                                ? "Sin stock"
                                : stockTotal > 20
                                    ? `${stockTotal} ${unidadBase}(s)`
                                    : stockTotal > 5
                                        ? `Stock Bajo (${stockTotal})`
                                        : `Crítico (${stockTotal})`}
                        </span>
                    </div>
                </div>
            </div>

            {/* ════════ BLOQUE 2: SELECTOR DE PRESENTACIÓN Y PRECIO ════════ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">

                {presentacionesValidas.length > 0 && presentacionSel ? (
                    <>
                        {/* Select Dropdown */}
                        <div className="flex flex-col w-full sm:w-[210px]">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                <Layers size={11} /> Presentación
                            </label>
                            <select
                                value={presentacionSel.id}
                                onChange={(e) => {
                                    const encontrado = presentacionesValidas.find((p: PresentacionOption) => p.id === e.target.value);
                                    if (encontrado) setPresentacionSel(encontrado);
                                }}
                                disabled={disabledAction}
                                className="w-full h-10 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer transition-all disabled:opacity-50"
                            >
                                {presentacionesValidas.map((p: PresentacionOption) => {
                                    const cantBase = p.cantidad_unidad_base || 1;
                                    const paquetesDisponibles = Math.floor((stockTotal) / cantBase);

                                    return (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} (x{cantBase} {unidadBase}) — Disp: {paquetesDisponibles}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Fila para Precio + Botón Prominente */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">

                            {/* Precio destacado */}
                            <div className="text-left sm:text-right min-w-[85px]">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Precio</span>
                                <span className="text-lg sm:text-xl font-black text-slate-900">
                                    <span className="text-xs text-slate-500 font-semibold mr-0.5">
                                        {monedaActual.simbolo}
                                    </span>
                                    {presentacionSel.precio.toFixed(2)}
                                </span>
                            </div>

                            {/* Botón de Agregar Prominente */}
                            <button
                                type="button"
                                onClick={handleAgregarClick}
                                disabled={disabledAction}
                                className={`
                  h-11 sm:h-10 px-5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2
                  transition-all duration-200 shrink-0 shadow-md active:scale-95 cursor-pointer
                  ${isFeedback
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : disabledAction
                                            ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                                            : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/25"
                                    }
                `}
                            >
                                {isFeedback ? (
                                    <>
                                        <Check size={18} strokeWidth={3} />
                                        <span>Añadido</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={18} strokeWidth={2.5} />
                                        <span>{sinStockTotal ? "Sin stock" : "Añadir"}</span>
                                    </>
                                )}
                            </button>

                        </div>
                    </>
                ) : (
                    /* Si no alcanza el stock */
                    <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-xl w-full">
                        <AlertCircle size={16} />
                        <span>Sin stock disponible</span>
                    </div>
                )}

            </div>
        </article>
    );
}