import React from "react";

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
export interface ProductoItem {
    sku: string;
    nombre: string;
    precio_venta: number;
    // Puedes extenderlo después (ej: stock, presentacion)
}

export interface Moneda {
    simbolo: string;
    nombre: string;
}

export interface ItemProps {
    item: ProductoItem;
    monedas: Moneda[]; // Cambiado a plural para mayor claridad semántica
    monedaActivaIdx: number; // Especificamos que es el índice del array
}

export interface Producto {
    id: string;
    sku: string,
    codigo_barras: string,
    nombre: string,
    descripcion: string,
    categoria_id: string,
    laboratorio_id: string,
    precio_compra: number,
    cantidad: number,
    precio_venta: number,
    stock_minimo: number,
    stock_total: number,
    unidad: string,
    activo: boolean
}

export interface ItemCarrito extends Producto {
    cantidad: number;
}

export interface Moneda {
    nombre: string;
    simbolo: string;
    tipoCambio: number; // Factor de conversión (ej: de Soles a Dólares)
}