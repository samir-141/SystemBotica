// src/services/cajas.service.ts
import { api } from "./api";

export const cajasService = {
  getEstadoCaja: async (): Promise<any> => {
    const { data } = await api.get("/cajas/estado");
    return data;
  },

  aperturarCaja: async (payload: {
    monto_inicial: number;
    observacion?: string;
  }): Promise<any> => {
    const { data } = await api.post("/cajas/aperturar", payload);
    return data;
  },

  registrarMovimientoCaja: async (payload: {
    tipo: "INGRESO" | "EGRESO";
    monto: number;
    observacion: string;
  }): Promise<any> => {
    const { data } = await api.post("/cajas/movimiento", payload);
    return data;
  },

  cerrarCaja: async (payload: {
    efectivo_contado: number;
    observacion?: string;
  }): Promise<any> => {
    const { data } = await api.post("/cajas/cerrar", payload);
    return data;
  },
};
