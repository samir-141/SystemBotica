// src/services/clientes.service.ts
import { api } from "./api";
import type { CreateClienteDto, UpdateClienteDto } from "../types/dto";

export const clientesService = {
  getClientes: async (params?: {
    page?: number;
    limit?: number;
    buscar?: string;
    tipo_documento?: string;
  }): Promise<any> => {
    const { data } = await api.get("/clientes", { params });
    return data;
  },

  getClienteById: async (id: string): Promise<any> => {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
  },

  buscarClientePorDocumento: async (documento: string): Promise<any> => {
    const { data } = await api.get(`/clientes/buscar/${documento}`);
    return data;
  },

  consultarDocumentoPadron: async (
    tipo: string,
    numero: string,
  ): Promise<any> => {
    const { data } = await api.get("/clientes/consultar-padron", {
      params: { tipo, numero },
    });
    return data;
  },

  crearCliente: async (payload: CreateClienteDto): Promise<any> => {
    const { data } = await api.post("/clientes", payload);
    return data;
  },

  actualizarCliente: async (
    id: string,
    payload: UpdateClienteDto,
  ): Promise<any> => {
    const { data } = await api.patch(`/clientes/${id}`, payload);
    return data;
  },

  eliminarCliente: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await api.delete<{ mensaje: string }>(`/clientes/${id}`);
    return data;
  },
};
