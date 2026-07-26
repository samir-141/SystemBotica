import { ChevronLeft, ChevronRight, BriefcaseMedical } from "lucide-react";

interface HeaderNavProps {
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
}

export default function HeaderNav({ isCollapsed, setIsCollapsed }: HeaderNavProps) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 min-h-[56px] shrink-0">
            {!isCollapsed && (
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl shrink-0">
                        <BriefcaseMedical className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base font-black tracking-tight text-white leading-tight">
                            Farma<span className="text-teal-400">POS</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">Sistema de Farmacia</p>
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