// src/pages/auth/Login.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoginForm from "../../components/login/auth/LoginForm";
import { Pill, Activity, ShieldCheck, Hospital } from "lucide-react";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Estados
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Redirección si ya está autenticado y carga de usuario recordado
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
            return;
        }

        const savedEmail = localStorage.getItem("remembered_email");
        if (savedEmail) {
            setCorreo(savedEmail);
            setRememberMe(true);
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            await login({
                correo,
                password,
            });

            // Manejo de preferencia "Recordarme"
            if (rememberMe) {
                localStorage.setItem("remembered_email", correo);
            } else {
                localStorage.removeItem("remembered_email");
            }

            navigate("/ventas/nueva");
        } catch (error: any) {
            console.error(error);
            setErrorMessage(
                error.message || "Credenciales inválidas. Verifica tu correo y contraseña."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">

            {/* Contenedor Principal Responsive */}
            <div className="w-full max-w-5xl bg-slate-950 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800/80">

                {/* PANEL IZQUIERDO: Formulario (Mobile First) */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">

                    {/* Logo en Mobile */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden justify-center">
                        <div className="p-2 bg-teal-600 text-white rounded-xl">
                            <Pill className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                            Farma<span className="text-teal-600">POS</span>
                        </h1>
                    </div>

                    <LoginForm
                        correo={correo}
                        password={password}
                        rememberMe={rememberMe}
                        loading={loading}
                        error={errorMessage}
                        setCorreo={setCorreo}
                        setPassword={setPassword}
                        setRememberMe={setRememberMe}
                        onSubmit={handleSubmit}
                    />
                </div>

                {/* PANEL DERECHO: Brand / Hero (Visible solo en Desktop lg:) */}
                <div className="hidden lg:col-span-5 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-10 lg:flex flex-col justify-between relative overflow-hidden text-white border-l border-slate-800">

                    {/* Fondo estético sutil */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Logo Header Desktop */}
                    <div className="flex items-center gap-2.5 z-10">
                        <div className="p-2.5 bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-2xl backdrop-blur-sm">
                            <Hospital className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white">
                            Marisol<span className="text-teal-400">botica</span>
                        </h1>
                    </div>

                    {/* Mensaje de Valor */}
                    <div className="my-auto z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-300 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-bold">
                            <Activity className="w-3.5 h-3.5" />
                            <span>Sistema botica</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight text-slate-100">
                            Ventas rápidas, control de inventario
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Diseñado para operar con alta velocidad de atención al cliente, lectura de barra de códigos e integración directa con tu catálogo NestJS.
                        </p>
                    </div>

                    {/* Footer del Panel Hero */}
                    <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between z-10">
                        <span>&copy; {new Date().getFullYear()} SAMCODE S.A.C</span>
                        <span className="flex items-center gap-1 text-teal-400 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" /> Sistema Seguro
                        </span>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;