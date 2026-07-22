// src/api/auth.api.ts
import { api } from './client';

export interface LoginRequest {
    correo: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    usuario: {
        id: string;
        nombre: string;
        correo: string;
        rol: string;
    };
    sucursal_actual: {
        id: string;
        nombre: string;
        empresa: string;
        es_principal: boolean;
    };
    sucursales_disponibles: Array<{
        id: string;
        nombre: string;
        empresa: string;
        es_principal: boolean;
    }>;
}

export const authApi = {
    login: (data: LoginRequest) =>
        api.post<LoginResponse>('auth/login', data),
};