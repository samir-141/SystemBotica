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
}

export interface UpdateClienteDto extends Partial<CreateClienteDto> {
  id: string;
}

export interface CreateProductoDto {
    producto_comercial_id?: string;
  nombre_comercial: string;
  sku: string;
  codigo_interno?: string;
  principio_activo_id: string;
  forma_farmaceutica_id: string;
  laboratorio_id: string;
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
  subtotal: number;
  igv: number;
  total: number;
  items: Array<{
    producto_comercial_id: string;
    presentacion_nombre: string;
    cantidad: number;
    precio_unitario: number;
  }>;
}

export interface CreatePagoDto {
  venta_id: string;
  metodo_pago: string;
  monto: number;
}
