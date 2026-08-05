// src/services/compras.service.ts
import { api } from "./api";
import type { CompraResumenDto, CompraRegistradaDto } from "../types/api.types";
import type { CreateCompraDto } from "../types/dto";

export const comprasService = {
  getCompras: async (params?: {
    page?: number;
    limit?: number;
    buscar?: string;
    sucursal_id?: string;
    proveedor_id?: string;
    desde?: string;
    hasta?: string;
  }): Promise<{
    data: CompraResumenDto[];
    meta: { page: number; limit: number; total: number; total_pages: number };
  }> => {
    const { data } = await api.get("/compras", { params });
    return data;
  },

  getCompraById: async (id: string): Promise<CompraRegistradaDto> => {
    const { data } = await api.get<CompraRegistradaDto>(`/compras/${id}`);
    return data;
  },

  crearCompra: async (
    payload: CreateCompraDto,
  ): Promise<CompraRegistradaDto> => {
    const { data } = await api.post<CompraRegistradaDto>("/compras", payload);
    return data;
  },
};
