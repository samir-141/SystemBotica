// src/services/productos.service.ts
import { api } from "./api";
import type { ProductoPOS, QueryParamsProductos, PaginatedResponse } from "../types/api.types";
import type { CreateProductoDto, UpdateProductoDto } from "../types/dto";

export const productosService = {
  getProductos: async (
    params?: QueryParamsProductos,
  ): Promise<PaginatedResponse<ProductoPOS>> => {
    if (params?.sucursalId) {
      const { sucursalId, ...rest } = params;
      const { data } = await api.get<PaginatedResponse<ProductoPOS>>(
        `/productos/sucursal/${sucursalId}`,
        { params: rest },
      );
      return data;
    }
    const { data } = await api.get<PaginatedResponse<ProductoPOS>>(
      "/productos",
      { params },
    );
    return data;
  },

  getProductoDetalle: async (id: string): Promise<any> => {
    const { data } = await api.get(`/productos/${id}`);
    return data;
  },

  crearProducto: async (payload: CreateProductoDto): Promise<ProductoPOS> => {
    const { data } = await api.post<ProductoPOS>("/productos", payload);
    return data;
  },

  actualizarProducto: async (
    id: string,
    payload: UpdateProductoDto,
  ): Promise<ProductoPOS> => {
    const { data } = await api.patch<ProductoPOS>(`/productos/${id}`, payload);
    return data;
  },

  eliminarProducto: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await api.delete<{ mensaje: string }>(`/productos/${id}`);
    return data;
  },

  buscarPorIdentificador: async (valor: string): Promise<any> => {
    const { data } = await api.get("/productos/buscar/identificador", {
      params: { valor },
    });
    return data;
  },

  actualizarPresentaciones: async (
    productoId: string,
    presentaciones: Array<{
      unidad_presentacion_id?: string;
      nombre?: string;
      cantidad_unidad_base: number;
      precio_actual: number;
      codigo_barras?: string;
    }>,
  ): Promise<any> => {
    const { data } = await api.post(`/productos/${productoId}/presentaciones`, {
      presentaciones,
    });
    return data;
  },

  getProductosPorSucursal: async (
    sucursalId: string,
    params?: QueryParamsProductos,
  ): Promise<PaginatedResponse<ProductoPOS>> => {
    return productosService.getProductos({ ...params, sucursalId });
  },
};
