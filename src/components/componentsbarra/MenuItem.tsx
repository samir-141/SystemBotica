import { ChevronDown, ChevronUp } from "lucide-react";
import type { MenuItemType } from "../elementosglobales/types";
// 1. Definimos la estructura exacta que tiene un submenú

// 2. Definimos la estructura completa del ítem del menú principal
/*interface MenuItemType {
    label: string;
    icon: React.ReactNode;
    url?: string;
    submenu?: SubmenuItem[];
}*/

interface MenuItemProps {
    item: MenuItemType; // <-- Cambiado de {} al tipo real
    isCollapsed: boolean;
    isOpen: boolean;
    onToggle: () => void;
}

export default function MenuItem({ item, isCollapsed, isOpen, onToggle }: MenuItemProps) {
    const hasSubmenu = !!item.submenu;

    if (hasSubmenu) {
        return (
            <div>
                <button
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all group ${isOpen ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800/60 hover:text-white"
                        }`}
                    onClick={onToggle}
                >
                    <div className="flex items-center gap-3">
                        <span className={`${isOpen ? "text-teal-400" : "text-slate-400 group-hover:text-teal-400"}`}>
                            {item.icon}
                        </span>
                        {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                        <span>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                    )}
                </button>

                {/* Submenú */}
                {isOpen && !isCollapsed && item.submenu && (
                    <ul className="mt-1 ml-9 pl-3 border-l border-slate-800 space-y-1">
                        {item.submenu.map((sub) => ( // <-- TS ya sabe perfectamente qué es 'sub'
                            <li key={sub.label}>
                                <a
                                    href={sub.url}
                                    className="block py-2 px-3 text-xs text-slate-400 hover:text-white rounded transition-colors hover:bg-slate-800/30"
                                >
                                    {sub.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    return (
        <a
            href={item.url}
            className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all hover:bg-slate-800/60 hover:text-white group"
        >
            <span className="text-slate-400 group-hover:text-teal-400 transition-colors">
                {item.icon}
            </span>
            {!isCollapsed && <span>{item.label}</span>}
        </a>
    );
}