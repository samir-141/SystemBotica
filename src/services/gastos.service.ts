// src/services/gastos.service.ts
import { api } from "./api";

export const gastosService = {
  getGastos: async (params?: {
    sucursal_id?: string;
    desde?: string;
    hasta?: string;
  }): Promise<any[]> => {
    const { data } = await api.get("/gastos", { params });
    return data;
  },

  crearGasto: async (payload: {
    tipo: "OPERATIVO" | "INVERSION";
    categoria: string;
    monto: number;
    sucursal_id?: string;
    descripcion?: string;
    comprobante?: string;
    fecha?: string;
  }): Promise<any> => {
    const { data } = await api.post("/gastos", payload);
    return data;
  },

  eliminarGasto: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await api.delete(`/gastos/${id}`);
    return data;
  },
};
