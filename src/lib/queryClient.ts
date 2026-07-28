// src/lib/queryClient.ts
// Configuración centralizada de TanStack Query v5 + Persistencia IndexedDB

import { QueryClient } from "@tanstack/react-query";
import { get, set, del } from "idb-keyval";

// Configuración por defecto de tiempos de cache por entidad (Sección 21 del documento de arquitectura)
export const CACHE_STALE_TIMES = {
  PRODUCTOS: 1000 * 60 * 10,   // 10 minutos
  CLIENTES: 1000 * 60 * 30,    // 30 minutos
  CATEGORIAS: 1000 * 60 * 60 * 24, // 24 horas
  CONFIGURACION: 1000 * 60 * 60 * 24, // 24 horas
  LABORATORIOS: 1000 * 60 * 60 * 24,  // 24 horas
  USUARIOS: 1000 * 60 * 15,    // 15 minutos
  DASHBOARD: 1000 * 60 * 2,    // 2 minutos
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_STALE_TIMES.PRODUCTOS,
      gcTime: 1000 * 60 * 60 * 24, // Mantener en memoria / cache 24 horas
      refetchOnWindowFocus: false,  // Evitar peticiones masivas al enfocar pestaña
      refetchOnReconnect: true,     // Reconsultar al recuperar conexión a internet
      retry: 2,                     // 2 reintentos en caso de fallo de red
    },
  },
});

// Helper de persistencia en IndexedDB para caches pesados offline (Productos, Clientes, etc.)
export const indexedDbPersister = {
  persistQuery: async (key: string, data: any) => {
    try {
      await set(`pos_cache_${key}`, { data, timestamp: Date.now() });
    } catch (err) {
      console.warn("[IndexedDB] Error al guardar cache:", err);
    }
  },
  getQuery: async (key: string, maxAgeMs: number = CACHE_STALE_TIMES.PRODUCTOS) => {
    try {
      const item = await get<{ data: any; timestamp: number }>(`pos_cache_${key}`);
      if (!item) return null;
      if (Date.now() - item.timestamp > maxAgeMs) {
        await del(`pos_cache_${key}`);
        return null;
      }
      return item.data;
    } catch (err) {
      console.warn("[IndexedDB] Error al leer cache:", err);
      return null;
    }
  },
  clearCache: async (key: string) => {
    try {
      await del(`pos_cache_${key}`);
    } catch (err) {
      console.warn("[IndexedDB] Error al limpiar cache:", err);
    }
  },
};
