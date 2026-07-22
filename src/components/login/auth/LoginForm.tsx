// src/components/login/auth/LoginForm.tsx
import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";

interface LoginFormProps {
    correo: string;
    password: string;
    rememberMe: boolean;
    loading: boolean;
    error?: string | null;
    setCorreo: (val: string) => void;
    setPassword: (val: string) => void;
    setRememberMe: (val: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
    correo,
    password,
    rememberMe,
    loading,
    error,
    setCorreo,
    setPassword,
    setRememberMe,
    onSubmit,
}: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (rememberMe) {
            setCorreo(localStorage.getItem("remembered_email") || "");
        }
    }, [rememberMe]);

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 transition-all">

            {/* Header del Formulario */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mb-3 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    ¡Bienvenido de nuevo!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    Ingresa tus credenciales para acceder a <span className="font-bold text-teal-700">FarmaPOS</span>
                </p>
            </div>

            {/* Banner de Error (Reemplazo de Alert) */}
            {error && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span className="flex-1">{error}</span>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">

                {/* Input: Correo Electrónico */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="email"
                            required
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="ejemplo@farmasalud.com"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Input: Contraseña */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contraseña
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Opciones: Remember Me */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={rememberMe}

                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 transition cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800">
                            Recordar mi usuario
                        </span>
                    </label>
                </div>

                {/* Botón Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Iniciando sesión...</span>
                        </>
                    ) : (
                        <>
                            <LogIn className="w-4 h-4" />
                            <span>INGRESAR AL POS</span>
                        </>
                    )}
                </button>

            </form>

            {/* Footer del Card */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                    Sistema Farmacéutico POS v1.0.0 — NestJS + React
                </p>
            </div>

        </div>
    );
}