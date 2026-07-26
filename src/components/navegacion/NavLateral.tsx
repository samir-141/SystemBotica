import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import HeaderNav from "./elements/header";
import Sucursal from "./elements/sucursal";
import Usuarioperfil from "./elements/usuarioperfil";
import NavModulos from "./elements/NavModulos";
import FooterNav from "./elements/footer";
import { MENU_ITEMS } from "./config/perimisos";
import { useAuth } from "../../hooks/useAuth";

interface NavLateralProps {
    /** El estado abierto del drawer en mobile (viene del padre Nav.tsx) */
    mobileOpen?: boolean;
    /** Callback para cerrar el drawer en mobile */
    onMobileClose?: () => void;
}

export default function NavLateral({ mobileOpen = false, onMobileClose }: NavLateralProps) {
    const { user, sucursalActual, sucursales, cambiarSucursal, logout } = useAuth();
    const location = useLocation();

    // Sidebar colapsado — solo relevante en ≥ lg
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showSucursalDropdown, setShowSucursalDropdown] = useState(false);

    // Cerrar el dropdown de sucursal al navegar
    useEffect(() => {
        setShowSucursalDropdown(false);
    }, [location.pathname]);

    const rolUsuario: string = (user as any)?.rol || "Cajero";

    const modulosPermitidos = MENU_ITEMS.filter((item) => {
        if (!item.rolesPermitidos) return true;
        return item.rolesPermitidos.includes(rolUsuario);
    });

    // ────────────────────────────────────────────────────────────────────────────
    // SIDEBAR CONTENT (reutilizado en mobile drawer + desktop sidebar)
    // ────────────────────────────────────────────────────────────────────────────
    const sidebarContent = (collapsed: boolean) => (
        <>
            <HeaderNav isCollapsed={collapsed} setIsCollapsed={setIsCollapsed} />
            <Sucursal
                isCollapsed={collapsed}
                setShowSucursalDropdown={setShowSucursalDropdown}
                sucursalActual={sucursalActual}
                showSucursalDropdown={showSucursalDropdown}
                sucursales={sucursales}
                cambiarSucursal={cambiarSucursal}
            />
            <Usuarioperfil isCollapsed={collapsed} user={user} rolUsuario={rolUsuario} />
            <NavModulos
                isCollapsed={collapsed}
                modulosPermitidos={modulosPermitidos}
                onLinkClick={onMobileClose}
            />
            <FooterNav isCollapsed={collapsed} logout={() => { logout(); onMobileClose?.(); }} />
        </>
    );

    return (
        <>
            {/* ══════════════════════════════════════════════
                MOBILE DRAWER (< lg)
                - Aparece como overlay deslizante desde la izquierda
                - Se abre/cierra desde el padre (Nav.tsx) con mobileOpen
            ══════════════════════════════════════════════ */}
            {/* Overlay backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden
                    ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onMobileClose}
                aria-hidden="true"
            />

            {/* Mobile Drawer Panel */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                aria-label="Menú de navegación"
            >
                {sidebarContent(false)}
            </aside>

            {/* ══════════════════════════════════════════════
                DESKTOP SIDEBAR (≥ lg)
                - Siempre visible, puede colapsarse a modo icono
            ══════════════════════════════════════════════ */}
            <aside
                className={`hidden lg:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 h-full shrink-0 transition-all duration-300 ease-in-out select-none relative z-30
                    ${isCollapsed ? "w-[72px]" : "w-64"}`}
                aria-label="Menú lateral"
            >
                {sidebarContent(isCollapsed)}
            </aside>
        </>
    );
}