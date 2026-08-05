import { useState, useEffect, useCallback } from "react";
import { reportesService } from "../../../services/reportes.service";
import { useAuth } from "../../../hooks/useAuth";
import { fechaCivil, fechaCivilMasDias } from "../../../utils/localDate";

export function useReportes() {
  const { sucursalActual } = useAuth();
  const [reporteVentas, setReporteVentas] = useState<any>(null);
  const [reporteInventario, setReporteInventario] = useState<any>(null);
  const [reporteFinanciero, setReporteFinanciero] = useState<any>(null);
  const [loadingVentas, setLoadingVentas] = useState(true);
  const [loadingInventario, setLoadingInventario] = useState(true);
  const [loadingFinanciero, setLoadingFinanciero] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rango de fechas por defecto: Mes actual
  const hoy = new Date();
  const hoyStr = fechaCivil(hoy);
  const hace30DiasStr = fechaCivilMasDias(hoy, -30);

  const [fechaInicio, setFechaInicio] = useState(hace30DiasStr);
  const [fechaFin, setFechaFin] = useState(hoyStr);
  const [sucursalReporteId, setSucursalReporteId] = useState<string>("");

  const fetchFinanciero = useCallback(async () => {
    setLoadingFinanciero(true);
    try {
      const data = await reportesService.getReporteFinanciero({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        sucursal_id: sucursalReporteId || undefined,
      });
      setReporteFinanciero(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar reporte financiero");
    } finally {
      setLoadingFinanciero(false);
    }
  }, [fechaInicio, fechaFin, sucursalReporteId]);

  const fetchVentas = useCallback(async () => {
    setLoadingVentas(true);
    setError(null);
    try {
      const data = await reportesService.getReporteVentas({
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
      const data = await reportesService.getReporteInventario({
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
    fetchFinanciero();
  }, [fetchVentas, fetchInventario, fetchFinanciero]);

  return {
    reporteVentas,
    reporteInventario,
    reporteFinanciero,
    loadingVentas,
    loadingInventario,
    loadingFinanciero,
    error,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    sucursalReporteId,
    setSucursalReporteId,
    refetchVentas: fetchVentas,
    refetchInventario: fetchInventario,
    refetchFinanciero: fetchFinanciero,
  };
}

