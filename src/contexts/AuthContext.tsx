// src/contexts/AuthContext.tsx
import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import type { LoginRequest } from '../types/api.types';
import { queryClient } from '../lib/queryClient';
import { limpiarCarritoStorage } from '../components/venta/utils/cartStorage';
import { AuthContext, type AuthSucursal as Sucursal, type AuthUser as User } from './auth-context';

function parseJsonSeguro<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

const esUsuarioValido = (value: unknown): value is User => {
    const item = value as Partial<User> | null;
    return Boolean(item && typeof item.id === 'string' && typeof item.correo === 'string' && typeof item.rol === 'string');
};

const esSucursalValida = (value: unknown): value is Sucursal => {
    const item = value as Partial<Sucursal> | null;
    return Boolean(item && typeof item.id === 'string' && typeof item.nombre === 'string');
};

function limpiarSesionLocal() {
    ['token', 'user', 'usuario', 'sucursalActual', 'sucursales', 'sucursalId', 'rol'].forEach((key) =>
        localStorage.removeItem(key),
    );
}

const scopeCarrito = (usuario: User | null, sucursal: Sucursal | null) => ({
    usuarioId: usuario?.id || 'anonimo',
    boticaId: sucursal?.botica_id || 'sin-botica',
    sucursalId: sucursal?.id || 'sin-sucursal',
});

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

        const userGuardado = parseJsonSeguro<unknown>(storedUser);
        const sucursalGuardada = parseJsonSeguro<unknown>(storedSucursal);
        const sucursalesGuardadasRaw = parseJsonSeguro<unknown>(storedSucursales);
        const parsedUser = esUsuarioValido(userGuardado) ? userGuardado : null;
        const parsedSucursal = esSucursalValida(sucursalGuardada) ? sucursalGuardada : null;
        const parsedSucursales = Array.isArray(sucursalesGuardadasRaw)
            ? sucursalesGuardadasRaw.filter(esSucursalValida)
            : [];

        if (storedToken && parsedUser && parsedSucursal) {
            const sucursalesGuardadas = Array.isArray(parsedSucursales) ? parsedSucursales : [];
            const sucursalNormalizada = {
                ...parsedSucursal,
                botica_id:
                    parsedSucursal.botica_id ||
                    sucursalesGuardadas.find((item) => item.id === parsedSucursal.id)?.botica_id,
            };
            setToken(storedToken);
            setUser(parsedUser);
            setSucursalActual(sucursalNormalizada);
            setSucursales(sucursalesGuardadas);

            // Si el usuario es Administrador y sucursales tiene 1 o menos, cargar todas las sucursales del sistema
            const rolUpper = String(parsedUser?.rol || '').toUpperCase();
            const esAdmin = rolUpper.includes('ADMIN') || rolUpper.includes('PROPIETARIO') || rolUpper === 'GERENTE';
            if (esAdmin) {
                authService.getSucursalesAdmin().then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        const formatted = data.map((s: any) => ({
                            id: s.id,
                            nombre: s.nombre,
                            empresa: s.empresa || 'Botica Marifarma',
                            botica_id: s.botica_id,
                            es_principal: !!s.es_principal,
                            botica_ruc: s.botica_ruc || s.boticas?.ruc,
                            botica_direccion: s.botica_direccion || s.boticas?.direccion,
                            botica_telefono: s.botica_telefono || s.boticas?.telefono,
                        }));
                        setSucursales(formatted);
                        localStorage.setItem('sucursales', JSON.stringify(formatted));
                    }
                }).catch((err) => {
                    console.warn('No se pudieron cargar sucursales administrativas adicionales:', err);
                });
            }
        } else if (storedToken || storedUser || storedSucursal || storedSucursales) {
            limpiarSesionLocal();
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const data = await authService.login(credentials);
            const sucursalesDisponibles = Array.isArray(data.sucursales_disponibles)
                ? data.sucursales_disponibles
                : [];
            const sucursalActual = {
                ...data.sucursal_actual,
                botica_id:
                    data.sucursal_actual.botica_id ||
                    sucursalesDisponibles.find((item) => item.id === data.sucursal_actual.id)?.botica_id,
            };

            // Guardar en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            localStorage.setItem('sucursalActual', JSON.stringify(sucursalActual));
            localStorage.setItem('sucursales', JSON.stringify(sucursalesDisponibles));
            localStorage.setItem('sucursalId', sucursalActual.id);
            localStorage.setItem('rol', data.usuario.rol);
            // Actualizar estado
            setToken(data.token);
            setUser(data.usuario);
            setSucursalActual(sucursalActual);
            setSucursales(sucursalesDisponibles);

            // Redirigir al dashboard
            window.location.href = '/';
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    const logout = () => {
        void limpiarCarritoStorage(scopeCarrito(user, sucursalActual));
        limpiarSesionLocal();
        localStorage.removeItem('pos_session_code');
        queryClient.clear();
        setToken(null);
        setUser(null);
        setSucursalActual(null);
        setSucursales([]);
        window.location.href = '/login';
    };

    const cambiarSucursal = (sucursalIdOrObj: string | Sucursal) => {
        const targetId = typeof sucursalIdOrObj === 'string' ? sucursalIdOrObj : sucursalIdOrObj?.id;
        const nuevaSucursal = sucursales.find(s => s.id === targetId) || (typeof sucursalIdOrObj === 'object' ? sucursalIdOrObj : null);
        
        if (nuevaSucursal) {
            if (nuevaSucursal.id === sucursalActual?.id) return;
            void Promise.all([
                limpiarCarritoStorage(scopeCarrito(user, sucursalActual)),
                limpiarCarritoStorage(scopeCarrito(user, nuevaSucursal)),
            ]);
            localStorage.setItem('sucursalActual', JSON.stringify(nuevaSucursal));
            localStorage.setItem('sucursalId', nuevaSucursal.id);
            setSucursalActual(nuevaSucursal);

            queryClient.clear();
        }
    };

    useEffect(() => {
        if (sucursalActual?.empresa) {
            document.title = `${sucursalActual.empresa} - Sistema POS`;
        } else {
            document.title = 'Botica Marifarma';
        }
    }, [sucursalActual]);

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
