import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";
import { useAuth } from "../../../hooks/useAuth";

export interface ResumenDashboard {
    kpis: {
        total_ventas_hoy: number;
        ganancia_neta_hoy?: number;
        margen_ganancia_pct?: number;
        operaciones_hoy: number;
        ticket_promedio: number;
        total_ventas_ayer: number;
        porcentaje_crecimiento: number;
    };
    progreso_capital?: {
        meta_capital: number;
        recaudado: number;
        pendiente: number;
        porcentaje_completado: number;
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

    const fetchResumen = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const data = await posApi.getDashboardResumen(sucursalActual?.id);
            setResumen(data);
        } catch (err: any) {
            console.error("Error al obtener datos del dashboard:", err);
            setError(err.message || "Error al conectar con el servidor.");
        } finally {
            setCargando(false);
        }
    }, [sucursalActual?.id]);

    useEffect(() => {
        fetchResumen();
    }, [fetchResumen]);

    return {
        resumen,
        cargando,
        error,
        refetch: fetchResumen,
    };
}
