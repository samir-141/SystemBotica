// src/services/diagnosticos.service.ts
import { api } from "./api";

export const diagnosticosService = {
  getDiagnosticoRutas: async (): Promise<{
    total: number;
    rutas: Array<{
      controller: string;
      metodo: string;
      ruta: string;
      funcion: string;
    }>;
  }> => {
    const { data } = await api.get("/diagnosticos/rutas");
    return data;
  },

  getDiagnosticoModulos: async (): Promise<{
    totalModulos: number;
    totalProviders: number;
    totalControllers: number;
  }> => {
    const { data } = await api.get("/diagnosticos/modulos");
    return data;
  },
};
