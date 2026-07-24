import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";

export interface UsuarioItem {
  id: string;
  nombre: string;
  correo: string;
  estado: string;
  rol_id: string;
  rol_nombre: string;
  created_at?: string;
}

export interface RolItem {
  id: string;
  nombre: string;
  rol_permisos?: {
    permisos: {
      id: string;
      codigo: string;
      descripcion: string;
    };
  }[];
}

export interface SucursalAdminItem {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  total_cajas: number;
}

export function useAdmin() {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [roles, setRoles] = useState<RolItem[]>([]);
  const [sucursales, setSucursales] = useState<SucursalAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [uData, rData, sData] = await Promise.all([
        posApi.getUsuarios(),
        posApi.getRoles(),
        posApi.getSucursalesAdmin(),
      ]);
      setUsuarios(uData || []);
      setRoles(rData || []);
      setSucursales(sData || []);
    } catch (err: any) {
      console.error("Error al cargar datos de administración:", err);
      setError(err.message || "Error al cargar módulo de administración");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const crearUsuario = async (payload: Record<string, unknown>) => {
    await posApi.crearUsuario(payload);
    await fetchAll();
  };

  const actualizarUsuario = async (id: string, payload: Record<string, unknown>) => {
    await posApi.actualizarUsuario(id, payload);
    await fetchAll();
  };

  const eliminarUsuario = async (id: string) => {
    await posApi.eliminarUsuario(id);
    await fetchAll();
  };

  const crearSucursal = async (payload: { nombre: string; direccion: string; telefono?: string }) => {
    await posApi.crearSucursal(payload);
    await fetchAll();
  };

  return {
    usuarios,
    roles,
    sucursales,
    loading,
    error,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    crearSucursal,
    refetch: fetchAll,
  };
}
