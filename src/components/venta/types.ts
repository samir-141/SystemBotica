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

export interface ProductoAgrupado {
  producto_comercial_id: string;
  sku: string;
  nombre_comercial: string;
  principio_activo?: string;
  laboratorio?: string;
  requiere_receta?: boolean;
  stock_total: number;
  unidad_base_nombre?: string;
  presentaciones: PresentacionOption[];
}

export interface DetalleVentaInput {
  producto_presentacion_id?: string;
  producto_comercial_id: string;
  presentacion_nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface CreateVentaPayload {
  tipo_comprobante: TipoComprobante;
  tipo_pago: TipoPago;
  metodo_pago: MetodoPago;
  monto_recibido?: number;
  vuelto?: number;
  datos_cliente?: DatosCliente;
  subtotal: number;
  igv: number;
  total: number;
  items: DetalleVentaInput[];
}

// Re‑export product data types from the API layer for convenience
export type { ProductoPOS, PaginatedResponse } from "../api/api.data";

