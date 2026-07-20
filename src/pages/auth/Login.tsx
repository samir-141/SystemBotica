// src/pages/auth/Login.tsx

import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

import BackgroundEffects from "../../components/auth/BackgroundEffects";
import LoginForm from "../../components/auth/LoginForm";

const Login = () => {
    const navigate = useNavigate();

    const toast = useRef<Toast>(null);

    const { login } = useAuth();

    const [correo, setCorreo] = useState("");

    const [password, setPassword] = useState("");

    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const token = localStorage.getItem("token");

        if (token) {

            navigate("/dashboard");

        }

    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setLoading(true);

        try {

            await login({

                correo,

                password,

            });

        } catch (error: any) {

            toast.current?.show({

                severity: "error",

                summary: "Error",

                detail:
                    error.message ??
                    "Correo o contraseña incorrectos.",

                life: 3500,

            });

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="relative min-h-screen overflow-hidden">

            {/* Toast */}

            <Toast ref={toast} />

            {/* Fondo */}

            <BackgroundEffects />

            {/* Layout */}

            <div
                className="
                relative
                z-10
                flex
                min-h-screen
                items-center
                justify-center
                px-6
                lg:px-16
                "
            >



                {/* Login */}

                <div
                    className="
                    flex
                    w-full
                    lg:w-1/2
                    justify-center
                    "
                >

                    <LoginForm

                        correo={correo}

                        password={password}

                        rememberMe={rememberMe}

                        loading={loading}

                        setCorreo={setCorreo}

                        setPassword={setPassword}

                        setRememberMe={setRememberMe}

                        onSubmit={handleSubmit}

                    />

                </div>

            </div>

        </div>

    );

};

export default Login;