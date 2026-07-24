import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";
import { useAuth } from "../../../hooks/useAuth";

export function useReportes() {
  const { sucursalActual } = useAuth();
  const [reporteVentas, setReporteVentas] = useState<any>(null);
  const [reporteInventario, setReporteInventario] = useState<any>(null);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [loadingInventario, setLoadingInventario] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rango de fechas por defecto: Mes actual
  const hoyStr = new Date().toISOString().split("T")[0];
  const hace30DiasStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [fechaInicio, setFechaInicio] = useState(hace30DiasStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);

  const fetchVentas = useCallback(async () => {
    setLoadingVentas(true);
    setError(null);
    try {
      const data = await posApi.getReporteVentas({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        sucursal_id: sucursalActual?.id,
      });
      setReporteVentas(data);
    } catch (err: any) {
      console.error("Error al cargar reporte de ventas:", err);
      setError(err.message || "Error al cargar reporte de ventas");
    } finally {
      setLoadingVentas(false);
    }
  }, [fechaInicio, fechaFin, sucursalActual]);

  const fetchInventario = useCallback(async () => {
    setLoadingInventario(true);
    try {
      const data = await posApi.getReporteInventario({
        sucursal_id: sucursalActual?.id,
      });
      setReporteInventario(data);
    } catch (err: any) {
      console.error("Error al cargar reporte de inventario:", err);
    } finally {
      setLoadingInventario(false);
    }
  }, [sucursalActual]);

  useEffect(() => {
    fetchVentas();
    fetchInventario();
  }, [fetchVentas, fetchInventario]);

  return {
    reporteVentas,
    reporteInventario,
    loadingVentas,
    loadingInventario,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    refetchVentas: fetchVentas,
    refetchInventario: fetchInventario,
  };
}
