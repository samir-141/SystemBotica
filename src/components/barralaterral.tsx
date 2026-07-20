// src/components/common/Layout.tsx

import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    ShoppingCart,
    Boxes,
    Users,
    BarChart3,
    Settings,
    Building2,
    LogOut,
    HomeIcon
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const Layout: React.FC = () => {
    const {
        user,
        sucursalActual,
        logout,
    } = useAuth();

    const navigate = useNavigate();

    const [isCollapsed, setIsCollapsed] = useState(false);

    const menu = [
        {
            label: "Inicio",
            icon: HomeIcon,
            path: "/",
        },
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard",
        },
        {
            label: "Ventas",
            icon: ShoppingCart,
            path: "/ventas/nueva",
        },
        {
            label: "Inventario",
            icon: Boxes,
            path: "/productos",
        },
        {
            label: "Clientes",
            icon: Users,
            path: "/clientes",
        },
        {
            label: "Reportes",
            icon: BarChart3,
            path: "/reportes/ventas",
        },
    ];

    if (user?.rol === "ADMIN") {
        menu.push({
            label: "Administración",
            icon: Settings,
            path: "/admin/usuarios",
        });
    }

    return (
        <div className="flex h-screen bg-slate-100">

            {/* SIDEBAR */}

            <aside
                className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 ${isCollapsed ? "w-20" : "w-64"
                    }`}
            >
                {/* Logo */}

                <div className="flex items-center justify-between p-4 border-b border-slate-800">

                    {!isCollapsed && (
                        <h1 className="text-xl font-bold">
                            <span className="text-teal-400">
                                Farma
                            </span>
                            <span className="text-white">
                                POS
                            </span>
                        </h1>
                    )}

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                    >
                        {isCollapsed ? (
                            <ChevronRight size={18} />
                        ) : (
                            <ChevronLeft size={18} />
                        )}
                    </button>
                </div>

                {/* Usuario */}

                <div className="p-4 border-b border-slate-800 flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white">
                        {user?.nombre?.charAt(0).toUpperCase()}
                    </div>

                    {!isCollapsed && (
                        <div>
                            <p className="font-semibold text-white">
                                {user?.nombre}
                            </p>

                            <p className="text-xs text-slate-400">
                                {user?.rol}
                            </p>
                        </div>
                    )}

                </div>

                {/* Menu */}

                <div className="flex-1 p-3">

                    {menu.map((item) => {

                        const Icon = item.icon;

                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors"
                            >
                                <Icon size={20} />

                                {!isCollapsed && (
                                    <span>{item.label}</span>
                                )}
                            </button>
                        );
                    })}

                </div>

                {/* Footer */}

                {!isCollapsed && (
                    <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
                        FarmaPOS v1.0.0
                    </div>
                )}
            </aside>

            {/* CONTENIDO */}

            <div className="flex flex-col flex-1 overflow-hidden">

                {/* TOPBAR */}

                <header className="h-16 bg-slate-900 text-slate-200 border-b border-slate-800 px-6 flex items-center justify-between">

                    <div className="flex items-center text-white gap-2 text-slate-600">

                        <Building2 size={18} />

                        <span className="font-medium">
                            {sucursalActual?.nombre}
                        </span>

                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600"
                    >
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>

                </header>

                {/* PAGINAS */}

                <main className="flex-1 overflow-auto p-0 bg-slate-100">

                    <Outlet />

                </main>

            </div>

        </div>
    );
};

export default Layout;