// Shared TypeScript types for the venta module

export interface ItemCarrito {
  id_carrito: string;
  producto_comercial_id: string;
  nombre_comercial: string;
  presentacion_nombre: string;
  precio_unitario: number;
  cantidad: number;
  unidades_base_por_pack: number;
  unidades_base_totales: number;
  lote_fefo_numero: string;
  lote_fefo_vencimiento: string;
}

export interface PresentacionOption {
  id: string;
  nombre: string;
  cantidad_unidad_base: number;
  precio: number;
}

export type ModoPrecio = "CON_IGV" | "SIN_IGV";
export type TipoPago = "CONTADO" | "ABONO" | "ANTICIPO";

// ── Checkout / Comprobante types ──────────────────────────
export type TipoComprobante = "BOLETA" | "FACTURA" | "NOTA_VENTA";
export type MetodoPago = "EFECTIVO" | "TARJETA" | "YAPE_PLIN" | "TRANSFERENCIA";

export interface DatosCliente {
  tipo_documento: "DNI" | "RUC" | "NINGUNO";
  numero_documento: string;
  nombre_razon_social: string;
  direccion: string;
}

// Re‑export product data types from the API layer for convenience
export type { ProductoPOS, PaginatedResponse } from "../api/api.data";
