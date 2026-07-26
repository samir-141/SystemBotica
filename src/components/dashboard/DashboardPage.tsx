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
  Store,
  Sparkles,
  BarChart3,
  Users,
  UserCheck,
  PiggyBank,
  FileSpreadsheet,
  Printer,
  Target,
  Percent,
  Coins,
  ShieldAlert,
} from "lucide-react";
import { useDashboard } from "./hooks/useDashboard";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
  const { resumen, cargando, error, refetch } = useDashboard();
  const { sucursalActual } = useAuth();

  const kpis = resumen?.kpis;
  const maxVenta7Dias = Math.max(...(resumen?.grafico_7_dias.map((g) => g.total) || [1]));

  // Exportar Excel / CSV para Contadores
  const handleExportarExcelCSV = () => {
    if (!resumen) return;

    const fechaHoy = new Date().toISOString().split("T")[0];
    const sucursalNombre = sucursalActual?.nombre || "MATRIZ PRINCIPAL";

    let csvContent = `REPORTES CONTABLES POS FARMACIA - FECHA: ${fechaHoy}\n`;
    csvContent += `SUCURSAL: ${sucursalNombre}\n\n`;

    // 1. BALANCE GENERAL Y KPIS
    csvContent += `--- RESUMEN Y BALANCE DE INGRESOS Y UTILIDAD ---\n`;
    csvContent += `Métrica,Monto (PEN),Detalle\n`;
    csvContent += `Ventas Totales Hoy,S/ ${(kpis?.total_ventas_hoy || 0).toFixed(2)},${kpis?.operaciones_hoy || 0} operaciones\n`;
    csvContent += `Ganancia Neta (Utilidad Bruta),S/ ${(kpis?.ganancia_neta_hoy || 0).toFixed(2)},Margen: ${kpis?.margen_ganancia_pct || 0}%\n`;
    csvContent += `Ticket Promedio,S/ ${(kpis?.ticket_promedio || 0).toFixed(2)},Por transacción\n`;
    csvContent += `Ventas Ayer,S/ ${(kpis?.total_ventas_ayer || 0).toFixed(2)},Crecimiento: ${kpis?.porcentaje_crecimiento || 0}%\n`;
    csvContent += `Retorno de Capital Recuperado,S/ ${(resumen.progreso_capital?.recaudado || 0).toFixed(2)},Pendiente: S/ ${(resumen.progreso_capital?.pendiente || 0).toFixed(2)}\n\n`;

    // 2. DESGLOSE METODOS DE PAGO
    csvContent += `--- DESGLOSE DE INGRESOS POR METODO DE PAGO ---\n`;
    csvContent += `Metodo de Pago,Monto Total (PEN),Porcentaje (%)\n`;
    resumen.desglose_pagos.forEach((p) => {
      csvContent += `"${p.metodo}",S/ ${p.monto.toFixed(2)},${p.porcentaje}%\n`;
    });
    csvContent += `\n`;

    // 3. TOP CLIENTES
    csvContent += `--- TOP MEJORES CLIENTES ---\n`;
    csvContent += `Cliente,Documento,Compras Realizadas,Total Gastado (PEN)\n`;
    (resumen.top_clientes || []).forEach((c) => {
      csvContent += `"${c.nombre}","${c.documento}",${c.compras_count},S/ ${c.total_comprado.toFixed(2)}\n`;
    });
    csvContent += `\n`;

    // 4. TOP VENDEDORES
    csvContent += `--- DESEMPEÑO DE VENDEDORES (CAJEROS) ---\n`;
    csvContent += `Vendedor,Correo,Operaciones,Total Facturado (PEN)\n`;
    (resumen.top_vendedores || []).forEach((u) => {
      csvContent += `"${u.nombre}","${u.correo}",${u.operaciones_count},S/ ${u.total_facturado.toFixed(2)}\n`;
    });
    csvContent += `\n`;

    // 5. PRODUCTOS MAS RENTABLES
    csvContent += `--- PRODUCTOS MAS RENTABLES ---\n`;
    csvContent += `Producto,Presentacion,Unidades Vendidas,Ingresos Totales (PEN),Ganancia Neta (PEN),Margen (%)\n`;
    (resumen.productos_rentables || []).forEach((p) => {
      csvContent += `"${p.nombre}","${p.presentacion}",${p.cantidad},S/ ${p.ingresos.toFixed(2)},S/ ${p.ganancia_neta.toFixed(2)},${p.margen_pct}%\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Contable_POS_${fechaHoy}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImprimirReportePDF = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans text-slate-800 overflow-y-auto p-3 sm:p-6 space-y-6">
      {/* ═══ HEADER BAR CON EXPORTACIÓN CONTABLE ════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard Financiero & Analytics</h1>
              <span className="bg-teal-50 text-teal-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-teal-200/60 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-500" /> POS Farma ERP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              Sucursal: <span className="text-teal-700 font-bold">{sucursalActual?.nombre || "Matriz Principal"}</span>
            </p>
          </div>
        </div>

        {/* Acciones Contables: Exportar Excel / PDF */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          <button
            onClick={handleExportarExcelCSV}
            disabled={!resumen}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/20"
            title="Exportar archivo CSV / Excel para contabilidad"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleImprimirReportePDF}
            disabled={!resumen}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
            title="Imprimir informe o guardar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir PDF</span>
          </button>

          <button
            onClick={refetch}
            disabled={cargando}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-teal-600" : ""}`} />
            <span className="hidden sm:inline">{cargando ? "Cargando..." : "Refrescar"}</span>
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

      {/* ═══ TARJETA DE PROGRESO DE CAPITAL DE INVERSIÓN (BARRA RETORNO) ══════ */}
      {resumen?.progreso_capital && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-5 rounded-2xl border border-slate-700 shadow-xl text-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-wide uppercase text-teal-400">Progreso de Retorno de Capital</h3>
                <p className="text-xs text-slate-300">Recuperación de inversión acumulada vs Meta de Capital Inicial</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono font-bold self-end sm:self-auto">
              <span className="bg-teal-900/60 px-3 py-1 rounded-xl border border-teal-500/30 text-teal-300">
                Meta: S/ {resumen.progreso_capital.meta_capital.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
              <span className="bg-emerald-900/60 px-3 py-1 rounded-xl border border-emerald-500/30 text-emerald-300">
                Recuperado: S/ {resumen.progreso_capital.recaudado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-extrabold">
              <span className="text-teal-300 flex items-center gap-1">
                <Coins size={14} /> Completo: {resumen.progreso_capital.porcentaje_completado}%
              </span>
              <span className="text-amber-300 font-mono">
                Falta para meta: S/ {resumen.progreso_capital.pendiente.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-slate-700/60 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-600">
              <div
                className="bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${resumen.progreso_capital.porcentaje_completado}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ KPIS CARDS FINANCIEROS (GRID 1 a 5 cols) ═════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

        {/* Card 2: Utilidad Bruta (Ganancia Neta) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Ganancia Neta</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
              S/ {(kpis?.ganancia_neta_hoy || 0).toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-600">
              <Percent className="w-3.5 h-3.5" />
              <span>Margen Promedio: {kpis?.margen_ganancia_pct || 0}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Operaciones */}
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

        {/* Card 4: Ticket Promedio */}
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

        {/* Card 5: Alertas de Stock */}
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
        {/* Left 2 Cols: Sales Last 7 Days */}
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
                  <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow z-10 whitespace-nowrap">
                    <span className="font-bold">S/ {d.total.toFixed(2)}</span>
                    <span>{d.cantidad} ventas</span>
                  </div>

                  <div
                    style={{ height: `${Math.max(alturaPct, 6)}%` }}
                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${
                      esHoy
                        ? "bg-gradient-to-t from-teal-600 to-teal-400 shadow-md shadow-teal-500/20"
                        : "bg-slate-200 group-hover:bg-teal-300"
                    }`}
                  />

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

      {/* ═══ ANALYTICS ESTRATÉGICOS: TOP CLIENTES & TOP VENDEDORES ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Mejores Clientes */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Top Mejores Clientes</h2>
                <p className="text-xs text-slate-400">Clientes recurrentes con mayor volumen de compra</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!resumen?.top_clientes || resumen.top_clientes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Sin información de clientes aún</p>
            ) : (
              resumen.top_clientes.map((c, idx) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black flex items-center justify-center border border-indigo-100">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.nombre}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{c.documento}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-700 block">
                      S/ {c.total_comprado.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.compras_count} compras
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Vendedores / Cajeros */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Desempeño de Vendedores (Cajeros)</h2>
                <p className="text-xs text-slate-400">Personal con mayor número de operaciones facturadas</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!resumen?.top_vendedores || resumen.top_vendedores.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Sin registros de cajeros aún</p>
            ) : (
              resumen.top_vendedores.map((u, idx) => (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black flex items-center justify-center border border-emerald-100">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{u.nombre}</p>
                      <span className="text-[10px] text-slate-400">{u.correo}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 block">
                      S/ {u.total_facturado.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {u.operaciones_count} transacciones
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM SECTION: PRODUCTOS MÁS RENTABLES & ALERTAS ══════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Más Rentables */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Productos Más Rentables (Utilidad Neta)</h2>
                <p className="text-xs text-slate-400">Medicinas que generan mayor margen de ganancia en Soles</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {!resumen?.productos_rentables || resumen.productos_rentables.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No hay ventas registradas aún el día de hoy</p>
            ) : (
              resumen.productos_rentables.map((item, idx) => (
                <div key={item.id + item.presentacion} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-xs font-black flex items-center justify-center border border-amber-200">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.nombre}</p>
                      <span className="text-[10px] text-teal-600 font-semibold">
                        [{item.presentacion}] — {item.cantidad} vendidas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 block">
                      + S/ {item.ganancia_neta.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Margen: {item.margen_pct}%
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
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Alertas de Stock Crítico</h2>
                <p className="text-xs text-slate-400">Lotes próximos a agotarse en inventario</p>
              </div>
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
                    <span className="inline-block px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-black rounded-xl border border-rose-200">
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
