// src/services/proveedores.service.ts
import { api } from "./api";
import type { ProveedorDto } from "../types/api.types";
import type { CreateProveedorDto } from "../types/dto";

export const proveedoresService = {
  getProveedores: async (params?: {
    page?: number;
    limit?: number;
    buscar?: string;
  }): Promise<{
    data: ProveedorDto[];
    meta: { page: number; limit: number; total: number; total_pages: number };
  }> => {
    const { data } = await api.get("/proveedores", { params });
    return data;
  },

  crearProveedor: async (
    payload: CreateProveedorDto,
  ): Promise<ProveedorDto> => {
    const { data } = await api.post<ProveedorDto>("/proveedores", payload);
    return data;
  },
};
