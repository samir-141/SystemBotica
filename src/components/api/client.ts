// src/api/client.ts

import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL + "/api",
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const sucursalId = localStorage.getItem('sucursalId');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (sucursalId) {
        config.headers['x-sucursal-id'] = sucursalId;
    }

    return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('sucursalActual');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);



// Interceptor de Peticiones: Injecta el Token JWT
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Interceptor de Respuestas: Expiración de Token (401) y Manejo de Errores
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        // Normalizamos el mensaje enviado por NestJS DTO (a veces viene como array o string)
        const apiErrorMessage =
            (error.response?.data as { message?: string | string[] })?.message ||
            'Error de conexión con el servidor POS';

        return Promise.reject({
            status,
            message: Array.isArray(apiErrorMessage) ? apiErrorMessage.join(', ') : apiErrorMessage,
            raw: error,
        });
    }
);

export { api };