import { useState } from "react";


import HeaderNav from "./elements/header"
import Sucursal from "./elements/sucursal"
import { useAuth } from "../../hooks/useAuth"; // Asegúrate de ajustar la ruta a tu Hook de Auth
import Usuarioperfil from "./elements/usuarioperfil";
import NavModulos from "./elements/NavModulos";
import FooterNav from "./elements/footer";
import { MENU_ITEMS } from "./config/perimisos";

export default function NavLateral() {
    const { user, sucursalActual, sucursales, cambiarSucursal, logout } = useAuth();

    // Estados de UI
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showSucursalDropdown, setShowSucursalDropdown] = useState(false);

    // Obtener rol del usuario actual (fallback si no existe)
    const rolUsuario = user?.rol || "Cajero";

    // ─── Filtrar Módulos según Permisos del Rol ──────────────────────────
    const modulosPermitidos = MENU_ITEMS.filter((item) => {
        if (!item.rolesPermitidos) return true;
        return item.rolesPermitidos.includes(rolUsuario);
    });

    return (
        <aside
            className={`bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col border-r border-slate-800 h-screen select-none relative z-30 shrink-0 ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            {/* ════════ 1. HEADER / BRAND LOGO ════════ */}
            <HeaderNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            {/* ════════ 2. CONTROL DE SUCURSAL ACTUAL ════════ */}

            <Sucursal isCollapsed={isCollapsed} setShowSucursalDropdown={setShowSucursalDropdown} sucursalActual={sucursalActual} showSucursalDropdown={showSucursalDropdown} sucursales={sucursales} cambiarSucursal={cambiarSucursal} />
            {/* ════════ 3. PERFIL DE USUARIO Y ROL ════════ */}

            <Usuarioperfil isCollapsed={isCollapsed} user={user} rolUsuario={rolUsuario} />
            {/* ════════ 4. MENÚ DE MÓDULOS FILTRADOS ════════ */}
            <NavModulos isCollapsed={isCollapsed} modulosPermitidos={modulosPermitidos} />

            {/* ════════ 5. FOOTER / CERRAR SESIÓN ════════ */}
            <FooterNav isCollapsed={isCollapsed} logout={logout} />
        </aside>
    );
}