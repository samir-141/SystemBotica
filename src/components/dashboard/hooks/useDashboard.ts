import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";
import { useAuth } from "../../../hooks/useAuth";

export interface ResumenDashboard {
    kpis: {
        total_ventas_hoy: number;
        ganancia_neta_hoy?: number;
        margen_ganancia_pct?: number;
        costo_ventas_hoy?: number;
        operaciones_hoy: number;
        ticket_promedio: number;
        total_ventas_ayer: number;
        porcentaje_crecimiento: number;
        recetas_dispensadas_hoy?: number;
        lotes_vencer_90_dias_count?: number;
        monto_vencer_90_dias?: number;
        pct_generico_vs_marca?: number;
        ultima_verificacion_stock?: string;
    };
    progreso_capital?: {
        meta_capital: number;
        recaudado: number;
        pendiente: number;
        porcentaje_completado: number;
        fecha_inicio?: string;
        compras_inventario?: number;
        inversiones_adicionales?: number;
        gastos_operativos?: number;
        ingresos_historicos?: number;
        costo_ventas_historico?: number;
        resultado_acumulado?: number;
        margen_acumulado_pct?: number;
        venta_estimada_stock?: number;
        costo_stock_vigente?: number;
        ganancia_estimada_stock?: number;
        venta_estimada_minima?: number;
        venta_estimada_maxima?: number;
        ganancia_estimada_minima?: number;
        ganancia_estimada_maxima?: number;
    };
    grafico_7_dias: {
        fecha: string;
        dia: string;
        total: number;
        cantidad: number;
    }[];
    desglose_pagos: {
        metodo: string;
        monto: number;
        porcentaje: number;
    }[];
    top_productos: {
        id: string;
        nombre: string;
        presentacion: string;
        cantidad: number;
        total: number;
    }[];
    productos_rentables?: {
        id: string;
        nombre: string;
        presentacion: string;
        cantidad: number;
        ingresos: number;
        ganancia_neta: number;
        margen_pct: number;
    }[];
    top_clientes?: {
        id: string;
        nombre: string;
        documento: string;
        total_comprado: number;
        compras_count: number;
    }[];
    top_vendedores?: {
        id: string;
        nombre: string;
        correo: string;
        total_facturado: number;
        operaciones_count: number;
    }[];
    alertas_stock: {
        id: string;
        producto_comercial_id: string;
        nombre_comercial: string;
        sku: string;
        numero_lote: string;
        stock_actual: number;
        fecha_vencimiento: string;
    }[];
}

export function useDashboard() {
    const { sucursalActual } = useAuth();
    const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rangoFecha, setRangoFecha] = useState<string>("HOY");

    const fetchResumen = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await posApi.getDashboardResumen(sucursalActual?.id, rangoFecha);
            setResumen(data);
        } catch (err: any) {
            console.error("Error al obtener datos del dashboard:", err);
            setError(err.message || "Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    }, [sucursalActual?.id, rangoFecha]);

    useEffect(() => {
        fetchResumen();
    }, [fetchResumen]);

    return {
        resumen,
        cargando,
        error,
        refetch: fetchResumen,
        rangoFecha,
        setRangoFecha,
    };
}
