// src/services/auth.service.ts
import { api } from "./api";
import type { LoginRequest, LoginResponse } from "../types/api.types";

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("auth/login", data);
    return response.data;
  },

  getUsuarios: async (): Promise<any> => {
    const { data } = await api.get("/usuarios");
    return data;
  },

  getRoles: async (): Promise<any> => {
    const { data } = await api.get("/usuarios/roles");
    return data;
  },

  actualizarRolPermisos: async (
    rolId: string,
    permisosIds: string[],
  ): Promise<any> => {
    const { data } = await api.put(`/usuarios/roles/${rolId}/permisos`, {
      permisosIds,
    });
    return data;
  },

  getSucursalesAdmin: async (): Promise<any> => {
    const { data } = await api.get("/usuarios/sucursales");
    return data;
  },

  crearUsuario: async (payload: Record<string, unknown>): Promise<any> => {
    const { data } = await api.post("/usuarios", payload);
    return data;
  },

  actualizarUsuario: async (
    id: string,
    payload: Record<string, unknown>,
  ): Promise<any> => {
    const { data } = await api.patch(`/usuarios/${id}`, payload);
    return data;
  },

  eliminarUsuario: async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await api.delete<{ mensaje: string }>(`/usuarios/${id}`);
    return data;
  },

  crearSucursal: async (payload: {
    nombre: string;
    direccion: string;
    telefono?: string;
  }): Promise<any> => {
    const { data } = await api.post("/usuarios/sucursales", payload);
    return data;
  },

  crearRol: async (nombre: string): Promise<any> => {
    const { data } = await api.post("/usuarios/roles", { nombre });
    return data;
  },

  actualizarRol: async (id: string, nombre: string): Promise<any> => {
    const { data } = await api.patch(`/usuarios/roles/${id}`, { nombre });
    return data;
  },

  eliminarRol: async (id: string): Promise<any> => {
    const { data } = await api.delete(`/usuarios/roles/${id}`);
    return data;
  },
};
