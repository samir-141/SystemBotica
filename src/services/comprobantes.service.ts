// src/services/comprobantes.service.ts
import { api } from "./api";
import type { PublicReceiptResponse } from "../types/api.types";

export const comprobantesService = {
  obtenerEnlaceComprobante: async (
    ventaId: string,
  ): Promise<{ token: string; url: string; disponible: boolean }> => {
    const { data } = await api.get(`/comprobantes-publicos/venta/${ventaId}`);
    return data;
  },

  obtenerComprobantePublico: async (
    token: string,
    signal?: AbortSignal,
  ): Promise<PublicReceiptResponse> => {
    // Para endpoints públicos, usamos la base url sin necesidad de cambiar el interceptor general
    const { data } = await api.get<PublicReceiptResponse>(
      `/comprobantes-publicos/${encodeURIComponent(token)}`,
      { signal },
    );
    return data;
  },

  solicitarImpresionPDF: async (
    ventaId: string,
    formato: "A4" | "TICKET80" | "TICKET58"
  ): Promise<{ success: boolean; url: string }> => {
    const { data } = await api.post<{ success: boolean; url: string }>(
      `/comprobantes/venta/${ventaId}/imprimir`,
      { formato }
    );
    return data;
  },
};
