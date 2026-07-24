import {
  Package,
  Clock,
  DollarSign,
  Layers,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

type Props = {
  reporte: any;
  loading: boolean;
  onRefresh?: () => void;
};

export default function ReporteInventario({ reporte, loading }: Props) {

  const val = reporte?.valorizacion;
  const fefo = reporte?.control_vencimientos;
  const listaFefo = fefo?.lista || [];
  const criticos = reporte?.stock_critico || [];

  return (
    <div className="space-y-6">
      {/* ═══ TARJETAS DE VALORIZACIÓN ═════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Costo Total Inventario */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inversión a Costo</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              S/ {(val?.costo_total_inventario || 0).toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Costo de compra acumulado</span>
          </div>
        </div>

        {/* Valor de Venta Estimado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Valor Venta Est.</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              S/
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              S/ {(val?.valor_venta_estimado || 0).toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Retorno bruto potencial</span>
          </div>
        </div>

        {/* Margen Potencial */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Margen Potencial</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-700 tabular-nums">
              S/ {(val?.margen_potencial || 0).toFixed(2)}
            </div>
            <span className="text-[11px] text-teal-600 font-bold">Utilidad bruta al vender stock</span>
          </div>
        </div>

        {/* Total Unidades & Lotes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Unidades Base</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {val?.total_unidades_base || 0}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              En {val?.total_lotes || 0} lotes activos
            </span>
          </div>
        </div>
      </div>

      {/* ═══ CONTROL DE VENCIMIENTOS FEFO ═════════════════════════════ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Control de Vencimientos FEFO</h3>
            </div>
            <p className="text-xs text-slate-400">Monitoreo de lotes próximos a caducar para salida prioritaria</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
              Vencidos: {fefo?.vencidos_count || 0}
            </span>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200">
              Urgentes (&lt;30d): {fefo?.urgentes_30_dias_count || 0}
            </span>
            <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-xl border border-sky-200">
              Advertencia (&lt;90d): {fefo?.advertencia_90_dias_count || 0}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span>Analizando lotes y fechas de caducidad...</span>
          </div>
        ) : listaFefo.length === 0 ? (
          <div className="py-8 text-center text-xs text-emerald-600 font-bold bg-emerald-50 rounded-xl border border-emerald-100">
            ✅ No hay lotes próximos a vencer en los siguientes 90 días.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Medicamento / Producto</th>
                  <th className="py-3 px-4">SKU / Lote</th>
                  <th className="py-3 px-4 text-center">Fecha Caducidad</th>
                  <th className="py-3 px-4 text-center">Días Restantes</th>
                  <th className="py-3 px-4 text-right">Stock Disponible</th>
                  <th className="py-3 px-4 text-center">Estado FEFO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {listaFefo.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.producto}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {item.sku} | <span className="font-bold text-slate-700">{item.numero_lote}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {new Date(item.fecha_vencimiento).toLocaleDateString("es-PE")}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {item.dias_restantes} días
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 tabular-nums">
                      {item.stock_actual} unid.
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.estado === "VENCIDO" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-sm">
                          VENCIDO
                        </span>
                      )}
                      {item.estado === "URGENTE" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                          URGENTE (&lt; 30d)
                        </span>
                      )}
                      {item.estado === "ADVERTENCIA" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ADVERTENCIA (&lt; 90d)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ STOCK CRÍTICO ═════════════════════════════════════════════ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h3 className="text-base font-bold text-slate-900">Productos con Stock Crítico (≤ 15 unidades)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {criticos.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-full py-4 text-center">No hay productos en nivel crítico de inventario.</p>
          ) : (
            criticos.map((item: any) => (
              <div key={item.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.producto}</p>
                  <span className="text-[10px] font-mono text-slate-400">SKU: {item.sku} | Lote: {item.numero_lote}</span>
                </div>
                <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-black rounded-lg shrink-0">
                  {item.stock_actual} unid.
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
