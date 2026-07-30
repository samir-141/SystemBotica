import {
  TrendingUp,
  Receipt,
  CreditCard,
  ShoppingBag,
  Calendar,
  RefreshCw,
  Award,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import { exportToCSV } from "../../../utils/csvExport";

type Props = {
  reporte: any;
  loading: boolean;
  fechaInicio: string;
  setFechaInicio: (f: string) => void;
  fechaFin: string;
  setFechaFin: (f: string) => void;
  onRefresh: () => void;
};

export default function ReporteVentas({
  reporte,
  loading,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  onRefresh,
}: Props) {
  const kpis = reporte?.resumen_kpis;
  const lista = reporte?.ventas_lista || [];
  const desgloses = reporte?.desglose_pagos || [];
  const topProductos = reporte?.top_productos || [];
  const tendencias = reporte?.tendencias_diarias || [];

  const aplicarPreset = (dias: number) => {
    const fin = new Date().toISOString().split("T")[0];
    const inicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setFechaInicio(inicio);
    setFechaFin(fin);
  };

  const maxTendencia = Math.max(...tendencias.map((t: any) => t.total), 1);

  const handleExportarCSV = () => {
    if (!lista || lista.length === 0) return;
    const headers = ["ID Venta", "Fecha", "Tipo Comprobante", "Cliente", "Documento", "Subtotal (PEN)", "IGV (PEN)", "Total (PEN)", "Metodo Pago", "Estado"];
    const rows = lista.map((v: any) => [
      `"${v.id}"`,
      `"${new Date(v.fecha).toLocaleDateString()}"`,
      `"${v.tipo_comprobante}"`,
      `"${v.cliente_nombre.replace(/"/g, '""')}"`,
      `"${v.cliente_documento}"`,
      v.subtotal.toFixed(2),
      v.igv.toFixed(2),
      v.total.toFixed(2),
      `"${v.metodo_pago}"`,
      `"${v.estado}"`,
    ]);

    exportToCSV(`Reporte_Ventas_${new Date().toISOString().split("T")[0]}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* ═══ BARRA DE FILTROS Y FECHAS ═══════════════════════════════ */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mr-1">
            <Calendar className="w-4 h-4 text-teal-600" /> Período:
          </span>
          <button
            onClick={() => aplicarPreset(0)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            Hoy
          </button>
          <button
            onClick={() => aplicarPreset(7)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            7 Días
          </button>
          <button
            onClick={() => aplicarPreset(30)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            30 Días
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded-xl">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 px-2 py-1 focus:outline-none"
            />
            <span className="text-xs text-slate-400">a</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 px-2 py-1 focus:outline-none"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ═══ TARJETAS FINANCIERAS KPI ═════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Ingresos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Ingresos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
              S/
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              S/ {(kpis?.total_ventas || 0).toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Monto bruto cobrado</span>
          </div>
        </div>

        {/* Base Imponible */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Imponible</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              S/ {(kpis?.subtotal_base || 0).toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Ventas netas (Sin IGV)</span>
          </div>
        </div>

        {/* Costo de Ventas Real */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Costo de Venta</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-amber-700 tabular-nums">
              S/ {(kpis?.costo_ventas_real || kpis?.costo_compras_estimado || 0).toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Costo reposición stock</span>
          </div>
        </div>

        {/* Ganancia Bruta Real */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ganancia Bruta Real</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-teal-700 tabular-nums">
              S/ {(kpis?.ganancia_bruta_real || kpis?.utilidad_bruta_estimada || 0).toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              Margen Bruto: {kpis?.margen_bruto_pct || 0}%
            </span>
          </div>
        </div>

        {/* Transacciones & Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transacciones</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tabular-nums">
              {kpis?.cantidad_transacciones || 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Ticket: S/ {(kpis?.ticket_promedio || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ TENDENCIAS & TOP PRODUCTOS ═══════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de tendencias por día */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Evolución de Ventas por Día
              </h3>
              <p className="text-xs text-slate-400">Tendencia histórica del volumen facturado</p>
            </div>
          </div>

          {tendencias.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-400">
              No hay datos registrados en el período seleccionado.
            </div>
          ) : (
            <div className="h-48 flex items-end gap-2 pt-4 px-2 flex-wrap">
              {tendencias.map((t: any) => {
                const pctHeight = Math.max(10, Math.min(100, (t.total / maxTendencia) * 100));
                return (
                  <div key={t.fecha} className="flex-1 flex flex-col items-center gap-1 group min-w-[28px]">
                    <span className="text-[9px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                      S/ {t.total.toFixed(0)}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end h-32 overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                        style={{ height: `${pctHeight}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono truncate max-w-[36px]">
                      {t.fecha.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 5 Productos más Vendidos */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Top 5 Productos Vendidos
              </h3>
              <p className="text-xs text-slate-400">Mayor rotación e ingresos</p>
            </div>
          </div>

          <div className="space-y-3">
            {topProductos.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Sin ventas en el período.</p>
            ) : (
              topProductos.map((p: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">{p.nombre}</p>
                      <span className="text-[10px] text-slate-400">{p.cantidad} u. vendidas</span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 shrink-0">
                    S/ {p.total_monto.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══ MÉTODOS PAGO ═════════════════════════════════════════════ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Desglose por Método de Pago</h3>
            <p className="text-xs text-slate-400">Distribución de cobros en caja</p>
          </div>
          <CreditCard className="w-5 h-5 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {desgloses.map((m: any) => (
            <div key={m.metodo} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>{m.metodo}</span>
                <span className="text-teal-700">{m.porcentaje}%</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                S/ {m.monto.toFixed(2)}
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${m.porcentaje}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TABLA DETALLADA DE VENTAS ═══════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Detalle de Ventas Registradas</h3>
            <p className="text-xs text-slate-400">Listado cronológico de operaciones auditadas</p>
          </div>
          <button
            onClick={handleExportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar Excel CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Comprobante</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">IGV</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lista.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No se encontraron registros de venta para este rango de fechas.
                  </td>
                </tr>
              ) : (
                lista.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {new Date(v.fecha).toLocaleDateString()} {new Date(v.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[10px]">
                        {v.tipo_comprobante} #{v.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{v.cliente_nombre}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{v.cliente_documento}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-bold text-[10px]">
                        {v.metodo_pago}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">S/ {v.subtotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">S/ {v.igv.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      S/ {v.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {lista.length === 0 ? (
            <div className="py-8 text-center text-slate-400 italic text-xs">
              No se encontraron registros de venta para este rango de fechas.
            </div>
          ) : (
            lista.map((v: any) => (
              <div key={v.id} className="p-3 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-mono text-[10px] font-bold">
                    {v.tipo_comprobante} #{v.id.slice(0, 8)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(v.fecha).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{v.cliente_nombre}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{v.metodo_pago}</span>
                  <span className="font-black text-slate-900 text-sm">S/ {v.total.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
