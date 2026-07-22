// src/components/auth/LoginHero.tsx

import {
    Pill,
    PackageCheck,
    ShieldCheck,
    BarChart3,
    CheckCircle2,
} from "lucide-react";

const features = [
    {
        icon: <PackageCheck className="h-5 w-5 text-cyan-400" />,
        title: "Inventario Inteligente",
        description: "Control total de stock en tiempo real.",
    },
    {
        icon: <Pill className="h-5 w-5 text-cyan-400" />,
        title: "Lotes y Vencimientos",
        description: "Gestiona medicamentos de forma segura.",
    },
    {
        icon: <BarChart3 className="h-5 w-5 text-cyan-400" />,
        title: "Reportes",
        description: "Obtén estadísticas de ventas al instante.",
    },
    {
        icon: <ShieldCheck className="h-5 w-5 text-cyan-400" />,
        title: "Seguro",
        description: "Toda la información protegida.",
    },
];

const LoginHero = () => {
    return (

        // 🔄 CAMBIO: Se eliminó h-screen y overflow-hidden. Ahora usa min-h-screen y permite scroll interno si es necesario.
        <div className="relative hidden lg:flex pb-10 flex-col justify-between w-full min-h-screen bg-slate-950 px-8 pt-12 lg:px-16 lg:pt-16 select-none border-r border-slate-800 overflow-y-auto">

            {/* Efectos de luces de fondo (Glow radial) */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            {/* Contenedor Superior: Textos y Características */}
            <div className="relative z-10 max-w-2xl w-full">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-cyan-400 backdrop-blur-sm shadow-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                        Sistema POS para Farmacias
                    </span>
                </div>

                {/* Título */}
                <h1 className="mt-6 text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                    Farma<span className="text-cyan-400 bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">POS</span>
                </h1>

                {/* Descripción */}
                <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-xl">
                    Administra tu farmacia desde un solo lugar. Controla inventario, ventas,
                    lotes, vencimientos y reportes mediante una interfaz moderna, rápida y segura.
                </p>

                {/* Grilla de Características */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900/80"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 group-hover:bg-cyan-950/50 group-hover:border-cyan-500/30 transition-colors">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white tracking-wide">
                                    {feature.title}
                                </h3>
                                <p className="mt-1 text-xs text-slate-400 leading-normal">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contenedor Inferior: Dashboard Preview */}
            {/* 🔄 CAMBIO: Se redujeron los márgenes de empuje negativos y se limitó el alto máximo del preview */}
            {/* Contenedor Inferior: Dashboard Preview con Desvanecimiento Seguro */}
            <div className="relative z-10 mt-auto w-full pt-6 overflow-hidden">
                {/* Máscara de degradado: Hace que el componente se desvanezca suavemente y evita el corte brusco */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent z-20 pointer-events-none" />

                {/* Ventana simulada */}
                <div className="relative rounded-t-2xl border-t border-x border-slate-800/80 bg-slate-900/40 p-3 pb-20 backdrop-blur-sm shadow-2xl">
                    {/* Barra de control del navegador */}
                    <div className="flex items-center gap-1.5 px-2 pb-3 pt-0.5 border-b border-slate-800/60 mb-4">
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    </div>


                </div>
            </div>

        </div>
    );
};

export default LoginHero;