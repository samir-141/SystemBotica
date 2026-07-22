import React from "react";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    FileText,
    Settings
} from "lucide-react";
interface MenuItem {
    label: string;
    icon: React.ElementType;
    path: string;
    rolesPermitidos?: string[]; // Si no se define, está disponible para todos
}

export const MENU_ITEMS: MenuItem[] = [
    {
        label: "Ventas (POS)",
        icon: ShoppingCart,
        path: "/ventas/nueva",
        rolesPermitidos: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
    },
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        rolesPermitidos: ["Administrador", "Farmacéutico"],
    },
    {
        label: "Productos e Inventario",
        icon: Package,
        path: "/productos",
        rolesPermitidos: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
    },
    {
        label: "Clientes",
        icon: Users,
        path: "/clientes",
        rolesPermitidos: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
    },
    {
        label: "Reportes",
        icon: FileText,
        path: "/reportes/ventas",
        rolesPermitidos: ["Administrador"],
    },
    {
        label: "Administración",
        icon: Settings,
        path: "/admin/usuarios",
        rolesPermitidos: ["Administrador"],
    },
];