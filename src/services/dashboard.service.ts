// src/services/dashboard.service.ts
import { api } from "./api";

export const dashboardService = {
  getDashboardResumen: async (
    sucursalId?: string,
    rango?: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<any> => {
    const { data } = await api.get("/dashboard/resumen", {
      params: {
        sucursal_id: sucursalId,
        rango,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
    });
    return data;
  },
};
