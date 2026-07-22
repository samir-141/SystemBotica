// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/auth.api';
import type { LoginRequest } from '../api/auth.api';

interface User {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
}

interface Sucursal {
    id: string;
    nombre: string;
    empresa: string;
    es_principal: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    sucursalActual: Sucursal | null;
    sucursales: Sucursal[];
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    cambiarSucursal: (sucursalId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sucursalActual, setSucursalActual] = useState<Sucursal | null>(null);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);

    // Cargar sesión al iniciar
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedSucursal = localStorage.getItem('sucursalActual');
        const storedSucursales = localStorage.getItem('sucursales');

        if (storedToken && storedUser && storedSucursal) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setSucursalActual(JSON.parse(storedSucursal));
            if (storedSucursales) {
                setSucursales(JSON.parse(storedSucursales));
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await authApi.login(credentials);
            const data = response.data;

            // Guardar en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            localStorage.setItem('sucursalActual', JSON.stringify(data.sucursal_actual));
            localStorage.setItem('sucursales', JSON.stringify(data.sucursales_disponibles));
            localStorage.setItem('sucursalId', data.sucursal_actual.id);

            // Actualizar estado
            setToken(data.token);
            setUser(data.usuario);
            setSucursalActual(data.sucursal_actual);
            setSucursales(data.sucursales_disponibles);

            // Redirigir al dashboard
            window.location.href = '/dashboard';
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sucursalActual');
        localStorage.removeItem('sucursales');
        localStorage.removeItem('sucursalId');
        setToken(null);
        setUser(null);
        setSucursalActual(null);
        setSucursales([]);
        window.location.href = '/login';
    };

    const cambiarSucursal = (sucursalId: string) => {
        const nuevaSucursal = sucursales.find(s => s.id === sucursalId);
        if (nuevaSucursal) {
            localStorage.setItem('sucursalActual', JSON.stringify(nuevaSucursal));
            localStorage.setItem('sucursalId', nuevaSucursal.id);
            setSucursalActual(nuevaSucursal);

            // Recargar la página para actualizar datos
            window.location.reload();
        }
    };

    return (
        <AuthContext.Provider

            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token,
                sucursalActual,
                sucursales,
                login,
                logout,
                cambiarSucursal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};