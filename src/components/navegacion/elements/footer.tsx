import { LogOut } from "lucide-react";
interface FooterNavProps {
    isCollapsed: boolean;
    logout: () => void;
}
export default function FooterNav({ isCollapsed, logout }: FooterNavProps) {
    return (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/20">
            <button
                type="button"
                onClick={logout}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${isCollapsed ? "justify-center" : ""
                    }`}
                title="Cerrar Sesión"
            >
                <LogOut size={18} className="shrink-0" />
                {!isCollapsed && <span>Cerrar Sesión</span>}
            </button>
        </div>
    )
}