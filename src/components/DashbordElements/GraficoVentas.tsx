// DashboardVentas.tsx
import { useState, useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

import {
    TrendingUp, Users, DollarSign, ShoppingCart,
    Calendar, Filter, Download
} from 'lucide-react';

import { getVentasData, getTopProductos, getVentasPorCategoria, getMetodosPago, getVentasPorCajero } from '../../config/api.data';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function DashboardVentas() {
    const [periodo, setPeriodo] = useState<'7' | '30' | '90' | 'all'>('30');
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        📊 Dashboard de Ventas
                    </h1>
                    <p className="text-gray-600 mt-1">Botica - Resumen en tiempo real</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg border px-4 py-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <select
                            value={periodo}
                            onChange={(e) => setPeriodo(e.target.value as any)}
                            className="bg-transparent focus:outline-none text-sm font-medium"
                        >
                            <option value="1">Último día</option>
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 90 días</option>
                            <option value="all">Todo el período</option>
                        </select>
                    </div>

                    <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                        <Download className="w-5 h-5" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* KPIs Mejorados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ventas Totales</p>
                            <p className="text-3xl font-bold text-emerald-600 mt-2">S/ {totalVentas.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <DollarSign className="w-8 h-8 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Tickets Emitidos</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{totalTickets}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <ShoppingCart className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ticket Promedio</p>
                            <p className="text-3xl font-bold text-violet-600 mt-2">S/ {ticketPromedio.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-violet-100 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-violet-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Cajeros Activos</p>
                            <p className="text-3xl font-bold text-amber-600 mt-2">3</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-xl">
                            <Users className="w-8 h-8 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros Secundarios */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-700">
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">Filtros:</span>
                </div>

                <select
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">Todas las categorías</option>
                    {porCategoriaRaw.map(cat => (
                        <option key={cat.categoria} value={cat.categoria}>{cat.categoria}</option>
                    ))}
                </select>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Evolución de Ventas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Evolución de Ventas
                    </h2>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={ventasGrafico}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => [`S/ ${value.toFixed(2)}`, "Total"]} />
                            <Line type="natural" dataKey="total" stroke="#10b981" strokeWidth={4} dot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Productos Más Vendidos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6">Productos Más Vendidos</h2>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={topProductosRaw.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={90} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="cantidad" fill="#3b82f6" radius={8} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ventas por Categoría */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6">Ventas por Categoría</h2>
                    <ResponsiveContainer width="100%" height={340}>
                        <PieChart>
                            <Pie
                                data={porCategoriaRaw}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                dataKey="total"
                                nameKey="categoria"
                                labelLine={false}
                            >
                                {porCategoriaRaw.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `S/ ${value}`} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Métodos de Pago + Cajeros */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6">Métodos de Pago</h2>
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={metodosPagoRaw}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="metodo" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="monto" fill="#8b5cf6" radius={6} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Rendimiento por Cajero</h2>
                        <div className="space-y-4">
                            {ventasPorCajeroRaw.map((cajero, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <span className="font-medium">{cajero.cajero}</span>
                                    <span className="font-bold text-lg">S/ {cajero.total.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}