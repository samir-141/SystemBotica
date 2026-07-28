import { Building2, ChevronDown, ChevronUp, Lock, Check } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

interface SucursalProps {
    isCollapsed: boolean;
    showSucursalDropdown: boolean;
    setShowSucursalDropdown: (v: boolean) => void;
    sucursalActual: any;
    sucursales: any[];
    cambiarSucursal: (sucursal: any) => void;
}

export default function Sucursal({
    isCollapsed,
    setShowSucursalDropdown,
    sucursalActual,
    showSucursalDropdown,
    sucursales,
    cambiarSucursal,
}: SucursalProps) {
    const { user } = useAuth();

    const rolUpper = String(user?.rol || "").toUpperCase();
    const esAdmin = rolUpper.includes("ADMIN") || rolUpper.includes("PROPIETARIO") || rolUpper === "GERENTE";

    const tieneMultiplesSucursales = Array.isArray(sucursales) && sucursales.length > 1;
    const puedeCambiarSucursal = esAdmin && tieneMultiplesSucursales;

    return (
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
            <div className="relative">
                <button
                    type="button"
                    onClick={() => {
                        if (puedeCambiarSucursal && !isCollapsed) {
                            setShowSucursalDropdown(!showSucursalDropdown);
                        }
                    }}
                    disabled={!puedeCambiarSucursal}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all
                        ${isCollapsed ? "justify-center" : "justify-between"}
                        ${puedeCambiarSucursal && !isCollapsed 
                            ? "bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-teal-500/30 cursor-pointer hover:border-teal-400" 
                            : "bg-slate-900/50 text-slate-400 border border-slate-800 cursor-default opacity-85"}
                    `}
                    title={!esAdmin ? "Sucursal fija (Cambio restringido a Administradores)" : undefined}
                    aria-haspopup="listbox"
                    aria-expanded={showSucursalDropdown}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <Building2 size={15} className={esAdmin ? "text-teal-400 shrink-0" : "text-slate-500 shrink-0"} />
                        {!isCollapsed && (
                            <div className="flex flex-col text-left truncate">
                                <span className="truncate font-bold text-slate-200">{sucursalActual?.nombre || "Sucursal Principal"}</span>
                                <span className="text-[9px] text-slate-500 font-medium">
                                    {esAdmin ? "Cambiar sucursal..." : "Sucursal Asignada"}
                                </span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        puedeCambiarSucursal ? (
                            showSucursalDropdown
                                ? <ChevronUp size={13} className="text-teal-400 shrink-0" />
                                : <ChevronDown size={13} className="text-teal-400 shrink-0" />
                        ) : (
                            <span title="Solo Administrador">
                                <Lock size={12} className="text-slate-600 shrink-0" />
                            </span>
                        )
                    )}
                </button>

                {/* Dropdown Selector de Sucursal */}
                {showSucursalDropdown && !isCollapsed && puedeCambiarSucursal && sucursales && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-teal-500/40 rounded-xl shadow-2xl overflow-hidden z-[60] py-1 animate-slideDown">
                        <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-extrabold text-teal-400 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                            <span>Seleccionar Sucursal</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">Admin</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {sucursales.map((suc: any) => {
                                const esSeleccionada = suc.id === sucursalActual?.id;
                                return (
                                    <button
                                        key={suc.id}
                                        type="button"
                                        role="option"
                                        aria-selected={esSeleccionada}
                                        onClick={() => {
                                            if (cambiarSucursal) {
                                                cambiarSucursal(suc.id || suc);
                                            }
                                            setShowSucursalDropdown(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-[12px] font-medium flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer
                                            ${esSeleccionada ? "text-teal-300 font-bold bg-teal-950/40 border-l-2 border-teal-400" : "text-slate-300"}`}
                                    >
                                        <div className="truncate">
                                            <span className="truncate block font-bold">{suc.nombre}</span>
                                            {suc.empresa && <span className="text-[10px] text-slate-500 block truncate">{suc.empresa}</span>}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-1">
                                            {esSeleccionada && <Check size={12} className="text-teal-400" />}
                                            {suc.es_principal && (
                                                <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-bold">
                                                    Matriz
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}