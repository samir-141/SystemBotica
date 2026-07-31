import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import MarifarmaBrand from "../../brand/MarifarmaBrand";

interface HeaderNavProps {
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

export default function HeaderNav({ isCollapsed, setIsCollapsed }: HeaderNavProps) {
    const { sucursalActual } = useAuth();
    const nombreEmpresa = sucursalActual?.empresa || "Botica Marifarma";
    const nombreSucursal = sucursalActual?.nombre || "Sistema de Farmacia";

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 min-h-[56px] shrink-0">
            {!isCollapsed && (
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="min-w-0">
                        <MarifarmaBrand compact dark />
                        <p className="text-[9px] text-slate-500 font-bold leading-tight truncate max-w-[150px]" title={nombreSucursal}>
                            {nombreEmpresa === "Botica Marifarma" ? nombreSucursal : `${nombreEmpresa} · ${nombreSucursal}`}
                        </p>
                    </div>
                </div>
            )}

            {/* Botón Colapsar Sidebar — solo en ≥ lg */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer hidden lg:flex items-center justify-center ${isCollapsed ? "mx-auto" : "shrink-0"}`}
                title={isCollapsed ? "Expandir Menú" : "Colapsar Menú"}
                aria-label={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
            >
                {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
        </div>
    );
}
