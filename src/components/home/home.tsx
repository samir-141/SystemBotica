import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Package,
    Users,
    BarChart3,
    Building2,
    Clock,
    Calendar,
    LogOut,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Pill,
    Sun,
    Moon,
    Sunset
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth"; // Ajusta la ruta a tu hook de Auth

export default function HomePos() {
    const { user, sucursalActual, logout } = useAuth();
    const navigate = useNavigate();

    // --- 1. ESTADO PARA FECHA Y HORA EN TIEMPO REAL ---
    const [tiempoActual, setTiempoActual] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTiempoActual(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Formatear Fecha (Ej: Miércoles, 22 de Julio de 2026)
    const fechaFormateada = tiempoActual.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Formatear Hora (Ej: 06:03:15 PM)
    const horaFormateada = tiempoActual.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    // --- 2. SALUDO DINÁMICO SEGÚN LA HORA ---
    const horaNum = tiempoActual.getHours();
    let saludo = "¡Buenos días!";
    let SaludoIcon = Sun;

    if (horaNum >= 12 && horaNum < 19) {
        saludo = "¡Buenas tardes!";
        SaludoIcon = Sunset;
    } else if (horaNum >= 19 || horaNum < 6) {
        saludo = "¡Buenas noches!";
        SaludoIcon = Moon;
    }

    // --- 3. ACCESOS DIRECTOS DEL TABLERO DE NAVEGACIÓN ---
    const accesosDirectos = [
        {
            titulo: "Nueva Venta (POS)",
            descripcion: "Abre la caja y realiza ventas rápidas con código de barras.",
            icon: ShoppingCart,
            path: "/ventas/nueva",
            color: "bg-teal-500 text-white hover:bg-teal-600",
            roles: ["Administrador", "Farmacéutico", "Cajero", "Vendedor"],
        },
        {
            titulo: "Inventario & Productos",
            descripcion: "Consulta catálogo, stock FEFO, precios y presentaciones.",
            icon: Package,
            path: "/productos",
            color: "bg-blue-600 text-white hover:bg-blue-700",
            roles: ["Administrador", "Farmacéutico"],
        },
        {
            titulo: "Gestión de Clientes",
            descripcion: "Administra la cartera de clientes y créditos.",
            icon: Users,
            path: "/clientes",
            color: "bg-indigo-600 text-white hover:bg-indigo-700",
            roles: ["Administrador", "Farmacéutico", "Cajero"],
        },
        {
            titulo: "Reportes & Ventas",
            descripcion: "Visualiza cortes de caja, cierres e informes.",
            icon: BarChart3,
            path: "/reportes/ventas",
            color: "bg-purple-600 text-white hover:bg-purple-700",
            roles: ["Administrador"],
        },
    ];

    // Filtrar accesos según el rol del usuario
    const rolUsuario = user?.rol || "Cajero";
    const accesosPermitidos = accesosDirectos.filter((acc) =>
        acc.roles.includes(rolUsuario)
    );

    return (
        <div className="min-h-full bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans antialiased flex flex-col justify-between space-y-6">

            {/* ═══════════════════════════════════════════════════════
          HEADER: BIENVENIDA, LOCAL Y RELOJ EN VIVO
      ═══════════════════════════════════════════════════════ */}
            <div className="space-y-4">

                {/* Banner Superior: Sucursal y Reloj */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">

                    {/* Fondo Decorativo */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Información del Local / Sucursal */}
                    <div className="space-y-2 z-10">
                        <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{sucursalActual?.empresa || "FarmaSalud S.A.C."}</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                            <Pill className="text-teal-400 w-8 h-8" />
                            {sucursalActual?.nombre || "Sucursal Centro Principal"}
                        </h1>

                        <p className="text-xs text-slate-400 font-medium">
                            Sistema de Punto de Venta e Inventario Farmacéutico
                        </p>
                    </div>

                    {/* Reloj y Fecha en Vivo */}
                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-right z-10 shrink-0 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                            <Clock className="w-4 h-4 animate-pulse" />
                            <span>Tiempo Real</span>
                        </div>

                        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
                            {horaFormateada}
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium capitalize flex items-center gap-1 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {fechaFormateada}
                        </div>
                    </div>

                </div>

                {/* Tarjeta de Bienvenida Personalizada al Usuario */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-black text-xl flex items-center justify-center shrink-0 border border-teal-100 shadow-inner">
                            {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                                    <SaludoIcon className="w-3.5 h-3.5" /> {saludo}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">
                                {user?.nombre || "Usuario POS"}
                            </h2>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                                <span>Rol: <strong className="text-slate-700">{rolUsuario}</strong></span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl font-medium w-full sm:w-auto">
                        <span className="font-bold text-slate-700 block mb-0.5">Estado de la Sesión:</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Activa (JWT)
                        </span>
                    </div>
                </div>

            </div>

            {/* ═══════════════════════════════════════════════════════
          TABLERO DE NAVEGACIÓN RÁPIDA (QUICK ACCESS)
      ═══════════════════════════════════════════════════════ */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        Tablero de Navegación Rápida
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                        {accesosPermitidos.length} módulo(s) disponible(s)
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {accesosPermitidos.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
                            >
                                <div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} mb-4 shadow-md transition-transform group-hover:scale-110`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition-colors">
                                        {item.titulo}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                                        {item.descripcion}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-700">
                                    <span>Ingresar al módulo</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
          FOOTER: MENSAJE DE DESPEDIDA Y CERRAR SESIÓN
      ═══════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 text-center sm:text-left">
                    <p className="font-bold text-slate-700">¿Terminaste tu turno?</p>
                    <p className="text-[11px]">Recuerda cerrar sesión para proteger tu caja y tus registros de venta.</p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (confirm("¿Seguro que deseas salir del sistema? Hasta pronto.")) {
                            logout();
                        }
                    }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-200 transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>

        </div>
    );
}