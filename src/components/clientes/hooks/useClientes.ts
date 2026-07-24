import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";
import type { Cliente } from "../types";

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [tipoDocumentoFilter, setTipoDocumentoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await posApi.getClientes({
        page,
        limit: 20,
        buscar: busqueda || undefined,
        tipo_documento: tipoDocumentoFilter || undefined,
      });

      setClientes(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err: any) {
      console.error("Error al cargar clientes:", err);
      setError(err.message || "Error al conectar con la gestión de clientes");
    } finally {
      setLoading(false);
    }
  }, [page, busqueda, tipoDocumentoFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchClientes]);

  const crearCliente = async (payload: Record<string, unknown>) => {
    await posApi.crearCliente(payload);
    await fetchClientes();
  };

  const actualizarCliente = async (id: string, payload: Record<string, unknown>) => {
    await posApi.actualizarCliente(id, payload);
    await fetchClientes();
  };

  const eliminarCliente = async (id: string) => {
    await posApi.eliminarCliente(id);
    await fetchClientes();
  };

  return {
    clientes,
    meta,
    loading,
    error,
    busqueda,
    setBusqueda,
    tipoDocumentoFilter,
    setTipoDocumentoFilter,
    page,
    setPage,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    refetch: fetchClientes,
  };
}
