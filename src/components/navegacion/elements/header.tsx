import { ChevronLeft, ChevronRight, BriefcaseMedical } from "lucide-react";
interface HeaderNavProps {
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}
export default function HeaderNav({ isCollapsed, setIsCollapsed }: HeaderNavProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 h-16">
            {!isCollapsed && (
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
                        <BriefcaseMedical className="w-5 h-5" />
                    </div>
                    <h1 className="text-lg font-black tracking-tight text-white">
                        Farma<span className="text-teal-400">POS</span>
                    </h1>
                </div>
            )}

            {/* Botón Colapsar Sidebar */}
            <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ${isCollapsed ? "mx-auto" : ""
                    }`}
                title={isCollapsed ? "Expandir Menú" : "Colapsar Menú"}
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </div>

    )
}