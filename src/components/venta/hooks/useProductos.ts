// src/components/venta/hooks/useProductos.ts
// Hook de productos refactorizado con TanStack Query v5 + IndexedDB Cache
// (Secciones 7, 8, 11 y 21 del Documento de Arquitectura)

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import type { ProductoPOS, PaginatedResponse } from "../../api/api.data";
import type { PresentacionOption } from "../types";
import { CACHE_STALE_TIMES, indexedDbPersister } from "../../../lib/queryClient";

export const useProductos = () => {
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  // Debounced search (200ms)
  useEffect(() => {
    const timer = setTimeout(() => setBusquedaDebounced(busqueda), 200);
    return () => clearTimeout(timer);
  }, [busqueda]);

  // Consulta administrada por TanStack Query v5 + fallback IndexedDB
  const {
    data: productosRaw = [],
    isLoading: cargando,
    error: errorQuery,
    refetch: fetchProductos,
  } = useQuery<ProductoPOS[]>({
    queryKey: ["productos", busquedaDebounced],
    queryFn: async () => {
      const cacheKey = `productos_${busquedaDebounced.trim().toLowerCase()}`;
      try {
        const { data } = await api.get<PaginatedResponse<ProductoPOS>>("/productos", {
          params: {
            buscar: busquedaDebounced || undefined,
            limit: 30,
            orden: "nombre_asc",
          },
        });
        const soloConStock = (data.data || []).filter((p) => p.stock_total > 0);
        // Persistir en IndexedDB para funcionamiento offline/cache pesado
        await indexedDbPersister.persistQuery(cacheKey, soloConStock);
        return soloConStock;
      } catch (err) {
        // En caso de fallo de red, intentar recuperar de IndexedDB cache
        const offlineData = await indexedDbPersister.getQuery(cacheKey, CACHE_STALE_TIMES.PRODUCTOS);
        if (offlineData) return offlineData;
        throw err;
      }
    },
    staleTime: 0, // Invalidation instantánea para actualización de stock en tiempo real en el POS
  });

  const error = errorQuery ? (errorQuery as Error).message || "Error al conectar con el inventario" : null;

  // Agrupación y presentación de productos
  const productosAgrupados = useMemo(() => {
    const mapa = new Map<string, any>();
    productosRaw.forEach((prod) => {
      const key = prod.sku || prod.producto_comercial_id;
      if (!mapa.has(key)) {
        mapa.set(key, {
          producto_comercial_id: prod.producto_comercial_id,
          sku: prod.sku || "SIN SKU",
          nombre_comercial: prod.nombre_comercial,
          principio_activo: prod.principio_activo,
          laboratorio: prod.laboratorio,
          requiere_receta: prod.requiere_receta,
          stock_total: prod.stock_total,
          unidad_base_nombre: prod.unidad_abreviatura || "unid",
          presentaciones: [] as PresentacionOption[],
        });
      }
      const itemAgrupado = mapa.get(key);
      const presExistente = itemAgrupado.presentaciones.some(
        (p: PresentacionOption) =>
          p.id === (prod.presentacion_id || prod.presentacion_nombre)
      );
      if (!presExistente) {
        itemAgrupado.presentaciones.push({
          id: prod.presentacion_id || `${prod.producto_comercial_id}_${prod.presentacion_nombre}`,
          nombre: prod.presentacion_nombre || "Unidad",
          cantidad_unidad_base: prod.cantidad_unidad_base || 1,
          precio: prod.precio_actual,
        });
      }
    });
    return Array.from(mapa.values());
  }, [productosRaw]);

  return {
    productosRaw,
    busqueda,
    setBusqueda,
    cargando,
    error,
    productosAgrupados,
    fetchProductos,
  };
};
