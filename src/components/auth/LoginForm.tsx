// src/components/auth/LoginForm.tsx

import React from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";

import {
    Mail,
    Lock,
    ShieldPlus,
    LogIn,
} from "lucide-react";

interface LoginFormProps {
    correo: string;
    password: string;
    rememberMe: boolean;
    loading: boolean;

    setCorreo: (value: string) => void;
    setPassword: (value: string) => void;
    setRememberMe: (value: boolean) => void;

    onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
    correo,
    password,
    rememberMe,
    loading,
    setCorreo,
    setPassword,
    setRememberMe,
    onSubmit,
}) => {
    return (
        <div
            className="
            w-full
            max-w-md
            rounded-3xl
            border
            border-white/10
            bg-white/10
            backdrop-blur-2xl
            p-10
            shadow-[0_20px_80px_rgba(0,0,0,.35)]
            "
        >
            {/* Logo */}

            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">

                <ShieldPlus className="h-10 w-10 text-white" />

            </div>

            {/* Títulos */}

            <div className="text-center">

                <h2 className="text-3xl font-black text-white">

                    Bienvenido

                </h2>

                <p className="mt-2 text-slate-300">

                    Inicia sesión para continuar.

                </p>

            </div>

            {/* Form */}

            <form
                onSubmit={onSubmit}
                className="mt-10 space-y-6"
            >

                {/* Correo */}

                <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">

                        Correo electrónico

                    </label>

                    <div className="relative">

                        <Mail
                            className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            z-10
                            "
                            size={18}
                        />

                        <InputText
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="usuario@empresa.com"
                            className="
                            w-full
                            h-14
                            rounded-xl
                            border
                            border-white/10
                            bg-white/5
                            pl-12
                            pr-4
                            text-white
                            placeholder:text-slate-400
                            transition-all
                            duration-300
                            focus:border-cyan-400
                            focus:ring-2
                            focus:ring-cyan-400/20
                            "
                        />

                    </div>

                </div>

                {/* Password */}

                <div>

                    <label className="mb-2 block text-sm font-medium text-slate-300">

                        Contraseña

                    </label>

                    <div className="relative">

                        <Lock
                            className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-slate-400
                            z-10
                            "
                            size={18}
                        />

                        <Password
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            feedback={false}
                            toggleMask
                            placeholder="••••••••"
                            className="w-full"
                            inputClassName="
                                w-full
                                h-14
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                pl-12
                                pr-12
                                text-white
                                placeholder:text-slate-400
                                transition-all
                                duration-300
                                focus:border-cyan-400
                                focus:ring-2
                                focus:ring-cyan-400/20
                            "
                        />

                    </div>

                </div>

                {/* Opciones */}

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <Checkbox
                            checked={rememberMe}
                            onChange={(e) =>
                                setRememberMe(e.checked ?? false)
                            }
                        />

                        <span className="text-sm text-slate-300">

                            Recordarme

                        </span>

                    </div>

                    <button
                        type="button"
                        className="
                        text-sm
                        text-cyan-400
                        hover:text-cyan-300
                        transition
                        "
                    >
                        ¿Olvidaste tu contraseña?
                    </button>

                </div>

                {/* Botón */}

                <Button
                    type="submit"
                    disabled={loading}
                    className="
                    w-full
                    h-14
                    rounded-xl
                    border-0
                    bg-gradient-to-r
                    from-cyan-500
                    to-blue-600
                    font-semibold
                    tracking-wide
                    transition-all
                    duration-300
                    hover:scale-[1.02]
                    hover:shadow-xl
                    hover:shadow-cyan-500/30
                    active:scale-95
                    flex
                    items-center
                    justify-center
                    gap-3
                    "
                >
                    <LogIn size={18} />

                    {loading
                        ? "Ingresando..."
                        : "Iniciar sesión"}

                </Button>

            </form>

            {/* Footer */}

            <div className="mt-8 border-t border-white/10 pt-6 text-center">

                <p className="text-sm text-slate-400">

                    © 2026 FarmaPOS

                </p>

            </div>
        </div>
    );
};

export default LoginForm;