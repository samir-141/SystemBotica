import React from "react";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    BarChart3,
    Settings
} from "lucide-react";

interface MenuItem {
    label: string;
    icon: React.ElementType;
    path: string;
    rolesPermitidos?: string[];
    /** Etiqueta corta para barra inferior mobile */
    labelCorto?: string;
}

export const MENU_ITEMS: MenuItem[] = [
    {
        label: "Ventas (POS)",
        labelCorto: "Ventas",
        icon: ShoppingCart,
        path: "/ventas/nueva",
        rolesPermitidos: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
    },
    {
        label: "Dashboard",
        labelCorto: "Panel",
        icon: LayoutDashboard,
        path: "/dashboard",
        rolesPermitidos: ["Administrador", "Farmacéutico"],
    },
    {
        label: "Productos e Inventario",
        labelCorto: "Productos",
        icon: Package,
        path: "/productos",
        rolesPermitidos: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
    },
    {
        label: "Clientes",
        labelCorto: "Clientes",
        icon: Users,
        path: "/clientes",
        rolesPermitidos: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
    },
    {
        label: "Reportes",
        labelCorto: "Reportes",
        icon: BarChart3,
        path: "/reportes/ventas",
        rolesPermitidos: ["Administrador", "Farmacéutico"],
    },
    {
        label: "Administración",
        labelCorto: "Admin",
        icon: Settings,
        path: "/admin/usuarios",
        rolesPermitidos: ["Administrador"],
    },
];