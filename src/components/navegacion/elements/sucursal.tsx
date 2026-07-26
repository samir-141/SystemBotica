import { Building2, ChevronDown, ChevronUp } from "lucide-react";

interface SucursalProps {
    isCollapsed: boolean;
    showSucursalDropdown: boolean;
    setShowSucursalDropdown: (v: boolean) => void;
    sucursalActual: any;
    sucursales: any;
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
    const tieneMultiplesSucursales = sucursales && sucursales.length > 1;

    return (
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
            <div className="relative">
                <button
                    type="button"
                    onClick={() => tieneMultiplesSucursales && !isCollapsed && setShowSucursalDropdown(!showSucursalDropdown)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800
                        text-[12px] font-semibold text-slate-200 border border-slate-700/50 transition-all
                        ${isCollapsed ? "justify-center" : "justify-between"}
                        ${tieneMultiplesSucursales && !isCollapsed ? "cursor-pointer hover:border-teal-500/30" : "cursor-default"}
                    `}
                    aria-haspopup="listbox"
                    aria-expanded={showSucursalDropdown}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <Building2 size={15} className="text-teal-400 shrink-0" />
                        {!isCollapsed && (
                            <span className="truncate">{sucursalActual?.nombre || "Sucursal Principal"}</span>
                        )}
                    </div>
                    {!isCollapsed && tieneMultiplesSucursales && (
                        showSucursalDropdown
                            ? <ChevronUp size={13} className="text-slate-400 shrink-0" />
                            : <ChevronDown size={13} className="text-slate-400 shrink-0" />
                    )}
                </button>

                {/* Dropdown Selector de Sucursal */}
                {showSucursalDropdown && !isCollapsed && sucursales && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[60] py-1 animate-slideDown">
                        <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-extrabold text-slate-500 border-b border-slate-700/50">
                            Cambiar Sucursal
                        </div>
                        {sucursales.map((suc: any) => (
                            <button
                                key={suc.id}
                                type="button"
                                role="option"
                                aria-selected={suc.id === sucursalActual?.id}
                                onClick={() => {
                                    if (cambiarSucursal) cambiarSucursal(suc);
                                    setShowSucursalDropdown(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 text-[12px] font-medium flex items-center justify-between hover:bg-slate-700 transition-colors cursor-pointer
                                    ${suc.id === sucursalActual?.id ? "text-teal-400 font-bold bg-slate-700/40" : "text-slate-300"}`}
                            >
                                <span className="truncate">{suc.nombre}</span>
                                {suc.es_principal && (
                                    <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-bold shrink-0 ml-1">
                                        Matriz
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}