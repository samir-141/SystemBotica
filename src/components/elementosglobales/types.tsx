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
    id: string,
    sku: string,
    codigo_barras: string,
    nombre: string,
    descripcion: string,
    categoria_id: string,
    laboratorio_id: string,
    precio_compra: number,
    cantidad: number,
    precio_venta: number,
    fecha_vencimiento: string,
    nombre_lote: string,
    stock_minimo: number,
    stock_total: number,
    unidad: string,
    activo: boolean
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



export interface ItemCarrito extends ProductoItem {
    cantidad: number;
}

export interface Moneda {
    nombre: string;
    simbolo: string;
    tipoCambio: number; // Factor de conversión (ej: de Soles a Dólares)
}