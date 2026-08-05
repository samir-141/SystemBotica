// src/services/inventario.service.ts
import { api } from "./api";
import type { TipoCatalogo, ItemCatalogo, PaginatedResponse } from "../types/api.types";

export const inventarioService = {
  reabastecerStock: async (payload: {
    producto_comercial_id: string;
    sucursal_id?: string;
    numero_lote: string;
    fecha_vencimiento?: string;
    stock_adicional: number;
    precio_compra_base: number;
  }): Promise<any> => {
    const { data } = await api.post("/productos/reabastecer", payload);
    return data;
  },

  getCatalogo: async (
    tipo: TipoCatalogo,
    params?: {
      page?: number;
      limit?: number;
      buscar?: string;
      orden?: "asc" | "desc";
    },
  ): Promise<PaginatedResponse<ItemCatalogo>> => {
    const { data } = await api.get<PaginatedResponse<ItemCatalogo>>(
      `/catalogos/${tipo}`,
      { params },
    );
    return data;
  },

  getItemCatalogoById: async (
    tipo: TipoCatalogo,
    id: string,
  ): Promise<ItemCatalogo> => {
    const { data } = await api.get<ItemCatalogo>(`/catalogos/${tipo}/${id}`);
    return data;
  },

  crearItemCatalogo: async (
    tipo: TipoCatalogo,
    payload: Partial<ItemCatalogo>,
  ): Promise<ItemCatalogo> => {
    const { data } = await api.post<ItemCatalogo>(
      `/catalogos/${tipo}`,
      payload,
    );
    return data;
  },

  actualizarItemCatalogo: async (
    tipo: TipoCatalogo,
    id: string,
    payload: Partial<ItemCatalogo>,
  ): Promise<ItemCatalogo> => {
    const { data } = await api.patch<ItemCatalogo>(
      `/catalogos/${tipo}/${id}`,
      payload,
    );
    return data;
  },

  eliminarItemCatalogo: async (
    tipo: TipoCatalogo,
    id: string,
  ): Promise<{ mensaje: string }> => {
    const { data } = await api.delete<{ mensaje: string }>(
      `/catalogos/${tipo}/${id}`,
    );
    return data;
  },
};
