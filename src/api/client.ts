// src/api/client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backpos-lymg.onrender.com';

const api = axios.create({
    baseURL: API_URL,
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

export default api;