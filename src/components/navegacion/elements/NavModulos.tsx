import { NavLink } from "react-router-dom";

interface MenuItem {
    path: string;
    label: string;
    labelCorto?: string;
    icon: React.ElementType;
}

interface Props {
    isCollapsed: boolean;
    modulosPermitidos: MenuItem[];
    onLinkClick?: () => void;
}

export default function NavModulos({ isCollapsed, modulosPermitidos, onLinkClick }: Props) {
    return (
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-none">
            {modulosPermitidos.map((item) => {
                const Icon = item.icon;

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onLinkClick}
                        className={({ isActive }) =>
                            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 select-none cursor-pointer
                            ${isActive
                                ? "bg-teal-600/15 text-teal-400 border border-teal-500/20 font-bold shadow-sm"
                                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 border border-transparent"
                            }
                            ${isCollapsed ? "justify-center" : ""}`
                        }
                        title={isCollapsed ? item.label : undefined}
                    >
                        <Icon size={19} className="shrink-0 group-hover:scale-110 transition-transform duration-150" />
                        {!isCollapsed && (
                            <span className="truncate leading-tight">{item.label}</span>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}