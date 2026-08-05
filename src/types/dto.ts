// src/types/dto.ts

export interface CreateClienteDto {
  tipo_documento: string;
  numero_documento: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tipo_cliente?: string;
  condicion_contribuyente?: string;
  limite_credito?: number;
  dias_credito?: number;
  estado_credito?: string;
  whatsapp?: string;
  contacto_principal?: string;
  cargo_contacto?: string;
  representante_legal?: string;
  dni_representante?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
  estado_sunat?: string;
  estado?: string;
  origen?: string;
  saldo_actual?: number;
}

export interface UpdateClienteDto extends Partial<CreateClienteDto> {
  id: string;
}

export interface CreateProductoDto {
  producto_comercial_id?: string;
  nombre_comercial: string;
  sku: string;
  codigo_interno?: string;
  tipo_producto?: string;
  controla_lote?: boolean;
  requiere_vencimiento?: boolean;
  atributos?: Record<string, string>;
  principio_activo_id?: string;
  forma_farmaceutica_id?: string;
  laboratorio_id?: string;
  categoria_id: string;
  concentracion?: number;
  unidad_concentracion?: string;
  via_administracion?: string;
  requiere_receta?: boolean;
  afecto_igv?: boolean;
  presentacion_id: string;
  cantidad_unidad_base: number;
  precio_actual: number;
  codigo_barras?: string;
  registro_sanitario?: string;
  /** La unidad base siempre equivale a 1; las demás son empaques de ella. */
  unidad_base_id?: string;
  presentaciones?: Array<{
    unidad_presentacion_id: string;
    cantidad_unidad_base: number;
    precio_actual: number;
    codigo_barras?: string;
  }>;
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> {
  producto_comercial_id: string;
}

export interface CreateVentaDto {
  idempotency_key: string;
  tipo_comprobante: string;
  tipo_pago: string;
  metodo_pago: string;
  monto_recibido?: number;
  vuelto?: number;
  datos_cliente?: {
    tipo_documento: string;
    numero_documento: string;
    nombre_razon_social: string;
    direccion?: string;
  };
  /** Expectativas informativas; el backend siempre recalcula estos importes. */
  subtotal?: number;
  igv?: number;
  total?: number;
  items: Array<{
    producto_presentacion_id: string;
    producto_comercial_id: string;
    presentacion_nombre: string;
    cantidad: number;
    /** Expectativa informativa; el backend usa el precio vigente en BD. */
    precio_unitario?: number;
  }>;
}

export type EstadoComprobanteVenta =
  "GENERADO" | "PENDIENTE" | "ERROR" | "NO_APLICA";

export interface VentaRegistradaResponse {
  exito: boolean;
  mensaje: string;
  idempotente?: boolean;
  idempotency_key?: string;
  estado?: string;
  venta_id: string;
  subtotal: number;
  igv: number;
  total: number;
  tipo_comprobante: string;
  metodo_pago: string;
  comprobante_token?: string | null;
  comprobante_url?: string | null;
  comprobante_estado?: EstadoComprobanteVenta;
  comprobante_error?: string | null;
  comprobante?: {
    estado?: EstadoComprobanteVenta;
    serie_numero?: string | null;
    mensaje?: string | null;
  } | null;
}

export interface CreatePagoDto {
  venta_id: string;
  metodo_pago: string;
  monto: number;
}

export interface CreateProveedorDto {
  ruc: string;
  razon_social: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface CreateCompraDetalleDto {
  producto_presentacion_id: string;
  cantidad: number;
  /** Costo de compra por presentación, antes de IGV. */
  costo_unitario: number;
  numero_lote?: string;
  fecha_fabricacion?: string;
  fecha_vencimiento?: string;
}

export interface CreateCompraDto {
  proveedor_id: string;
  sucursal_id?: string;
  serie: string;
  numero: string;
  fecha?: string;
  detalles: CreateCompraDetalleDto[];
  /** Valores informativos: el backend siempre recalcula los importes canónicos. */
  subtotal?: number;
  igv?: number;
  total?: number;
}
