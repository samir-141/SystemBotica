// src/components/productos/hooks/useProductos.ts
import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";
import type { ProductoPOS, QueryParamsProductos, PaginatedResponse } from "../../api/api.data";

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook CRUD para productos: listado paginado, búsqueda, crear, editar, eliminar.
 */
export function useProductos() {
  const [productos, setProductos] = useState<ProductoPOS[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── parámetros de búsqueda / filtro ────────────────── */
  const [params, setParams] = useState<QueryParamsProductos>({
    page: 1,
    limit: 20,
    buscar: "",
    orden: "nombre_asc",
  });

  /* ── fetch listado ──────────────────────────────────── */
  const fetchProductos = useCallback(async (p: QueryParamsProductos) => {
    setLoading(true);
    setError(null);
    try {
      const res: PaginatedResponse<ProductoPOS> = await posApi.getProductos(p);
      setProductos(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err: any) {
      setError(err.message ?? "Error al cargar productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* disparar fetch cuando cambian los params (con debounce simple) */
  useEffect(() => {
    const timer = setTimeout(() => fetchProductos(params), 300);
    return () => clearTimeout(timer);
  }, [params, fetchProductos]);

  /* ── acciones de cambio de params ───────────────────── */
  const setBusqueda = (buscar: string) =>
    setParams((p) => ({ ...p, buscar, page: 1 }));

  const setPage = (page: number) =>
    setParams((p) => ({ ...p, page }));

  const setOrden = (orden: QueryParamsProductos["orden"]) =>
    setParams((p) => ({ ...p, orden }));

  const setFiltro = (key: "laboratorio_id" | "categoria_id" | "principio_activo_id", value: string) =>
    setParams((p) => ({ ...p, [key]: value || undefined, page: 1 }));

  /* ── CRUD ────────────────────────────────────────────── */
  const crearProducto = async (data: Record<string, unknown>) => {
    const nuevo = await posApi.crearProducto(data);
    await fetchProductos(params); // refrescar tabla
    return nuevo;
  };

  const actualizarProducto = async (id: string, data: Record<string, unknown>) => {
    const actualizado = await posApi.actualizarProducto(id, data);
    await fetchProductos(params);
    return actualizado;
  };

  const eliminarProducto = async (id: string) => {
    await posApi.eliminarProducto(id);
    await fetchProductos(params);
  };

  return {
    productos,
    meta,
    loading,
    error,
    params,
    setBusqueda,
    setPage,
    setOrden,
    setFiltro,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    refetch: () => fetchProductos(params),
  };
}
