// DashboardVentas.tsx
import { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    Users,
    DollarSign,
    ShoppingCart,
    Calendar,
    Download,
    Filter
} from 'lucide-react';

import BoxInfo from './BoxInfo';
import Filtros from './Filtros';
import HeaderDasbord from './HeaderDasbord';

import type {
    VentaGrafico,
    VentaPorCategoria,
    VentaPorCajero,
} from '../elementosglobales/types';

// Importa las funciones reales de tu API
// import {
//     getVentasData,
//     getTopProductos,
//     getVentasPorCategoria,
//     getMetodosPago,
//     getVentasPorCajero,
// } from '../../config/api.data';

export default function DashboardVentas() {
    // ==================== ESTADOS ====================
    const [periodo, setPeriodo] = useState<'1' | '7' | '30' | '90' | 'all'>('30');
    const [categoriaFiltro, setCategoriaFiltro] = useState<string>('all');

    // Datos crudos del backend
    const [ventasRaw, setVentasRaw] = useState<VentaGrafico[]>([]);
    const [porCategoriaRaw, setPorCategoriaRaw] = useState<VentaPorCategoria[]>([]);
    const [ventasPorCajeroRaw, setVentasPorCajeroRaw] = useState<VentaPorCajero[]>([]);

    const [cargando, setCargando] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ==================== FETCH DE DATOS ====================
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                setError(null);

                // TODO: Descomenta y ajusta según tu API real
                // const [ventas, topProductos, porCategoria, metodosPago, porCajero] = await Promise.all([
                //     getVentasData(periodo),
                //     getTopProductos(periodo),
                //     getVentasPorCategoria(periodo),
                //     getMetodosPago(periodo),
                //     getVentasPorCajero(periodo),
                // ]);

                // setVentasRaw(ventas);
                // setTopProductosRaw(topProductos);
                // setPorCategoriaRaw(porCategoria);
                // setMetodosPagoRaw(metodosPago);
                // setVentasPorCajeroRaw(porCajero);

                // Simulación temporal (quítala cuando conectes la API)
                console.log(`Cargando datos para período: ${periodo}`);

            } catch (err) {
                console.error(err);
                setError('Error al cargar los datos del dashboard. Inténtalo de nuevo.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [periodo]); // Se vuelve a cargar cuando cambia el período

    // ==================== CÁLCULOS MEMORIZADOS ====================
    const ventasGrafico = useMemo(() => {
        if (periodo === 'all') return ventasRaw;
        const dias = parseInt(periodo);
        return ventasRaw.slice(-dias);
    }, [ventasRaw, periodo]);

    const totalVentas = useMemo(() => {
        return ventasGrafico.reduce((sum, v) => sum + (v.total || 0), 0);
    }, [ventasGrafico]);

    const totalTickets = ventasGrafico.length;

    const ticketPromedio = useMemo(() => {
        return totalTickets > 0 ? totalVentas / totalTickets : 0;
    }, [totalVentas, totalTickets]);

    // ==================== RENDER ====================
    if (error) {
        return (
            <div className="p-6 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-md text-center">
                    ⚠️ {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen ">
            {/* Header */}

            <HeaderDasbord
                calendario={<Calendar className="w-8 h-8 text-gray-600" />}
                Dowloand={<Download className="w-8 h-8 text-gray-600" />}
                periodo={periodo}
                setPeriodo={setPeriodo}
            />

            {/* Filtros */}
            <Filtros
                icon={<Filter className="w-8 h-8 text-gray-600" />}
                categoriaFiltro={categoriaFiltro}
                setCategoriaFiltro={setCategoriaFiltro}
                porCategoriaRaw={porCategoriaRaw}
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <BoxInfo
                    Sing={<DollarSign className="w-8 h-8 text-emerald-600" />}
                    value={totalVentas.toFixed(2)}
                    text="Ventas Totales"
                />
                <BoxInfo
                    Sing={<ShoppingCart className="w-8 h-8 text-blue-600" />}
                    value={totalTickets.toString()}
                    text="Tickets Emitidos"
                />
                <BoxInfo
                    Sing={<TrendingUp className="w-8 h-8 text-violet-600" />}
                    value={ticketPromedio.toFixed(2)}
                    text="Ticket Promedio"
                />
                <BoxInfo
                    Sing={<Users className="w-8 h-8 text-amber-600" />}
                    value={ventasPorCajeroRaw.length.toString()}
                    text="Cajeros Activos"
                />
            </div>

            {/* Gráfico de Evolución */}


            {/* Aquí puedes agregar más secciones:
                - Top Productos
                - Ventas por Categoría
                - Métodos de Pago
                - Rendimiento por Cajero
            */}
        </div>
    );
}