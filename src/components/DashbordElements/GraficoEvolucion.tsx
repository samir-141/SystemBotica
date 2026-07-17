import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

interface GraficoEvolucionProps {
    ventasGrafico: any[];
    topProductosRaw: any[];
    porCategoriaRaw: any[];
    metodosPagoRaw: any[];
    ventasPorCajeroRaw: any[];
}

export default function GraficoEvolucion({
    ventasGrafico,
    topProductosRaw,
    porCategoriaRaw,
    metodosPagoRaw,
    ventasPorCajeroRaw
}: GraficoEvolucionProps) {

    // Formatter seguro y compatible con Recharts
    const moneyFormatter = (value: any) => [`S/ ${Number(value || 0).toFixed(2)}`, "Monto"];
    const unitFormatter = (value: any) => [`${value} unidades`, "Cantidad"];

    return (
        <div className="space-y-6">
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
                            <Tooltip formatter={moneyFormatter} />
                            <Line
                                type="natural"
                                dataKey="total"
                                stroke="#10b981"
                                strokeWidth={4}
                                dot={{ r: 5, fill: '#10b981' }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Productos Más Vendidos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6">Productos Más Vendidos</h2>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={topProductosRaw.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="nombre"
                                angle={-45}
                                textAnchor="end"
                                height={90}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip formatter={unitFormatter} />
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
                            <Tooltip formatter={moneyFormatter} />
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
                                <Tooltip formatter={moneyFormatter} />
                                <Bar dataKey="monto" fill="#8b5cf6" radius={6} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">Rendimiento por Cajero</h2>
                        <div className="space-y-4">
                            {ventasPorCajeroRaw.map((cajero, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-medium text-slate-700">{cajero.cajero}</span>
                                    <span className="font-bold text-lg text-emerald-600">
                                        S/ {Number(cajero.total).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}