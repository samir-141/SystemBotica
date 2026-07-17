import React from "react";

export interface Categoria {
    id: string;
    nombre: string;
}

export interface Laboratorio {
    id: string;
    nombre: string;
}

export interface PrincipioActivo {
    id: string;
    nombre: string;
}

export interface ProductoItem {
    id: string;
    sku: string;
    codigo_barras: string;
    nombre: string;
    descripcion: string;
    categoria_id: string;
    laboratorio_id: string;
    precio_compra: number;
    precio_venta: number;
    unidad: string;
    activo: boolean;
}

export interface Lote {
    id: string;
    producto_id: string;
    numero_lote: string;
    fecha_vencimiento: string;
    stock: number;
    stock_minimo: number;
}

export interface UsuarioItem {
    id: string;
    username: string;
    nombres: string;
    apellidos: string;
    estado: boolean;
    roles: string[];
}

export interface Cliente {
    id: string;
    documento: string;
    nombre: string;
    telefono: string;
    direccion: string;
    tipo?: string; // Regular, Frecuente, etc.
}

export interface Venta {
    id: string;
    numero: string;
    usuario_id: string;
    cliente_id: string;
    fecha: string;
    subtotal: number;
    igv: number;
    descuento: number;
    total: number;
    estado: "PAGADO" | "ANULADO" | "PENDIENTE";
}

export interface DetalleVenta {
    id: string;
    venta_id: string;
    producto_id: string;
    lote_id: string;
    cantidad: number;
    precio_unitario: number;     // ← Mejor nombre
    descuento: number;
    subtotal: number;
}

export interface Pago {
    id: string;
    venta_id: string;
    metodo: string;
    monto: number;
}

export interface MovimientoInventario {
    id: string;
    lote_id: string;
    usuario_id: string;
    tipo: "COMPRA" | "VENTA" | "AJUSTE" | "DEVOLUCION";
    cantidad: number;
    motivo: string;
    fecha: string;
}

// === Interfaces para Gráficos y Reportes ===

export interface VentaGrafico {
    id: string;
    fecha: string;
    total: number;
    cantidad_ventas: number;
    promedio_ventas: number;
}

export interface TopProducto {
    id: string;
    nombre: string;
    cantidad: number;
    total: number;
    porcentaje?: number;
}

export interface VentaPorCategoria {
    categoria: string;
    total: number;
    cantidad: number;
}

export interface VentaPorCajero {
    cajero: string;
    total: number;
}

export interface MetodoPagoStats {
    metodo: string;
    monto: number;
    porcentaje?: number;
}

// === Interfaces existentes que conservamos o mejoramos ===

export interface SubMenuItem {
    label: string;
    url: string;
    shortcut?: string;
}

export interface MenuItemType {
    label: string;
    icon: React.ReactNode;
    url?: string;
    submenu?: SubMenuItem[];
}

export interface Moneda {
    nombre: string;
    simbolo: string;
    tipoCambio: number;
}

export interface ItemProps {
    item: ProductoItem;
    monedas: Moneda[];
    monedaActivaIdx: number;
}

export interface ItemCarrito extends ProductoItem {
    cantidad: number;
    lote_id?: string;        // Importante para ventas
    precio_unitario?: number;
}