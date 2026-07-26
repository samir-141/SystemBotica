import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, BriefcaseMedical } from "lucide-react";
import { NavLink } from "react-router-dom";
import NavLateral from "../../components/navegacion/NavLateral";
import { MENU_ITEMS } from "../../components/navegacion/config/perimisos";
import { useAuth } from "../../hooks/useAuth";

/**
 * Nav — Layout principal del POS
 *
 * Mobile-first:
 *  - < lg : Top bar con botón hamburguesa + Drawer lateral (NavLateral)
 *            + Bottom Tab Bar con los primeros 5 módulos accesibles
 *  - ≥ lg : Sidebar colapsable a la izquierda (sin top/bottom bar)
 */
export default function Nav() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { user } = useAuth();

    const rolUsuario: string = (user as any)?.rol || "Cajero";
    const modulosPermitidos = MENU_ITEMS.filter((item) => {
        if (!item.rolesPermitidos) return true;
        return item.rolesPermitidos.includes(rolUsuario);
    });

    // Solo los primeros 5 para la barra inferior en mobile
    const tabItems = modulosPermitidos.slice(0, 5);

    return (
        <div className="flex flex-col h-svh w-screen bg-slate-100 overflow-hidden lg:flex-row">
            {/* ══════════════════════════════════════════════
                MOBILE — Top bar (< lg)
            ══════════════════════════════════════════════ */}
            <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800 shrink-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg">
                        <BriefcaseMedical className="w-4.5 h-4.5" size={18} />
                    </div>
                    <span className="text-base font-black text-white tracking-tight">
                        Farma<span className="text-teal-400">POS</span>
                    </span>
                </div>

                <button
                    type="button"
                    id="btn-abrir-menu-movil"
                    onClick={() => setMobileNavOpen(true)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Abrir menú de navegación"
                    aria-expanded={mobileNavOpen}
                >
                    {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </header>

            {/* ══════════════════════════════════════════════
                SIDEBAR (desktop) + DRAWER (mobile)
            ══════════════════════════════════════════════ */}
            <NavLateral
                mobileOpen={mobileNavOpen}
                onMobileClose={() => setMobileNavOpen(false)}
            />

            {/* ══════════════════════════════════════════════
                ÁREA PRINCIPAL DE CONTENIDO
            ══════════════════════════════════════════════ */}
            <main className="flex-1 min-w-0 overflow-auto bg-slate-100 pb-[72px] lg:pb-0">
                <Outlet />
            </main>

            {/* ══════════════════════════════════════════════
                MOBILE — Bottom Tab Bar (< lg)
                Navegación rápida para los módulos principales
            ══════════════════════════════════════════════ */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800
                    flex items-stretch justify-around px-1 h-[68px] shadow-2xl shadow-black/40"
                aria-label="Navegación inferior"
            >
                {tabItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded-xl mx-0.5 my-2 transition-all duration-150 cursor-pointer text-center
                                ${isActive
                                    ? "bg-teal-600/15 text-teal-400 border border-teal-500/20"
                                    : "text-slate-500 hover:text-slate-200 border border-transparent active:bg-slate-800"
                                }`
                            }
                            aria-label={(item as any).labelCorto || item.label}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={21}
                                        className={`shrink-0 transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
                                    />
                                    <span className="text-[10px] font-bold leading-tight truncate max-w-full">
                                        {(item as any).labelCorto || item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}