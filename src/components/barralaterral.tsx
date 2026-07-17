import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { menuConfig } from "./componentsbarra/menuConfig";
import ProfileSection from "./componentsbarra/ProfileSection";
import MenuItem from "./componentsbarra/MenuItem";
import { FindUsers } from "../config/api.data";


export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const users = FindUsers();

    const session = users[0];

    const handleToggleSubMenu = (label: string) => {
        setOpenSubMenu(openSubMenu === label ? null : label);
    };

    return (
        <nav
            className={`h-screen bg-slate-900 text-slate-300 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-slate-800 ${isCollapsed ? "w-20" : "w-64"
                }`}
            aria-label="POS Navigation"
        >
            <div>
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-800">
                    {!isCollapsed && (
                        <span className="font-extrabold text-xl text-teal-400 tracking-wider">
                            Botica<span className="text-white">Marifarma</span>
                        </span>
                    )}
                    <button
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors mx-auto"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Perfil */}
                <ProfileSection session={session} isCollapsed={isCollapsed} />

                {/* Menú */}
                <ul className="p-3 space-y-1">
                    {menuConfig.map((item) => (
                        <li key={item.label}>
                            <MenuItem
                                item={item}
                                isCollapsed={isCollapsed}
                                isOpen={openSubMenu === item.label}
                                onToggle={() => handleToggleSubMenu(item.label)}
                            />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-4 text-center text-[10px] text-slate-600 border-t border-slate-800">
                    FarmaPOS v1.0.0
                </div>
            )}
        </nav>
    );
}