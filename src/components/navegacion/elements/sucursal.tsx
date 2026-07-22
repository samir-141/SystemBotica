import { Building2, ChevronDown } from "lucide-react";
interface SucursalProps {
    isCollapsed: boolean;
    showSucursalDropdown: boolean;
    setShowSucursalDropdown: (showSucursalDropdown: boolean) => void;
    sucursalActual: any;
    sucursales: any;
    cambiarSucursal: (sucursal: any) => void;
}
export default function Sucursal({ isCollapsed, setShowSucursalDropdown, sucursalActual, showSucursalDropdown, sucursales, cambiarSucursal }: SucursalProps) {
    return (
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !isCollapsed && setShowSucursalDropdown(!showSucursalDropdown)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/50 transition-all ${isCollapsed ? "justify-center" : "justify-between"
                        }`}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Building2 size={16} className="text-teal-400 shrink-0" />
                        {!isCollapsed && (
                            <span className="truncate">
                                {sucursalActual?.nombre || "Sucursal Principal"}
                            </span>
                        )}
                    </div>
                    {!isCollapsed && sucursales && sucursales.length > 1 && (
                        <ChevronDown size={14} className="text-slate-400 shrink-0" />
                    )}
                </button>

                {/* Dropdown Selector de Sucursal */}
                {showSucursalDropdown && !isCollapsed && sucursales && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-slate-700/50">
                            Cambiar Sucursal
                        </div>
                        {sucursales.map((suc: any) => (
                            <button
                                key={suc.id}
                                type="button"
                                onClick={() => {
                                    if (cambiarSucursal) cambiarSucursal(suc);
                                    setShowSucursalDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-700 transition ${suc.id === sucursalActual?.id ? "text-teal-400 font-bold bg-slate-700/40" : "text-slate-300"
                                    }`}
                            >
                                <span className="truncate">{suc.nombre}</span>
                                {suc.es_principal && (
                                    <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-bold">
                                        Matriz
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}