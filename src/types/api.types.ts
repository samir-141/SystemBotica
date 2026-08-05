import type { CreateProveedorDto } from "./dto";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
}

export interface Sucursal {
  id: string;
  nombre: string;
  empresa: string;
  botica_id?: string;
  es_principal: boolean;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  sucursal_actual: Sucursal;
  sucursales_disponibles: Sucursal[];
}

// Vista simplificada del POS (vw_productos_pos)
export interface ProductoPOS {
  producto_comercial_id: string;
  tipo_producto?: string;
  controla_lote?: boolean;
  requiere_vencimiento?: boolean;
  atributos?: Record<string, string> | null;
  nombre_comercial: string;
  sku: string;
  codigo_interno: string | null;
  principio_activo: string;
  forma_farmaceutica: string;
  concentracion: number;
  unidad_concentracion: string;
  via_administracion: string;
  requiere_receta: boolean;
  afecto_igv: boolean;
  laboratorio: string;
  categoria: string;
  presentacion_id: string;
  presentacion_nombre: string;
  unidad_abreviatura: string;
  cantidad_unidad_base: number;
  precio_actual: number;
  codigo_barras: string;
  stock_total: number;
  lote_fefo_numero: string;
  lote_fefo_vencimiento: string;
  registro_sanitario?: string | null;
}

export interface QueryParamsProductos {
  page?: number;
  limit?: number;
  buscar?: string;
  laboratorio_id?: string;
  categoria_id?: string;
  principio_activo_id?: string;
  orden?:
    | "nombre_asc"
    | "nombre_desc"
    | "precio_asc"
    | "precio_desc"
    | "stock_asc"
    | "stock_desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProveedorDto extends CreateProveedorDto {
  id: string;
}

export interface CompraRegistradaDto {
  id: string;
  fecha: string;
  serie: string;
  numero: string;
  subtotal: number;
  igv: number;
  total: number;
  idempotente?: boolean;
  proveedores: { id: string; ruc: string; razon_social: string };
  sucursales: { id: string; nombre: string };
  detalles_compras?: Array<{
    id: string;
    cantidad: number;
    precio_unitario: number;
    productos_presentaciones: {
      cantidad_unidad_base: number;
      productos_comerciales: { nombre_comercial: string; sku: string };
      unidades_presentacion: { nombre: string; abreviatura: string };
    };
    lotes?: Array<{ numero_lote: string; fecha_vencimiento?: string | null }>;
  }>;
}

export interface CompraResumenDto extends Omit<
  CompraRegistradaDto,
  "detalles_compras"
> {
  _count?: { detalles_compras: number };
}

export type TipoCatalogo =
  | "principios-activos"
  | "formas-farmaceuticas"
  | "laboratorios"
  | "categorias"
  | "unidades-presentacion";

export interface ItemCatalogo {
  id: string;
  nombre: string;
  descripcion?: string;
  pais?: string;
  telefono?: string;
  email?: string;
  abreviatura?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublicReceiptItem {
  id?: string;
  descripcion: string;
  presentacion?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PublicReceiptResponse {
  plantilla_version: string;
  snapshot: {
    emisor?: { razon_social?: string; nombre?: string; ruc?: string; direccion?: string };
    cliente?: { nombre?: string; documento?: string };
    tipo_comprobante: string;
    emitido_at: string;
    items: PublicReceiptItem[];
    totales: { subtotal: number; igv: number; total: number };
  };
}
