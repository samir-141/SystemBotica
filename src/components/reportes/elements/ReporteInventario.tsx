import {
  Package,
  Clock,
  DollarSign,
  Layers,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";
import { exportToCSV } from "../../../utils/csvExport";
import { fechaCivil } from "../../../utils/localDate";

type Props = {
  reporte: any;
  loading: boolean;
  onRefresh?: () => void;
};

export default function ReporteInventario({ reporte, loading }: Props) {
  const val = reporte?.resumen_inventario;
  const lotesLista = reporte?.lotes_lista || [];
  const abcLista = reporte?.abc_analysis || [];

  const fefoVencidos = lotesLista.filter((l: any) => l.dias_para_vencer <= 0);
  const fefoUrgentes = lotesLista.filter((l: any) => l.dias_para_vencer > 0 && l.dias_para_vencer <= 30);
  const fefoAdvertencia = lotesLista.filter((l: any) => l.dias_para_vencer > 30 && l.dias_para_vencer <= 90);
  const stockCritico = lotesLista.filter((l: any) => l.stock_actual > 0 && l.stock_actual <= 15);

  const handleExportarCSV = () => {
    if (!lotesLista || lotesLista.length === 0) return;
    const headers = ["ID Lote", "Numero Lote", "Producto", "SKU", "Sucursal", "Stock Actual", "Precio Compra Base (PEN)", "Valor Total Lote (PEN)", "Fecha Vencimiento", "Dias para Vencer"];
    const rows = lotesLista.map((l: any) => [
      `"${l.id}"`,
      `"${l.numero_lote}"`,
      `"${l.producto_nombre.replace(/"/g, '""')}"`,
      `"${l.sku}"`,
      `"${l.sucursal_nombre}"`,
      l.stock_actual,
      l.precio_compra_base.toFixed(2),
      l.valor_total_lote.toFixed(2),
      `"${new Date(l.fecha_vencimiento).toLocaleDateString()}"`,
      l.dias_para_vencer,
    ]);

    exportToCSV(`Reporte_Inventario_FEFO_${fechaCivil()}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* ═══ TARJETAS DE VALORIZACIÓN ═════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Costo Total Inventario */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inversión a Costo</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              S/ {(val?.valor_total_inventario || 0).toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Inversión total almacenada</span>
          </div>
        </div>

        {/* Valor de Venta Estimado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valor Venta Est.</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
              S/
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              S/ {((val?.valor_total_inventario || 0) * 1.35).toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Retorno bruto estimado</span>
          </div>
        </div>

        {/* Margen Potencial */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Margen Potencial</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-teal-700 tabular-nums">
              S/ {((val?.valor_total_inventario || 0) * 0.35).toFixed(2)}
            </div>
            <span className="text-[10px] text-teal-600 font-bold">35.0% Margen estimado</span>
          </div>
        </div>

        {/* Rotación de Inventario */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rotación Stock</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {val?.rotacion_dias_promedio || 42} días
            </div>
            <span className="text-[10px] text-slate-400 font-medium">8.7x rotaciones por año</span>
          </div>
        </div>

        {/* Total Lotes Activos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lotes Registrados</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {val?.total_lotes || 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {val?.lotes_por_vencer || 0} por vencer (&lt;60d)
            </span>
          </div>
        </div>
      </div>

      {/* ═══ ABC ANALYSIS ═════════════════════════════════════════════ */}
      {abcLista.length > 0 && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                Clasificación ABC de Inventario (Ley de Pareto 80/20)
              </h3>
              <p className="text-xs text-slate-400">Priorización por impacto económico de productos almacenados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
              <span className="text-xs font-bold text-emerald-800 block">Clase A (80% Valor Inversión)</span>
              <p className="text-[11px] text-slate-600">Productos de alta rotación y mayor impacto financiero.</p>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-600 h-full w-[80%]" />
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
              <span className="text-xs font-bold text-blue-800 block">Clase B (15% Valor Inversión)</span>
              <p className="text-[11px] text-slate-600">Productos de rotación moderada.</p>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-blue-600 h-full w-[15%]" />
              </div>
            </div>

            <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-800 block">Clase C (5% Valor Inversión)</span>
              <p className="text-[11px] text-slate-600">Productos de baja rotación y menor valor acumulado.</p>
              <div className="w-full bg-slate-300 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-slate-600 h-full w-[5%]" />
              </div>
            </div>
          </div>
        </div>
      )}

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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportarCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
              Vencidos: {fefoVencidos.length}
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-200">
              Urgentes (&lt;30d): {fefoUrgentes.length}
            </span>
            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-xl border border-sky-200">
              Advertencia (&lt;90d): {fefoAdvertencia.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span>Analizando lotes y fechas de caducidad...</span>
          </div>
        ) : lotesLista.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            No se encontraron lotes activos en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Medicamento / Producto</th>
                  <th className="py-3 px-4">SKU / N° Lote</th>
                  <th className="py-3 px-4 text-center">Fecha Caducidad</th>
                  <th className="py-3 px-4 text-center">Días Restantes</th>
                  <th className="py-3 px-4 text-right">Stock Disponible</th>
                  <th className="py-3 px-4 text-center">Estado FEFO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {lotesLista.map((item: any) => {
                  const dias = item.dias_para_vencer;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.producto_nombre}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {item.sku} | <span className="font-bold text-slate-700">{item.numero_lote}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {new Date(item.fecha_vencimiento).toLocaleDateString("es-PE")}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {dias <= 0 ? <span className="text-rose-600 font-black">Caducado</span> : `${dias} días`}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 tabular-nums">
                        {item.stock_actual} unid.
                      </td>
                      <td className="py-3 px-4 text-center">
                        {dias <= 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-sm">
                            VENCIDO
                          </span>
                        ) : dias <= 30 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                            URGENTE (&lt; 30d)
                          </span>
                        ) : dias <= 90 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            ADVERTENCIA (&lt; 90d)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            OPTIMO
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
          {stockCritico.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-full py-4 text-center">No hay productos en nivel crítico de inventario.</p>
          ) : (
            stockCritico.map((item: any) => (
              <div key={item.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.producto_nombre}</p>
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
