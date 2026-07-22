import { useState, useEffect, useMemo } from "react";
import { Plus, Check, Package, FileText, Layers, AlertCircle } from "lucide-react";


export interface PresentacionOption {
    id: string;
    nombre: string;              // Ej: "Caja", "Blíster", "Comprimido"
    cantidad_unidad_base: number; // Ej: 100, 10, 1
    precio: number;               // Precio de esta presentación
}

export interface ProductoItemProps {
    item: {
        producto_comercial_id: string;
        sku: string;
        nombre_comercial: string;
        principio_activo?: string;
        laboratorio?: string;
        requiere_receta?: boolean;
        unidad_base_nombre?: string; // Ej: "comprimido"
        stock_total: number;         // Stock en unidades base (ej. 150)
        presentaciones: PresentacionOption[];
    };
    monedas?: { simbolo: string; nombre: string }[];
    monedaActivaIdx?: number;
    onAgregar: (presentacionSeleccionada: PresentacionOption, equivalencia: number) => void;
    feedbackActive?: boolean;
}

export default function Item({
    item,
    monedas = [{ simbolo: "S/", nombre: "Soles" }],
    monedaActivaIdx = 0,
    onAgregar,
    feedbackActive = false,
}: ProductoItemProps) {
    const monedaActual = monedas[monedaActivaIdx] || { simbolo: "S/" };
    const unidadBase = item.unidad_base_nombre || "unid";

    // --- 1. Filtrar Presentaciones que TENGAN Stock Suficiente ---
    const presentacionesValidas = useMemo(() => {
        if (!item.presentaciones || item.presentaciones.length === 0) {
            return [
                {
                    id: item.producto_comercial_id,
                    nombre: "Unidad",
                    cantidad_unidad_base: 1,
                    precio: 0,
                },
            ];
        }

        // Muestra solo presentaciones que tengan al menos 1 paquete entero disponible
        return item.presentaciones.filter((pres) => {
            const equiv = pres.cantidad_unidad_base || 1;
            const paquetesDisponibles = Math.floor(item.stock_total / equiv);
            return paquetesDisponibles >= 1;
        });
    }, [item.presentaciones, item.stock_total]);

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

    const sinStockTotal = item.stock_total <= 0;

    return (
        <article
            className={`
        w-full bg-white rounded-2xl border p-3.5 sm:p-4 shadow-sm transition-all duration-200
        flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4
        ${feedbackActive
                    ? "border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/10 scale-[0.99]"
                    : "border-slate-200 hover:border-teal-400 hover:shadow-md"
                }
        ${sinStockTotal ? "opacity-60 bg-slate-50 cursor-not-allowed" : ""}
      `}
        >
            {/* ════════ BLOQUE 1: INFORMACIÓN DEL MEDICAMENTO ════════ */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-medium flex-wrap">
                    <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                        {item.sku || "SIN SKU"}
                    </span>
                    {item.laboratorio && (
                        <span className="text-slate-400 truncate max-w-[130px]">
                            {item.laboratorio}
                        </span>
                    )}
                    {item.requiere_receta && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-amber-200/60">
                            <FileText size={12} /> Receta
                        </span>
                    )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {item.nombre_comercial}
                </h3>

                {/* Stock Total en Unidades Base */}
                <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-500 flex-wrap">
                    {item.principio_activo && (
                        <p className="truncate">
                            P.A: <span className="font-medium text-slate-700">{item.principio_activo}</span>
                        </p>
                    )}
                    <div className={`flex items-center gap-1 font-bold ${sinStockTotal ? "text-rose-500" : "text-emerald-600"}`}>
                        <Package size={14} />
                        <span>{sinStockTotal ? "Sin Stock" : `${item.stock_total} ${unidadBase}(s) disp.`}</span>
                    </div>
                </div>
            </div>

            {/* ════════ BLOQUE 2: SELECTOR DE PRESENTACIÓN Y PRECIO ════════ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">

                {presentacionesValidas.length > 0 && presentacionSel ? (
                    <>
                        {/* Select Dropdown (Mobile First: ancho completo en móvil, fijo en escritorio) */}
                        <div className="flex flex-col w-full sm:w-[210px]">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                <Layers size={11} /> Presentación
                            </label>
                            <select
                                value={presentacionSel.id}
                                onChange={(e) => {
                                    const encontrado = presentacionesValidas.find((p) => p.id === e.target.value);
                                    if (encontrado) setPresentacionSel(encontrado);
                                }}
                                disabled={sinStockTotal}
                                className="w-full h-10 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white cursor-pointer transition-all"
                            >
                                {presentacionesValidas.map((p) => {
                                    const cantBase = p.cantidad_unidad_base || 1;
                                    const paquetesDisponibles = Math.floor(item.stock_total / cantBase);

                                    return (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} (x{cantBase} {unidadBase}) — Disp: {paquetesDisponibles}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Fila inferior para móvil: Precio + Botón */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">

                            {/* Precio de la presentación elegida */}
                            <div className="text-left sm:text-right min-w-[75px]">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Precio</span>
                                <span className="text-base sm:text-lg font-black text-teal-700">
                                    <span className="text-xs text-teal-500 font-semibold mr-0.5">
                                        {monedaActual.simbolo}
                                    </span>
                                    {presentacionSel.precio.toFixed(2)}
                                </span>
                            </div>

                            {/* Botón de Agregar (Mínimo 44px de alto para Toque Móvil) */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (presentacionSel) {
                                        onAgregar(presentacionSel, presentacionSel.cantidad_unidad_base);
                                    }
                                }}
                                disabled={sinStockTotal || feedbackActive}
                                className={`
                  h-11 sm:h-10 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5
                  transition-all duration-200 shrink-0 shadow-sm active:scale-95 cursor-pointer
                  ${feedbackActive
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-teal-600/20"
                                    }
                `}
                            >
                                {feedbackActive ? (
                                    <>
                                        <Check size={18} strokeWidth={3} />
                                        <span>Añadido</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} strokeWidth={2.5} />
                                        <span>Añadir</span>
                                    </>
                                )}
                            </button>

                        </div>
                    </>
                ) : (
                    /* Si no alcanza el stock para armar ni 1 unidad */
                    <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 font-semibold bg-rose-50 p-2.5 rounded-xl w-full">
                        <AlertCircle size={16} />
                        <span>Sin paquetes suficientes disponibles</span>
                    </div>
                )}

            </div>
        </article>
    );
}