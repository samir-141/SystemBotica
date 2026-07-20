// src/components/auth/DashboardPreview.tsx

import {
    DollarSign,
    Package2,
    TriangleAlert,
    TrendingUp,
    Pill,
    ArrowUpRight,
} from "lucide-react";

const stats = [
    {
        title: "Ventas Hoy",
        value: "S/ 2,540",
        icon: DollarSign,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "hover:border-emerald-500/30",
    },
    {
        title: "Productos",
        value: "1,284",
        icon: Package2,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "hover:border-cyan-500/30",
    },
    {
        title: "Stock Bajo",
        value: "12",
        icon: TriangleAlert,
        color: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "hover:border-orange-500/30",
    },
];

const DashboardPreview = () => {
    return (
        <div className="relative w-full">
            {/* Resplandor de fondo */}
            <div className="absolute -inset-4 rounded-[32px] bg-cyan-500/5 blur-3xl pointer-events-none" />

            {/* Contenedor Principal (Card con Glassmorphism) */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl p-5 lg:p-6 shadow-2xl transition-all duration-300 hover:border-slate-700">

                {/* Cabecera del Dashboard */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                            Panel de Control
                        </p>
                        <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight mt-0.5">
                            Resumen del día
                        </h2>
                    </div>
                    <div className="rounded-xl bg-cyan-500/10 p-2.5 border border-cyan-500/20">
                        <TrendingUp className="h-5 w-5 text-cyan-400" />
                    </div>
                </div>

                {/* Fila de Tarjetas de Estadísticas */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className={`rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 transition-all duration-300 ${item.border}`}
                            >
                                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                                    <Icon className={`h-4 w-4 ${item.color}`} />
                                </div>
                                <p className="text-[11px] font-medium text-slate-400 truncate">
                                    {item.title}
                                </p>
                                <h3 className="mt-0.5 text-sm lg:text-base font-bold text-white tracking-tight">
                                    {item.value}
                                </h3>
                            </div>
                        );
                    })}
                </div>

                {/* Sección Intermedia: Gráfico y Alerta */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-5 items-end">

                    {/* Mini Gráfico de Barras (Ocupa 3 de 5 columnas) */}
                    <div className="md:col-span-3">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-400">
                                Ventas semanales
                            </span>
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                +18%
                                <ArrowUpRight className="h-3 w-3" />
                            </span>
                        </div>

                        <div className="flex h-24 items-end gap-2 pt-2 border-b border-slate-800">
                            {[45, 70, 40, 90, 65, 85, 100].map((h, index) => (
                                <div
                                    key={index}
                                    className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-500 to-blue-600 transition-all duration-500 hover:from-cyan-400 hover:to-blue-500 cursor-pointer"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Alerta de Medicamentos (Ocupa 2 de 5 columnas) */}
                    <div className="md:col-span-2 w-full">
                        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 transition-all hover:border-orange-500/20">
                            <div className="flex items-center justify-between mb-2">
                                <div className="rounded-lg bg-blue-500/10 p-1.5 border border-blue-500/20">
                                    <Pill className="h-4 w-4 text-blue-400" />
                                </div>
                                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-400 uppercase border border-orange-500/20">
                                    Crítico
                                </span>
                            </div>
                            <h4 className="text-xs font-semibold text-white truncate">
                                Amoxicilina 500mg
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Vence en 14 días
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default DashboardPreview;