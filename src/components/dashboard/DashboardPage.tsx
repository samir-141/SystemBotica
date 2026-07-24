import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    CreditCard,
    AlertTriangle,
    RefreshCw,
    Award,
    Calendar,
    ArrowUpRight,
    Store,
    Sparkles,
    BarChart3
} from "lucide-react";
import { useDashboard } from "./hooks/useDashboard";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
    const { resumen, cargando, error, refetch } = useDashboard();
    const { sucursalActual, user } = useAuth();

    const kpis = resumen?.kpis;
    const maxVenta7Dias = Math.max(...(resumen?.grafico_7_dias.map(g => g.total) || [1]));

    return (
        <div className="h-full flex flex-col bg-slate-100 font-sans text-slate-800 overflow-y-auto p-3 sm:p-6 space-y-6">

            {/* ═══ HEADER BAR ════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard General</h1>
                            <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-teal-200/60 hidden sm:inline-flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-teal-500" /> POS Farma
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            Sucursal: <span className="text-teal-700 font-bold">{sucursalActual?.nombre || "Matriz Principal"}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        onClick={refetch}
                        disabled={cargando}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-teal-600" : ""}`} />
                        <span>{cargando ? "Actualizando..." : "Refrescar Datos"}</span>
                    </button>
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center justify-between">
                    <span>Error al cargar datos del Dashboard: {error}</span>
                    <button onClick={refetch} className="font-bold underline text-rose-800">Reintentar</button>
                </div>
            )}

            {/* ═══ KPIS CARDS (GRID 1 a 4 cols) ═════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Card 1: Ventas Hoy */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas Hoy</span>
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                            S/ {(kpis?.total_ventas_hoy || 0).toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-xs font-bold">
                            {(kpis?.porcentaje_crecimiento || 0) >= 0 ? (
                                <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                                    +{kpis?.porcentaje_crecimiento}%
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                                    {kpis?.porcentaje_crecimiento}%
                                </span>
                            )}
                            <span className="text-slate-400 font-normal">vs ayer</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: Operaciones */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operaciones</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                            {kpis?.operaciones_hoy || 0}
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-2">Transacciones completadas hoy</p>
                    </div>
                </div>

                {/* Card 3: Ticket Promedio */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Promedio</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                            S/ {(kpis?.ticket_promedio || 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-2">Promedio gastado por cliente</p>
                    </div>
                </div>

                {/* Card 4: Alertas de Stock */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Alertas Stock</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl sm:text-3xl font-black text-amber-600 tabular-nums">
                            {resumen?.alertas_stock?.length || 0}
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-2">Lotes por agotarse (&lt; 15 unid)</p>
                    </div>
                </div>

            </div>

            {/* ═══ MIDDLE SECTION: CHART + METODOS PAGO ══════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left 2 Cols: Sales Last 7 Days (Custom Bar Visual) */}
                <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Ventas - Últimos 7 Días</h2>
                            <p className="text-xs text-slate-400">Historial reciente de ingresos por ventas diarias</p>
                        </div>
                        <Calendar className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
                        {resumen?.grafico_7_dias.map((d, idx) => {
                            const alturaPct = maxVenta7Dias > 0 ? (d.total / maxVenta7Dias) * 100 : 0;
                            const esHoy = idx === resumen.grafico_7_dias.length - 1;

                            return (
                                <div key={d.fecha} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow z-10 whitespace-nowrap">
                                        <span className="font-bold">S/ {d.total.toFixed(2)}</span>
                                        <span>{d.cantidad} ventas</span>
                                    </div>

                                    {/* Bar */}
                                    <div
                                        style={{ height: `${Math.max(alturaPct, 6)}%` }}
                                        className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${esHoy
                                                ? "bg-gradient-to-t from-teal-600 to-teal-400 shadow-md shadow-teal-500/20"
                                                : "bg-slate-200 group-hover:bg-teal-300"
                                            }`}
                                    />

                                    {/* Label */}
                                    <span className={`text-[11px] mt-2 font-bold uppercase ${esHoy ? "text-teal-700 font-extrabold" : "text-slate-500"}`}>
                                        {d.dia}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right 1 Col: Desglose Métodos de Pago */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                        <div className="border-b border-slate-100 pb-3 mb-4">
                            <h2 className="text-base font-bold text-slate-900">Métodos de Pago</h2>
                            <p className="text-xs text-slate-400">Distribución de cobros del día</p>
                        </div>

                        <div className="space-y-4">
                            {resumen?.desglose_pagos.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8">Sin registros de pago hoy</p>
                            ) : (
                                resumen?.desglose_pagos.map((p) => (
                                    <div key={p.metodo} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span>{p.metodo}</span>
                                            <span>S/ {p.monto.toFixed(2)} ({p.porcentaje}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-teal-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${p.porcentaje}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-teal-50/70 border border-teal-100 p-3 rounded-xl text-xs text-teal-800 font-medium mt-4">
                        💡 Todos los cierres y arqueos de caja se registran automáticamente en el sistema.
                    </div>
                </div>

            </div>

            {/* ═══ BOTTOM SECTION: TOP PRODUCTS & LOW STOCK ALERTS ════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top Products */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <h2 className="text-base font-bold text-slate-900">Productos Más Vendidos Hoy</h2>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {resumen?.top_productos.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">No hay ventas registradas aún el día de hoy</p>
                        ) : (
                            resumen?.top_productos.map((item, idx) => (
                                <div key={item.id + item.presentacion} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">{item.nombre}</p>
                                            <span className="text-[10px] text-teal-600 font-semibold">
                                                [{item.presentacion}]
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-extrabold text-slate-800 block">
                                            {item.cantidad} unidad(es)
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            S/ {item.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            <h2 className="text-base font-bold text-slate-900">Alertas de Stock Bajo</h2>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {resumen?.alertas_stock.length === 0 ? (
                            <p className="text-xs text-emerald-600 font-semibold text-center py-8">✅ Inventario en niveles óptimos</p>
                        ) : (
                            resumen?.alertas_stock.map((alerta) => (
                                <div key={alerta.id} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{alerta.nombre_comercial}</p>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            SKU: {alerta.sku} | Lote: {alerta.numero_lote}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-black rounded-md border border-rose-200">
                                            {alerta.stock_actual} disp.
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

        </div>
    );
}
