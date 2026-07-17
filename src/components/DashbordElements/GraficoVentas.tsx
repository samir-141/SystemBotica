// DashboardVentas.tsx
import { useState, useMemo } from 'react';
import {
    TrendingUp, Users, DollarSign, ShoppingCart,
    Calendar, Filter, Download
} from 'lucide-react';
import BoxInfo from './BoxInfo';
import Filtros from './Filtros';
import HeaderDasbord from './HeaderDasbord';
import GraficoEvolucion from './GraficoEvolucion';
import { getVentasData, getTopProductos, getVentasPorCategoria, getMetodosPago, getVentasPorCajero } from '../../config/api.data';


export default function DashboardVentas() {
    const [periodo, setPeriodo] = useState<'1' | '7' | '30' | '90' | 'all'>('30');
    const [categoriaFiltro, setCategoriaFiltro] = useState<string>('all');

    // Datos base
    const ventasRaw = getVentasData();
    const topProductosRaw = getTopProductos();
    const porCategoriaRaw = getVentasPorCategoria();
    const metodosPagoRaw = getMetodosPago();
    const ventasPorCajeroRaw = getVentasPorCajero();

    // Filtros (simulados por ahora - puedes conectarlos después)
    const ventasGrafico = useMemo(() => {
        return periodo === 'all' ? ventasRaw : ventasRaw.slice(-parseInt(periodo));
    }, [ventasRaw, periodo]);

    const totalVentas = ventasGrafico.reduce((sum, v) => sum + v.total, 0);
    const totalTickets = ventasGrafico.length;
    const ticketPromedio = totalTickets > 0 ? totalVentas / totalTickets : 0;

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <HeaderDasbord
                calendario={<Calendar className="w-8 h-8 text-gray-600" />}
                Dowloand={<Download className="w-8 h-8 text-gray-600" />}
                periodo={periodo}
                setPeriodo={setPeriodo}
            />

            {/* KPIs Mejorados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <BoxInfo Sing={<DollarSign className="w-8 h-8 text-emerald-600" />} value={totalVentas.toFixed(2)} text="Ventas Totales" />
                <BoxInfo Sing={<ShoppingCart className="w-8 h-8 text-blue-600" />} value={totalTickets.toFixed(2)} text="Ventas Totales" />
                <BoxInfo Sing={<TrendingUp className="w-8 h-8 text-violet-600" />} value={ticketPromedio.toFixed(2)} text="Ventas Totales" />
                <BoxInfo Sing={<Users className="w-8 h-8 text-amber-600" />} value={"3"} text="Cajeros Activos" />
            </div>

            {/* Filtros Secundarios */}
            <Filtros
                icon={<Filter className="w-5 h-5" />}
                categoriaFiltro={categoriaFiltro}
                setCategoriaFiltro={setCategoriaFiltro}
                porCategoriaRaw={porCategoriaRaw}
            />

            {/* Gráficos */}
            <GraficoEvolucion
                ventasGrafico={ventasGrafico}
                topProductosRaw={topProductosRaw}
                porCategoriaRaw={porCategoriaRaw}
                metodosPagoRaw={metodosPagoRaw}
                ventasPorCajeroRaw={ventasPorCajeroRaw}
            />
        </div>
    );
}