// PosFrontend/src/services/biblioteca.service.ts
import { api } from './api';

export interface ProductoBibliotecaMaestro {
  id: string;
  codigo_barras: string;
  sku?: string;
  nombre_comercial: string;
  tipo_producto: string;
  principio_activo?: string;
  concentracion?: string;
  unidad_concentracion?: string;
  forma_farmaceutica?: string;
  via_administracion?: string;
  requiere_receta: boolean;
  afecto_igv: boolean;
  laboratorio?: string;
  categoria?: string;
  registro_sanitario?: string;
  unidad_presentacion?: string;
  unidad_base?: string;
  cantidad_unidad_base: number;
  controla_lote: boolean;
  requiere_vencimiento: boolean;
  es_verificado: boolean;
  foto_url?: string;
  origen?: 'BIBLIOTECA_GLOBAL' | 'API_EXTERNA' | 'LOCAL';
  descripcion?: string;
}

export interface ResolverDependenciasResponse {
  maestro: ProductoBibliotecaMaestro;
  dependencias_locales: {
    laboratorio_id: string | null;
    categoria_id: string | null;
    principio_activo_id: string | null;
    forma_farmaceutica_id: string | null;
    presentacion_id: string | null;
    unidad_base_id: string | null;
    cantidad_unidad_base: number;
  };
}

export interface ProductoLocalExistenteResponse {
  encontrado: boolean;
  tipo: 'PRESENTACION' | 'PRODUCTO_COMERCIAL';
  producto_comercial_id: string;
  nombre_comercial: string;
  sku: string;
  codigo_interno?: string;
  tipo_producto: string;
  principio_activo_id?: string | null;
  forma_farmaceutica_id?: string | null;
  laboratorio_id?: string | null;
  categoria_id?: string | null;
  concentracion?: number;
  unidad_concentracion?: string | null;
  via_administracion?: string | null;
  requiere_receta?: boolean;
  afecto_igv?: boolean;
}

export const bibliotecaService = {
  /**
   * Busca si el código ya existe en el inventario local de la botica
   */
  buscarLocalPorIdentificador: async (
    valor: string,
  ): Promise<ProductoLocalExistenteResponse | null> => {
    try {
      const clean = valor.trim();
      if (!clean) return null;
      const { data } = await api.get<ProductoLocalExistenteResponse>(
        '/productos/buscar/identificador',
        { params: { valor: clean } },
      );
      return data?.encontrado ? data : null;
    } catch {
      return null;
    }
  },

  /**
   * Busca en la biblioteca global y, si no existe, consulta automáticamente la API externa
   */
  buscarPorCodigoBarras: async (
    codigoBarras: string,
  ): Promise<ProductoBibliotecaMaestro | null> => {
    try {
      const cleanCode = codigoBarras.trim();
      if (!cleanCode) return null;
      const { data } = await api.get<ProductoBibliotecaMaestro>(
        `/biblioteca-productos/buscar/${encodeURIComponent(cleanCode)}`,
      );
      return data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Resuelve y crea automáticamente las dependencias locales en la botica
   * (Laboratorio, Categoría, Principio Activo, Forma Farmacéutica, Presentación y Unidad Base)
   */
  resolverDependencias: async (
    codigoBarras: string,
  ): Promise<ResolverDependenciasResponse> => {
    const { data } = await api.post<ResolverDependenciasResponse>(
      '/biblioteca-productos/resolver-dependencias',
      { codigo_barras: codigoBarras.trim() },
    );
    return data;
  },

  listarCatalogoGlobal: async (params?: {
    buscar?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get('/biblioteca-productos', { params });
    return data;
  },

  contribuirProducto: async (
    payload: Partial<ProductoBibliotecaMaestro>,
  ): Promise<ProductoBibliotecaMaestro> => {
    const { data } = await api.post<ProductoBibliotecaMaestro>(
      '/biblioteca-productos',
      payload,
    );
    return data;
  },
};
