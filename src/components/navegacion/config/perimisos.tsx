import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Receipt,
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
  CAJAS: ["Administrador", "Gerente", "Farmacéutico", "Cajero", "Vendedor"],
  FACTURACION: ["Administrador", "Gerente", "Farmacéutico", "Cajero", "Vendedor"],
  POSVENTA: ["Administrador", "Gerente", "Farmacéutico", "Cajero"],
  SERIES: ["Administrador", "Gerente", "Farmacéutico", "Cajero", "Vendedor", "Almacenero"],
  PROVEEDORES: ["Administrador", "Gerente", "Almacenero"],
  CATALOGOS: ["Administrador", "Gerente", "Farmacéutico", "Cajero", "Vendedor", "Almacenero", "Contador"],
} as const;

// Compatibilidad temporal para consumidores existentes. No agregar roles fuera de CAPACIDADES.
export const ROLES = {
  OPERACION: CAPACIDADES.VENTAS_POS,
  SUPERVISION: CAPACIDADES.DASHBOARD,
  ADMINISTRACION: CAPACIDADES.ADMINISTRACION,
} as const;

/**
 * Permisos granulares del backend (recurso.accion).
 * Mantener sincronizado con src/auth/permissions.constants.ts
 */
export const PERMISOS_BACKEND = {
  VENTAS: {
    VER: "ventas.ver",
    CREAR: "ventas.crear",
    ANULAR: "ventas.anular",
  },
  INVENTARIO: {
    VER: "inventario.ver",
    CREAR: "inventario.crear",
    EDITAR: "inventario.editar",
    ELIMINAR: "inventario.eliminar",
    REABASTECER: "inventario.reabastecer",
    PRESENTACIONES: "inventario.presentaciones",
  },
  COMPRAS: {
    VER: "compras.ver",
    CREAR: "compras.crear",
  },
  CAJAS: {
    VER: "cajas.ver",
    ABRIR: "cajas.abrir",
    CERRAR: "cajas.cerrar",
    MOVIMIENTOS: "cajas.movimientos",
  },
  CLIENTES: {
    VER: "clientes.ver",
    CREAR: "clientes.crear",
    EDITAR: "clientes.editar",
    ELIMINAR: "clientes.eliminar",
  },
  USUARIOS: {
    VER: "usuarios.ver",
    CREAR: "usuarios.crear",
    EDITAR: "usuarios.editar",
    ELIMINAR: "usuarios.eliminar",
  },
  ROLES: {
    GESTIONAR: "roles.gestionar",
  },
  SUCURSALES: {
    VER: "sucursales.ver",
    CREAR: "sucursales.crear",
  },
  REPORTES: {
    VENTAS: "reportes.ventas",
    INVENTARIO: "reportes.inventario",
    FINANCIERO: "reportes.financiero",
    PLE: "reportes.ple",
  },
  FACTURACION: {
    EMITIR: "facturacion.emitir",
    ENVIAR: "facturacion.enviar",
    VER: "facturacion.ver",
    CONFIG: "facturacion.config",
    RESUMENES: "facturacion.resumenes",
  },
  POSVENTA: {
    DEVOLUCIONES: "posventa.devoluciones",
    CAMBIOS: "posventa.cambios",
    GARANTIAS: "posventa.garantias",
    RECLAMOS: "posventa.reclamos",
  },
  SERIES: {
    VER: "series.ver",
    GESTIONAR: "series.gestionar",
  },
  PROVEEDORES: {
    VER: "proveedores.ver",
    CREAR: "proveedores.crear",
    EDITAR: "proveedores.editar",
    ELIMINAR: "proveedores.eliminar",
  },
  CATALOGOS: {
    VER: "catalogos.ver",
    GESTIONAR: "catalogos.gestionar",
  },
  GASTOS: {
    VER: "gastos.ver",
    CREAR: "gastos.crear",
    ELIMINAR: "gastos.eliminar",
  },
  DASHBOARD: {
    VER: "dashboard.ver",
  },
  COMPROBANTES: {
    IMPRIMIR: "comprobantes.imprimir",
  },
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
    rolesPermitidos: [...new Set([...CAPACIDADES.INVENTARIO_GESTION, ...CAPACIDADES.COMPRAS])],
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
