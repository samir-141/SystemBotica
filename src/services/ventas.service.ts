// src/services/ventas.service.ts
import { api } from "./api";
import type { CreateVentaDto, VentaRegistradaResponse } from "../types/dto";

export const ventasService = {
  registrarVenta: async (
    payload: CreateVentaDto,
  ): Promise<VentaRegistradaResponse> => {
    const { data } = await api.post<VentaRegistradaResponse>(
      "/ventas",
      payload,
    );
    return data;
  },

  anularVenta: async (id: string): Promise<any> => {
    const { data } = await api.post(`/ventas/${id}/anular`);
    return data;
  },

  getSeriesDocumentos: async (): Promise<any> => {
    const { data } = await api.get("/series-documentos");
    return data;
  },

  crearSerieDocumento: async (payload: any): Promise<any> => {
    const { data } = await api.post("/series-documentos", payload);
    return data;
  },

  actualizarSerieDocumento: async (id: string, payload: any): Promise<any> => {
    const { data } = await api.patch(`/series-documentos/${id}`, payload);
    return data;
  },

  eliminarSerieDocumento: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await api.delete<{ mensaje: string }>(
      `/series-documentos/${id}`,
    );
    return data;
  },
};
