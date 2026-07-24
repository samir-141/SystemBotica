import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  ShoppingBag,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ArrowUpRight
} from "lucide-react";

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

  // Preset Handler
  const aplicarPreset = (dias: number) => {
    const fin = new Date().toISOString().split("T")[0];
    const inicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setFechaInicio(inicio);
    setFechaFin(fin);
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
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Hoy
          </button>
          <button
            onClick={() => aplicarPreset(7)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            7 Días
          </button>
          <button
            onClick={() => aplicarPreset(30)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ventas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Ingresos</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              S/
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              S/ {(kpis?.total_ventas || 0).toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Monto bruto cobrado</span>
          </div>
        </div>

        {/* Base Imponible */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Base Imponible</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              S/ {(kpis?.subtotal_base || 0).toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Ventas netas (Sin IGV)</span>
          </div>
        </div>

        {/* Utilidad Bruta Estimada */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ganancia Bruta Est.</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-teal-700 tabular-nums">
              S/ {(kpis?.utilidad_bruta_estimada || 0).toFixed(2)}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">Margen positivo estimado</span>
          </div>
        </div>

        {/* Transacciones & Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transacciones</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {kpis?.cantidad_transacciones || 0}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Ticket Promedio: S/ {(kpis?.ticket_promedio || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ MIDDLE SECTION: MÉTODOS PAGO ════════════════════════════ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cobros por Método de Pago</h3>
            <p className="text-xs text-slate-400">Resumen acumulado por canal en el período seleccionado</p>
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
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Detalle de Ventas Registradas</h3>
            <p className="text-xs text-slate-400">Listado cronológico de comprobantes procesados</p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl">
            {lista.length} registros
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span>Generando reporte de ventas...</span>
          </div>
        ) : lista.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No se registraron ventas en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4 text-center">Método Pago</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">IGV (18%)</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {lista.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {new Date(v.fecha).toLocaleDateString("es-PE")} {new Date(v.fecha).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{v.cliente_nombre}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{v.cliente_documento}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {v.metodo_pago}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">S/ {v.subtotal.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">S/ {v.igv.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">S/ {v.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
