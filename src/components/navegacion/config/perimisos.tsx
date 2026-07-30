import React from "react";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    BarChart3,
    Settings,
    Receipt
} from "lucide-react";

export interface MenuItem {
    label: string;
    icon: React.ElementType;
    path: string;
    rolesPermitidos?: string[];
    /** Etiqueta corta para barra inferior mobile */
    labelCorto?: string;
}

/** Compara roles sin depender de mayúsculas, tildes o del formato de la BD. */
export const normalizarRol = (rol?: string | null) =>
    String(rol || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();

export const tieneRolPermitido = (
    rol: string | null | undefined,
    rolesPermitidos?: string[],
) =>
    !rolesPermitidos ||
    rolesPermitidos.some((permitido) => normalizarRol(permitido) === normalizarRol(rol));

export const ROLES = {
    OPERACION: ['Administrador', 'Gerente', 'Farmacéutico', 'Cajero', 'Vendedor', 'Almacenero'],
    SUPERVISION: ['Administrador', 'Gerente', 'Farmacéutico', 'Contador'],
    ADMINISTRACION: ['Administrador'],
} as const;

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
    {
        label: "Gastos e Inversiones",
        labelCorto: "Gastos",
        icon: Receipt,
        path: "/gastos",
        rolesPermitidos: ["Administrador"],
    },
];
