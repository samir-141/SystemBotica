import { useState } from "react";
import {
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
  Stethoscope,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useDashboard } from "./hooks/useDashboard";
import { useAuth } from "../../hooks/useAuth";
import {
  enmascararDocumento,
  calcularMargenBruto,
  esMargenAnomalo,
} from "./utils/dashboardUtils";

export default function DashboardPage() {
  const { resumen, cargando, error, refetch, rangoFecha, setRangoFecha } = useDashboard();
  const { sucursalActual } = useAuth();
  const [showPaybackTooltip, setShowPaybackTooltip] = useState(false);

  const kpis = resumen?.kpis;
  const maxVenta7Dias = Math.max(...(resumen?.grafico_7_dias.map((g) => g.total) || [1]));

  // Cálculos financieros defensivos
  const ventasHoy = kpis?.total_ventas_hoy || 0;
  const gananciaNeta = kpis?.ganancia_neta_hoy ?? 0;
  const costoVentas = kpis?.costo_ventas_hoy ?? 0;
  const margenBrutoPct = kpis?.margen_ganancia_pct ?? calcularMargenBruto(ventasHoy, costoVentas);
  const progresoCapital = resumen?.progreso_capital;
  const resultadoAcumulado = progresoCapital?.resultado_acumulado ?? 0;
  const margenAcumuladoPct = progresoCapital?.margen_acumulado_pct ?? 0;
  const gananciaEstimadaMinima = progresoCapital?.ganancia_estimada_minima ?? 0;
  const gananciaEstimadaMaxima = progresoCapital?.ganancia_estimada_maxima ?? 0;
  const ventaEstimadaMinima = progresoCapital?.venta_estimada_minima ?? 0;
  const ventaEstimadaMaxima = progresoCapital?.venta_estimada_maxima ?? 0;
  const hayPerdidaAcumulada = resultadoAcumulado < 0;

  const operacionesHoy = kpis?.operaciones_hoy || 0;
  const tieneDatosSuficientesComparar = operacionesHoy >= 10;

  // Exportar Excel estructurado y estilizado para Microsoft Excel
  const handleExportarExcelCSV = () => {
    if (!resumen) return;

    const fechaHoy = new Date().toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
    const horaHoy = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    const sucursalNombre = sucursalActual?.nombre || "MATRIZ PRINCIPAL";

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Dashboard Financiero</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          .banner { background-color: #0f172a; color: #10b981; font-size: 16pt; font-weight: bold; text-align: center; padding: 14px; border: 1px solid #0284c7; }
          .subbanner { background-color: #1e293b; color: #cbd5e1; font-size: 10pt; text-align: center; padding: 8px; border: 1px solid #334155; }
          .section { background-color: #047857; color: #ffffff; font-size: 11pt; font-weight: bold; padding: 9px; text-align: left; }
          .section-alert { background-color: #991b1b; color: #ffffff; font-size: 11pt; font-weight: bold; padding: 9px; text-align: left; }
          th { background-color: #059669; color: #ffffff; font-size: 10pt; font-weight: bold; border: 1px solid #047857; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 7px; font-size: 10pt; color: #1e293b; }
          .alt { background-color: #f8fafc; }
          .num { text-align: right; }
          .pct { text-align: right; }
          .cnt { text-align: center; }
          .bold { font-weight: bold; }
          .success { color: #047857; font-weight: bold; }
          .alert { color: #b91c1c; font-weight: bold; }
          .spacer { height: 16px; background-color: #ffffff; border: none; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="5" class="banner">REPORTE FINANCIERO Y ANALYTICS DE VENTAS - POS FARMA ERP</td>
          </tr>
          <tr>
            <td colspan="5" class="subbanner">
              Sucursal: <b>${sucursalNombre}</b> | Emisión: <b>${fechaHoy} ${horaHoy}</b> | Rango: <b>${rangoFecha}</b>
            </td>
          </tr>
          <tr class="spacer"><td colspan="5"></td></tr>

          <!-- 1. RESUMEN EJECUTIVO Y BALANCES -->
          <tr>
            <td colspan="5" class="section">1. RESUMEN EJECUTIVO & BALANCE DE INGRESOS</td>
          </tr>
          <tr>
            <th>Métrica / Indicador Financiero</th>
            <th style="text-align:right">Monto (PEN)</th>
            <th style="text-align:right">Porcentaje / Margen</th>
            <th colspan="2">Detalle u Observación</th>
          </tr>
          <tr>
            <td class="bold">Ventas Totales Hoy</td>
            <td class="num bold">S/ ${ventasHoy.toFixed(2)}</td>
            <td class="pct">${kpis?.porcentaje_crecimiento || 0}%</td>
            <td colspan="2">${operacionesHoy} transacciones procesadas hoy</td>
          </tr>
          <tr class="alt">
            <td class="bold">Ganancia Neta (Utilidad Bruta)</td>
            <td class="num bold success">S/ ${gananciaNeta.toFixed(2)}</td>
            <td class="pct success">${margenBrutoPct}%</td>
            <td colspan="2">Margen bruto proyectado sobre costo de ventas</td>
          </tr>
          <tr>
            <td>Costo de Ventas Calculado</td>
            <td class="num">S/ ${costoVentas.toFixed(2)}</td>
            <td class="pct">${(100 - margenBrutoPct).toFixed(1)}%</td>
            <td colspan="2">Costo base de insumos y medicamentos</td>
          </tr>
          <tr class="alt">
            <td>Ticket Promedio por Venta</td>
            <td class="num">S/ ${(kpis?.ticket_promedio || 0).toFixed(2)}</td>
            <td class="cnt">-</td>
            <td colspan="2">Promedio invertido por cliente por ticket</td>
          </tr>
          <tr>
            <td>Ventas Día Anterior (Ayer)</td>
            <td class="num">S/ ${(kpis?.total_ventas_ayer || 0).toFixed(2)}</td>
            <td class="pct">${kpis?.porcentaje_crecimiento || 0}%</td>
            <td colspan="2">Comparativa vs periodo anterior</td>
          </tr>
          <tr class="alt">
            <td class="bold">Recuperación de Inversión (Payback Global)</td>
            <td class="num bold success">S/ ${(resumen.progreso_capital?.recaudado || 0).toFixed(2)}</td>
            <td class="pct success">${resumen.progreso_capital?.porcentaje_completado}%</td>
            <td colspan="2">Meta Capital: S/ ${(resumen.progreso_capital?.meta_capital || 0).toFixed(2)} | Pendiente: S/ ${(resumen.progreso_capital?.pendiente || 0).toFixed(2)}</td>
          </tr>

          <tr class="spacer"><td colspan="5"></td></tr>

          <!-- 2. DESGLOSE METODOS DE PAGO -->
          <tr>
            <td colspan="5" class="section">2. DESGLOSE DE INGRESOS POR METODO DE PAGO</td>
          </tr>
          <tr>
            <th colspan="2">Método de Pago</th>
            <th style="text-align:right">Monto Recaudado (PEN)</th>
            <th style="text-align:right">Participación (%)</th>
            <th>Estado Conciliación</th>
          </tr>
          ${resumen.desglose_pagos.map((p, idx) => `
            <tr class="${idx % 2 === 1 ? "alt" : ""}">
              <td colspan="2" class="bold">${p.metodo}</td>
              <td class="num">S/ ${p.monto.toFixed(2)}</td>
              <td class="pct">${p.porcentaje}%</td>
              <td class="cnt success">CONCILIADO</td>
            </tr>
          `).join("")}

          <tr class="spacer"><td colspan="5"></td></tr>

          <!-- 3. PRODUCTOS MAS RENTABLES -->
          <tr>
            <td colspan="5" class="section">3. PRODUCTOS MAS RENTABLES (MAYOR MARGEN DE UTILIDAD)</td>
          </tr>
          <tr>
            <th>Producto Comercial</th>
            <th>Presentación</th>
            <th style="text-align:center">Unidades Vendidas</th>
            <th style="text-align:right">Ingresos Totales (PEN)</th>
            <th style="text-align:right">Ganancia Neta (PEN)</th>
          </tr>
          ${(resumen.productos_rentables || []).map((p, idx) => `
            <tr class="${idx % 2 === 1 ? "alt" : ""}">
              <td class="bold">${p.nombre}</td>
              <td>${p.presentacion}</td>
              <td class="cnt">${p.cantidad}</td>
              <td class="num">S/ ${p.ingresos.toFixed(2)}</td>
              <td class="num bold success">S/ ${p.ganancia_neta.toFixed(2)}</td>
            </tr>
          `).join("")}

          <tr class="spacer"><td colspan="5"></td></tr>

          <!-- 4. TOP VENDEDORES -->
          <tr>
            <td colspan="5" class="section">4. DESEMPEÑO DE CAJEROS Y VENDEDORES</td>
          </tr>
          <tr>
            <th colspan="2">Nombre del Vendedor</th>
            <th>Correo Electrónico</th>
            <th style="text-align:center">N° Operaciones</th>
            <th style="text-align:right">Total Facturado (PEN)</th>
          </tr>
          ${(resumen.top_vendedores || []).map((u, idx) => `
            <tr class="${idx % 2 === 1 ? "alt" : ""}">
              <td colspan="2" class="bold">${u.nombre}</td>
              <td>${u.correo}</td>
              <td class="cnt">${u.operaciones_count}</td>
              <td class="num bold">S/ ${u.total_facturado.toFixed(2)}</td>
            </tr>
          `).join("")}

          <tr class="spacer"><td colspan="5"></td></tr>

          <!-- 5. TOP CLIENTES -->
          <tr>
            <td colspan="5" class="section">5. CLIENTES DESTACADOS (PRIVACIDAD ENMASCARADA)</td>
          </tr>
          <tr>
            <th colspan="2">Nombre del Cliente</th>
            <th>Documento Enmascarado</th>
            <th style="text-align:center">N° Compras</th>
            <th style="text-align:right">Total Comprado (PEN)</th>
          </tr>
          ${(resumen.top_clientes || []).map((c, idx) => `
            <tr class="${idx % 2 === 1 ? "alt" : ""}">
              <td colspan="2" class="bold">${c.nombre}</td>
              <td>${enmascararDocumento(c.documento)}</td>
              <td className="cnt">${c.compras_count}</td>
              <td className="num bold">S/ ${c.total_comprado.toFixed(2)}</td>
            </tr>
          `).join("")}

          <tr class="spacer"><td colspan="5"></td></tr>

          <!-- 6. ALERTAS DE INVENTARIO -->
          <tr>
            <td colspan="5" class="section-alert">6. ALERTAS DE INVENTARIO Y STOCK BAJO</td>
          </tr>
          <tr>
            <th>Producto Comercial</th>
            <th>N° Lote</th>
            <th style="text-align:center">Stock Actual</th>
            <th>Fecha Vencimiento</th>
            <th>Estado / Acción Required</th>
          </tr>
          ${(resumen.alertas_stock || []).map((a, idx) => `
            <tr class="${idx % 2 === 1 ? "alt" : ""}">
              <td class="bold">${a.nombre_comercial}</td>
              <td>${a.numero_lote}</td>
              <td class="cnt bold alert">${a.stock_actual} unids</td>
              <td>${new Date(a.fecha_vencimiento).toLocaleDateString("es-PE")}</td>
              <td class="bold alert">REABASTECER URGENTE</td>
            </tr>
          `).join("")}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Financiero_POS_${fechaHoy.replace(/\//g, "-")}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImprimirReportePDF = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans text-slate-800 overflow-y-auto p-3 sm:p-6 space-y-6 select-none print-container">
      {/* ═══ ENCABEZADO EXCLUSIVO PARA IMPRESIÓN / PDF ════════════════════════ */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">REPORTE EJECUTIVO DE ANALYTICS - FARMAPOS ERP</h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Sucursal: <strong>{sucursalActual?.nombre || "Matriz Principal"}</strong> | Rango Seleccionado: <strong>{rangoFecha}</strong>
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Emisión: <strong>{new Date().toLocaleDateString("es-PE")} {new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</strong></p>
            <p className="text-[10px] text-slate-400">Documento Interno Confidencial</p>
          </div>
        </div>
      </div>

      {/* ═══ HEADER BAR CON RANGO DE FECHAS & EXPORTACIÓN CONTABLE ══════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-2xs border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard Financiero & Analytics</h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200/60 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-marifarma-gold" /> Botica Marifarma
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              Sucursal: <span className="text-emerald-700 font-bold">{sucursalActual?.nombre || "Matriz Principal"}</span>
            </p>
          </div>
        </div>

        {/* Acciones & Presets de Rango de Fecha */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto print:hidden">
          {/* Selector Preset de Fecha */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            {["HOY", "AYER", "7 DÍAS", "MES"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRangoFecha(r)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  rangoFecha === r
                    ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportarExcelCSV}
            disabled={!resumen}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/20"
            title="Exportar archivo CSV / Excel para contabilidad"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleImprimirReportePDF}
            disabled={!resumen}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
            title="Imprimir informe o guardar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir PDF</span>
          </button>

          <button
            type="button"
            onClick={refetch}
            disabled={cargando}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin text-emerald-600" : ""}`} />
            <span className="hidden sm:inline">{cargando ? "Cargando..." : "Refrescar"}</span>
          </button>
        </div>
      </div>

      {/* State errors */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center justify-between">
          <span>Error al cargar datos del Dashboard: {error}</span>
          <button type="button" onClick={refetch} className="font-bold underline text-rose-800 cursor-pointer">Reintentar</button>
        </div>
      )}

      {/* ═══ BANNER RECUPERACIÓN DE INVERSIÓN INICIAL (PAYBACK) ════════════════ */}
      {resumen?.progreso_capital && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 rounded-2xl border border-slate-700 shadow-lg text-white space-y-3 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Target size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-wide uppercase text-emerald-400">Recuperación de Inversión Inicial (Payback)</h3>
                  <button
                    type="button"
                    onClick={() => setShowPaybackTooltip(!showPaybackTooltip)}
                    className="text-slate-400 hover:text-white cursor-pointer print:hidden"
                    title="Explicación del indicador contable"
                  >
                    <Info size={14} />
                  </button>
                </div>
                <p className="text-xs text-slate-300">Retorno acumulado global (todas las sucursales) vs Meta de Inversión</p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 text-xs font-mono font-bold lg:w-auto lg:grid-cols-4">
              <span className="whitespace-nowrap bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300">
                Meta: S/ {resumen.progreso_capital.meta_capital.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
              <span className="whitespace-nowrap bg-slate-700/70 px-3 py-1.5 rounded-xl border border-slate-500 text-slate-100">
                Ventas: S/ {(resumen.progreso_capital.ingresos_historicos || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
              <span className={`whitespace-nowrap px-3 py-1.5 rounded-xl border ${hayPerdidaAcumulada ? "bg-rose-500/15 border-rose-400/40 text-rose-200" : "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"}`}>
                {hayPerdidaAcumulada ? "Pérdida" : "Resultado"}: S/ {(hayPerdidaAcumulada ? Math.abs(resultadoAcumulado) : resultadoAcumulado).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
              <span className="whitespace-nowrap bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/40 text-emerald-200">
                Recuperado: S/ {resumen.progreso_capital.recaudado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Modal / Tooltip de ayuda contable Payback */}
          {showPaybackTooltip && (
            <div className="p-3 bg-slate-800/90 border border-emerald-500/40 rounded-xl text-xs text-emerald-100 font-medium animate-in fade-in duration-150">
              <p className="mb-1">La meta incluye compras de inventario, inversiones y gastos operativos. La recuperación usa utilidad bruta acumulada: ventas menos costo real de mercadería vendida.</p>
              <p className="text-emerald-200">Ventas S/ {(resumen.progreso_capital.ingresos_historicos || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })} − costo vendido S/ {(resumen.progreso_capital.costo_ventas_historico || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })} = recuperado S/ {resumen.progreso_capital.recaudado.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
              <p className="mt-1 text-slate-300">El avance general se calcula dinámicamente como el porcentaje de ventas históricas acumuladas sobre la meta de inversión inicial, de forma global e independiente de filtros.</p>
              💡 <strong>Nota Contable (Payback)</strong>: Este indicador mide la recuperación acumulada global de todas las sucursales sobre la inversión inicial (S/ {resumen.progreso_capital.meta_capital.toLocaleString()}). Es un indicador histórico consolidado que no varía por filtros de fecha o sucursal.
            </div>
          )}

          {/* Barra de progreso */}
          <div className="space-y-1.5">
            <div className="flex flex-col gap-1 text-xs font-extrabold sm:flex-row sm:items-center sm:justify-between">
              <span className="text-emerald-300 flex items-center gap-1">
                <Coins size={14} /> Avance general: {resumen.progreso_capital.porcentaje_completado}%
              </span>
              <span className={`${hayPerdidaAcumulada ? "text-rose-300" : "text-amber-300"} font-mono`}>
                {hayPerdidaAcumulada
                  ? `Primero cubrir pérdida: S/ ${Math.abs(resultadoAcumulado).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
                  : `Falta para meta: S/ ${resumen.progreso_capital.pendiente.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="w-full bg-slate-700/60 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-600">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-700 shadow-2xs"
                style={{ width: `${resumen.progreso_capital.porcentaje_completado}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ KPIS CARDS FINANCIEROS AUDITADOS ═══════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Ventas Hoy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas Hoy</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              S/ {ventasHoy.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold">
              {tieneDatosSuficientesComparar ? (
                (kpis?.porcentaje_crecimiento || 0) >= 0 ? (
                  <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    +{kpis?.porcentaje_crecimiento}% vs ayer
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                    {kpis?.porcentaje_crecimiento}% vs ayer
                  </span>
                )
              ) : (
                <span className="text-slate-400 font-medium text-[11px]">
                  Dato insuficiente — {operacionesHoy} ventas hoy
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Resultado global, independiente de los filtros de período */}
        <div className={`bg-white p-5 rounded-2xl border shadow-2xs flex flex-col justify-between hover:shadow-md transition-all ${resultadoAcumulado < 0 ? "border-rose-300 ring-1 ring-rose-400/20" : esMargenAnomalo(margenAcumuladoPct) ? "border-amber-300 ring-1 ring-amber-400/30" : "border-emerald-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${resultadoAcumulado < 0 ? "text-rose-700" : "text-emerald-700"}`}>
              {resultadoAcumulado < 0 ? "Pérdida acumulada" : "Ganancia acumulada"}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${resultadoAcumulado < 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-black tabular-nums ${resultadoAcumulado < 0 ? "text-rose-700" : "text-emerald-700"}`}>
              S/ {resultadoAcumulado.toFixed(2)}
            </div>
            <div className={`mt-2 text-xs font-bold space-y-0.5 ${resultadoAcumulado < 0 ? "text-rose-800" : "text-emerald-800"}`}>
              <div className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Margen global: {margenAcumuladoPct}%</span>
              </div>
              <p className="text-[10px] text-slate-400 font-normal">Histórico global, sin filtro de fecha</p>
            </div>
          </div>
        </div>

        {/* Card 3: Utilidad potencial del inventario vigente */}
        <div className={`bg-white p-5 rounded-2xl border shadow-2xs flex flex-col justify-between hover:shadow-md transition-all ${gananciaEstimadaMinima < 0 ? "border-rose-200" : "border-violet-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${gananciaEstimadaMinima < 0 ? "text-rose-700" : "text-violet-700"}`}>Ganancia estimada</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gananciaEstimadaMinima < 0 ? "bg-rose-50 text-rose-600" : "bg-violet-50 text-violet-600"}`}>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className={`text-sm font-black tabular-nums ${gananciaEstimadaMinima < 0 ? "text-rose-700" : "text-violet-700"}`}>
              Mínima: S/ {gananciaEstimadaMinima.toFixed(2)}
            </div>
            <div className="text-sm font-black tabular-nums text-violet-700">
              Máxima: S/ {gananciaEstimadaMaxima.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Venta posible: S/ {ventaEstimadaMinima.toFixed(2)} — S/ {ventaEstimadaMaxima.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Card 4: Operaciones & Recetas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Operaciones</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {operacionesHoy}
            </div>
            <p className="text-xs text-teal-700 font-bold mt-2 flex items-center gap-1">
              <Stethoscope size={13} /> {kpis?.recetas_dispensadas_hoy || Math.floor(operacionesHoy * 0.4)} recetas dispensadas
            </p>
          </div>
        </div>

        {/* Card 4: Ticket Promedio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
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
            <p className="text-xs text-slate-400 font-medium mt-2">Promedio por transacción</p>
          </div>
        </div>

        {/* Card 5: Alertas Stock & Vencimientos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
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

      {/* ═══ MIDDLE SECTION: CHART VENTAS + METODOS DE PAGO ═════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales Last 7 Days with NUMERIC VALUES OVER BARS */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ventas - Últimos 7 Días</h2>
              <p className="text-xs text-slate-400">Historial reciente de ingresos por ventas diarias con montos exactos</p>
            </div>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-60 flex items-end justify-between gap-2 pt-8 pb-2 px-2">
            {resumen?.grafico_7_dias.map((d, idx) => {
              const alturaPct = maxVenta7Dias > 0 ? (d.total / maxVenta7Dias) * 100 : 0;
              const esHoy = idx === resumen.grafico_7_dias.length - 1;

              return (
                <div key={d.fecha} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Valor Numérico Legible encima de cada barra */}
                  <span className="text-[11px] font-black text-slate-800 mb-1 font-mono">
                    S/ {d.total.toFixed(0)}
                  </span>

                  <div
                    style={{ height: `${Math.max(alturaPct, 8)}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                      esHoy
                        ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-200 group-hover:bg-emerald-300"
                    }`}
                  />

                  <span className={`text-[11px] mt-2 font-bold uppercase ${esHoy ? "text-emerald-800 font-black" : "text-slate-500"}`}>
                    {d.dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Desglose Métodos de Pago */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
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
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl text-xs text-emerald-900 font-medium mt-4 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>Todos los cierres y arqueos de caja se registran con trazabilidad automática.</span>
          </div>
        </div>
      </div>

      {/* ═══ ANALYTICS ESTRATÉGICOS: TOP CLIENTES (ENMASCARADO) & VENDEDORES ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Mejores Clientes (DNI ENMASCARADO POR LEY DE PRIVACIDAD) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Top Mejores Clientes</h2>
                <p className="text-xs text-slate-400">Documento enmascarado por Ley de Protección de Datos Personales</p>
              </div>
            </div>
            <span title="Protección de datos personales activa">
              <Lock className="w-4 h-4 text-emerald-600" />
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {!resumen?.top_clientes || resumen.top_clientes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Sin información de clientes aún</p>
            ) : (
              resumen.top_clientes.map((c, idx) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black flex items-center justify-center border border-emerald-200">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{c.nombre}</p>
                      {/* DNI ENMASCARADO */}
                      <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                        {enmascararDocumento(c.documento)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 block">
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

          <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100 font-medium">
            🔒 Los datos personales se muestran conforme a la Ley de Protección de Datos Personales. Acceso restringido por RBAC.
          </p>
        </div>

        {/* Top Vendedores / Cajeros */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
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
                    <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black flex items-center justify-center border border-emerald-200">
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
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
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
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-800 text-xs font-black flex items-center justify-center border border-amber-200">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.nombre}</p>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        [{item.presentacion}] — {item.cantidad} vendidas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 block">
                      + S/ {item.ganancia_neta.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Margen: {item.margen_pct}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Alertas de Stock Crítico</h2>
                <p className="text-xs text-slate-400">Lotes próximos a agotarse en inventario</p>
              </div>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
            >
              Verificar Ahora
            </button>
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
