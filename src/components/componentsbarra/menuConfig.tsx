import type { MenuItemType } from "./types";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    FileText,
    Settings
} from "lucide-react";

export const menuConfig: MenuItemType[] = [
    {
        label: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        url: "/dashboard"
    },
    {
        label: "Ventas (POS)",
        icon: <ShoppingCart size={20} />,
        url: "/pos"
    },
    {
        label: "Inventario",
        icon: <Package size={20} />,
        submenu: [
            { label: "Productos", url: "/inventario/productos" },
            { label: "Control de Lotes", url: "/inventario/lotes" },
            { label: "Vencimientos", url: "/inventario/vencimientos" }
        ]
    },
    {
        label: "Clientes",
        icon: <Users size={20} />,
        url: "/clientes"
    },
    {
        label: "Reportes",
        icon: <FileText size={20} />,
        submenu: [
            { label: "Cierres de Caja", url: "/reportes/cajas" },
            { label: "Ventas Diarias", url: "/reportes/ventas" }
        ]
    },
    {
        label: "Configuración",
        icon: <Settings size={20} />,
        url: "/config"
    }
];