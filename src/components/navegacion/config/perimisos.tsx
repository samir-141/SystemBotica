import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Receipt,
  Truck,
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
  String(rol || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

export const tieneRolPermitido = (
  rol: string | null | undefined,
  rolesPermitidos?: string[],
) =>
  !rolesPermitidos ||
  rolesPermitidos.some(
    (permitido) => normalizarRol(permitido) === normalizarRol(rol),
  );

/** Fuente única de autorización visual y de rutas. */
export const CAPACIDADES = {
  VENTAS_POS: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
  DASHBOARD: ["Administrador", "Gerente", "Farmacéutico", "Contador"],
  INVENTARIO_GESTION: [
    "Administrador",
    "Gerente",
    "Farmacéutico",
    "Almacenero",
  ],
  CLIENTES: ["Administrador", "Gerente", "Farmacéutico", "Cajero", "Vendedor"],
  REPORTES: ["Administrador", "Gerente", "Farmacéutico", "Contador"],
  ADMINISTRACION: ["Administrador"],
  GASTOS: ["Administrador"],
  COMPRAS: ["Administrador", "Gerente", "Almacenero"],
} as const;

// Compatibilidad temporal para consumidores existentes. No agregar roles fuera de CAPACIDADES.
export const ROLES = {
  OPERACION: CAPACIDADES.VENTAS_POS,
  SUPERVISION: CAPACIDADES.DASHBOARD,
  ADMINISTRACION: CAPACIDADES.ADMINISTRACION,
} as const;

export const MENU_ITEMS: MenuItem[] = [
  {
    label: "Ventas (POS)",
    labelCorto: "Ventas",
    icon: ShoppingCart,
    path: "/ventas/nueva",
    rolesPermitidos: [...CAPACIDADES.VENTAS_POS],
  },
  {
    label: "Dashboard",
    labelCorto: "Panel",
    icon: LayoutDashboard,
    path: "/dashboard",
    rolesPermitidos: [...CAPACIDADES.DASHBOARD],
  },
  {
    label: "Productos e Inventario",
    labelCorto: "Productos",
    icon: Package,
    path: "/productos",
    rolesPermitidos: [...CAPACIDADES.INVENTARIO_GESTION],
  },
  {
    label: "Compras y Proveedores",
    labelCorto: "Compras",
    icon: Truck,
    path: "/compras",
    rolesPermitidos: [...CAPACIDADES.COMPRAS],
  },
  {
    label: "Clientes",
    labelCorto: "Clientes",
    icon: Users,
    path: "/clientes",
    rolesPermitidos: [...CAPACIDADES.CLIENTES],
  },
  {
    label: "Reportes",
    labelCorto: "Reportes",
    icon: BarChart3,
    path: "/reportes/ventas",
    rolesPermitidos: [...CAPACIDADES.REPORTES],
  },
  {
    label: "Administración",
    labelCorto: "Admin",
    icon: Settings,
    path: "/admin/usuarios",
    rolesPermitidos: [...CAPACIDADES.ADMINISTRACION],
  },
  {
    label: "Gastos e Inversiones",
    labelCorto: "Gastos",
    icon: Receipt,
    path: "/gastos",
    rolesPermitidos: [...CAPACIDADES.GASTOS],
  },
];
