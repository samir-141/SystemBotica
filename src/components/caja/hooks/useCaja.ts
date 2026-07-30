import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";

export interface EstadoCaja {
  caja_id: string;
  nombre: string;
  estado: "ABIERTA" | "CERRADA";
  monto_inicial: number;
  efectivo_esperado: number;
  ventas_efectivo: number;
  ventas_digitales: number;
  desglose_metodos: Array<{ metodo: string; monto: number }>;
  ingresos_manuales: number;
  egresos_manuales: number;
  operaciones_count: number;
  fecha_apertura: string | null;
}

export function useCaja() {
  const [estadoCaja, setEstadoCaja] = useState<EstadoCaja | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadoCaja = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await posApi.getEstadoCaja();
      setEstadoCaja(res);
    } catch (err: any) {
      console.error("Error al obtener estado de caja:", err);
      setError(err.message || "Error al conectar con el servidor de cajas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstadoCaja();
  }, [fetchEstadoCaja]);

  const aperturarCaja = async (montoInicial: number, observacion?: string) => {
    const res = await posApi.aperturarCaja({ monto_inicial: montoInicial, observacion });
    await fetchEstadoCaja();
    return res;
  };

  const registrarMovimiento = async (tipo: "INGRESO" | "EGRESO", monto: number, observacion: string) => {
    const res = await posApi.registrarMovimientoCaja({ tipo, monto, observacion });
    await fetchEstadoCaja();
    return res;
  };

  const cerrarCaja = async (efectivoContado: number, observacion?: string) => {
    const res = await posApi.cerrarCaja({ efectivo_contado: efectivoContado, observacion });
    await fetchEstadoCaja();
    return res;
  };

  return {
    estadoCaja,
    loading,
    error,
    refetch: fetchEstadoCaja,
    aperturarCaja,
    registrarMovimiento,
    cerrarCaja,
  };
}
