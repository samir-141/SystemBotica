
import { NavLink } from "react-router-dom";

interface props {

    isCollapsed: boolean;
    modulosPermitidos: Array<{
        path: string;
        label: string;
        icon: React.ElementType;
    }>;
}
export default function NavModulos({ isCollapsed, modulosPermitidos }: props) {
    return (
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
            {modulosPermitidos.map((item) => {
                const Icon = item.icon;

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all group ${isActive
                                ? "bg-teal-600/15 text-teal-400 border border-teal-500/20 font-bold shadow-sm"
                                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                            } ${isCollapsed ? "justify-center" : ""}`
                        }
                        title={isCollapsed ? item.label : undefined}
                    >
                        <Icon size={18} className="shrink-0 group-hover:scale-110 transition-transform" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                );
            })}
        </nav>
    )
}