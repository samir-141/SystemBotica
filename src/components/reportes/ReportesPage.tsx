import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileText,
  BarChart3,
  Package,
  Store,
  Sparkles,
  Layers
} from "lucide-react";
import { useReportes } from "./hooks/useReportes";
import { useAuth } from "../../hooks/useAuth";
import ReporteVentas from "./elements/ReporteVentas";
import ReporteInventario from "./elements/ReporteInventario";

type TabType = "ventas" | "inventario";

export default function ReportesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sucursalActual } = useAuth();

  // Determinar pestaña activa por ruta o estado
  const initialTab: TabType = location.pathname.includes("inventario") ? "inventario" : "ventas";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const {
    reporteVentas,
    reporteInventario,
    loadingVentas,
    loadingInventario,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    refetchVentas,
    refetchInventario,
  } = useReportes();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "inventario") {
      navigate("/reportes/inventario");
    } else {
      navigate("/reportes/ventas");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans text-slate-800 overflow-y-auto p-3 sm:p-6 space-y-6">
      {/* ═══ HEADER & PESTAÑAS ════════════════════════════════════════ */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Centro de Reportes POS</h1>
              <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-purple-200/60 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" /> Analítica
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              Sucursal: <span className="text-teal-700 font-bold">{sucursalActual?.nombre || "Matriz Principal"}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleTabChange("ventas")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "ventas"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Ventas & Finanzas</span>
          </button>
          <button
            onClick={() => handleTabChange("inventario")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "inventario"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario & FEFO</span>
          </button>
        </div>
      </div>

      {/* ═══ CONTENIDO DE LA PESTAÑA ACTIVA ═══════════════════════════ */}
      {activeTab === "ventas" ? (
        <ReporteVentas
          reporte={reporteVentas}
          loading={loadingVentas}
          fechaInicio={fechaInicio}
          setFechaInicio={setFechaInicio}
          fechaFin={fechaFin}
          setFechaFin={setFechaFin}
          onRefresh={refetchVentas}
        />
      ) : (
        <ReporteInventario
          reporte={reporteInventario}
          loading={loadingInventario}
          onRefresh={refetchInventario}
        />
      )}
    </div>
  );
}
