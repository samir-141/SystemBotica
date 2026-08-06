import { createContext, useContext } from 'react';
import type { LoginRequest } from '../types/api.types';

export interface AuthUser {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
}

export interface AuthSucursal {
    id: string;
    nombre: string;
    empresa: string;
    botica_id?: string;
    es_principal: boolean;
    botica_ruc?: string;
    botica_direccion?: string;
    botica_telefono?: string;
}

export interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    sucursalActual: AuthSucursal | null;
    sucursales: AuthSucursal[];
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
    cambiarSucursal: (sucursalIdOrObj: string | AuthSucursal) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe ser usado dentro de AuthProvider');
    return context;
}
