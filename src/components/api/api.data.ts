import { api } from './client';

// ==========================================
// 1. INTERFACES / TIPOS DE DATOS (SWAGGER/BACKEND)
// ==========================================

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
    es_principal: boolean;
}

export interface LoginResponse {
    token: string;
    usuario: Usuario & {
        sucursal_actual: Sucursal;
        sucursales_disponibles: Sucursal[];
    };
}

// Vista simplificada del POS (vw_productos_pos)
export interface ProductoPOS {
    producto_comercial_id: string;
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
}

export interface QueryParamsProductos {
    page?: number;
    limit?: number;
    buscar?: string;
    laboratorio_id?: string;
    categoria_id?: string;
    principio_activo_id?: string;
    orden?: 'nombre_asc' | 'nombre_desc' | 'precio_asc' | 'precio_desc' | 'stock_asc' | 'stock_desc';
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

export type TipoCatalogo =
    | 'principios-activos'
    | 'formas-farmaceuticas'
    | 'laboratorios'
    | 'categorias'
    | 'unidades-presentacion';

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

// ==========================================
// 2. SERVICIOS Y PETICIONES HTTP
// ==========================================

export const posApi = {
    // --- PRODUCTOS (Uso directo en POS y Buscador) ---
    getProductos: async (params?: QueryParamsProductos): Promise<PaginatedResponse<ProductoPOS>> => {
        const { data } = await api.get<PaginatedResponse<ProductoPOS>>('/productos', { params });
        return data;
    },

    getProductoDetalle: async (id: string) => {
        const { data } = await api.get(`/productos/${id}`);
        return data;
    },

    // --- CATÁLOGOS MAESTROS (Dropdowns y Formularios) ---
    getCatalogo: async (
        tipo: TipoCatalogo,
        params?: { page?: number; limit?: number; buscar?: string; orden?: 'asc' | 'desc' }
    ): Promise<PaginatedResponse<ItemCatalogo>> => {
        const { data } = await api.get<PaginatedResponse<ItemCatalogo>>(`/catalogos/${tipo}`, { params });
        return data;
    },

    getItemCatalogoById: async (tipo: TipoCatalogo, id: string): Promise<ItemCatalogo> => {
        const { data } = await api.get<ItemCatalogo>(`/catalogos/${tipo}/${id}`);
        return data;
    },

    crearItemCatalogo: async (tipo: TipoCatalogo, payload: Partial<ItemCatalogo>): Promise<ItemCatalogo> => {
        const { data } = await api.post<ItemCatalogo>(`/catalogos/${tipo}`, payload);
        return data;
    },

    actualizarItemCatalogo: async (tipo: TipoCatalogo, id: string, payload: Partial<ItemCatalogo>): Promise<ItemCatalogo> => {
        const { data } = await api.patch<ItemCatalogo>(`/catalogos/${tipo}/${id}`, payload);
        return data;
    },

    eliminarItemCatalogo: async (tipo: TipoCatalogo, id: string): Promise<{ mensaje: string }> => {
        const { data } = await api.delete<{ mensaje: string }>(`/catalogos/${tipo}/${id}`);
        return data;
    },

    // --- PRODUCTOS CRUD (Gestión desde módulo productos) ---
    buscarProductoPorIdentificador: async (valor: string): Promise<any> => {
        const { data } = await api.get('/productos/buscar/identificador', { params: { valor } });
        return data;
    },

    crearProducto: async (payload: Record<string, unknown>): Promise<ProductoPOS> => {
        const { data } = await api.post<ProductoPOS>('/productos', payload);
        return data;
    },

    actualizarProducto: async (id: string, payload: Record<string, unknown>): Promise<ProductoPOS> => {
        const { data } = await api.patch<ProductoPOS>(`/productos/${id}`, payload);
        return data;
    },

    eliminarProducto: async (id: string): Promise<{ mensaje: string }> => {
        const { data } = await api.delete<{ mensaje: string }>(`/productos/${id}`);
        return data;
    },

    // --- VENTAS ---
    registrarVenta: async (payload: Record<string, unknown>): Promise<any> => {
        const { data } = await api.post('/ventas', payload);
        return data;
    },

    // --- BÚSQUEDA POR SUCURSAL ---
    getProductosPorSucursal: async (sucursalId: string, params?: QueryParamsProductos): Promise<PaginatedResponse<ProductoPOS>> => {
        const { data } = await api.get<PaginatedResponse<ProductoPOS>>(`/productos/sucursal/${sucursalId}`, { params });
        return data;
    },

    // --- DASHBOARD ---
    getDashboardResumen: async (sucursalId?: string): Promise<any> => {
        const { data } = await api.get('/dashboard/resumen', {
            params: { sucursal_id: sucursalId }
        });
        return data;
    },

    // --- CLIENTES ---
    getClientes: async (params?: { page?: number; limit?: number; buscar?: string; tipo_documento?: string }): Promise<any> => {
        const { data } = await api.get('/clientes', { params });
        return data;
    },

    getClienteById: async (id: string): Promise<any> => {
        const { data } = await api.get(`/clientes/${id}`);
        return data;
    },

    buscarClientePorDocumento: async (documento: string): Promise<any> => {
        const { data } = await api.get(`/clientes/buscar/${documento}`);
        return data;
    },

    consultarDocumentoPadron: async (tipo: string, numero: string): Promise<any> => {
        const { data } = await api.get('/clientes/consultar-padron', {
            params: { tipo, numero }
        });
        return data;
    },

    crearCliente: async (payload: Record<string, unknown>): Promise<any> => {
        const { data } = await api.post('/clientes', payload);
        return data;
    },


    actualizarCliente: async (id: string, payload: Record<string, unknown>): Promise<any> => {
        const { data } = await api.patch(`/clientes/${id}`, payload);
        return data;
    },

    eliminarCliente: async (id: string): Promise<{ mensaje: string }> => {
        const { data } = await api.delete<{ mensaje: string }>(`/clientes/${id}`);
        return data;
    },
};

