// src/services/reportes.service.ts
import { api } from "./api";

export const reportesService = {
  getReporteVentas: async (params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    sucursal_id?: string;
  }): Promise<any> => {
    const { data } = await api.get("/reportes/ventas", { params });
    return data;
  },

  getReporteInventario: async (params?: {
    sucursal_id?: string;
  }): Promise<any> => {
    const { data } = await api.get("/reportes/inventario", { params });
    return data;
  },

  getReporteFinanciero: async (params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    sucursal_id?: string;
  }): Promise<any> => {
    const { data } = await api.get("/reportes/financiero", { params });
    return data;
  },

  getLibroVentasPLE: async (params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<any> => {
    const { data } = await api.get("/reportes/ple-libro-ventas", { params });
    return data;
  },
};
