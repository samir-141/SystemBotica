// src/components/venta/hooks/useProductos.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { api } from "../../api/client";
import type { ProductoPOS, PaginatedResponse } from "../../api/api.data";
import type { PresentacionOption } from "../types";

export const useProductos = () => {
  const [productosRaw, setProductosRaw] = useState<ProductoPOS[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch function
  const fetchProductos = useCallback(async (termino: string) => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<ProductoPOS>>("/productos", {
        params: {
          buscar: termino || undefined,
          limit: 60,
          orden: "nombre_asc",
        },
      });
      const soloConStock = (data.data || []).filter(p => p.stock_total > 0);
      setProductosRaw(soloConStock);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con el inventario de la sucursal");
    } finally {
      setCargando(false);
    }
  }, []);

  // Debounced search effect (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductos(busqueda);
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda, fetchProductos]);

  // Agrupación y presentación de productos
  const productosAgrupados = useMemo(() => {
    const mapa = new Map<string, any>();
    productosRaw.forEach(prod => {
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
    setProductosRaw,
    busqueda,
    setBusqueda,
    cargando,
    error,
    productosAgrupados,
    fetchProductos,
  };
};
