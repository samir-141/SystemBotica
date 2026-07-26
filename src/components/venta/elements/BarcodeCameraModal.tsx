// src/components/venta/elements/BarcodeCameraModal.tsx
// Modal fullscreen para escanear códigos de barras con la cámara del dispositivo

import { useEffect } from "react";
import { X, Camera, ScanLine, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import type { UseCamaraScannerReturn } from "../hooks/useCamaraScanner";

interface Props {
    scanner: UseCamaraScannerReturn;
    onClose: () => void;
}

export default function BarcodeCameraModal({ scanner, onClose }: Props) {
    const { camaraAbierta, videoRef, ultimoCodigo, error, iniciando, cerrarCamara } = scanner;

    // Cerrar con Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClose = () => {
        cerrarCamara();
        onClose();
    };

    if (!camaraAbierta) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col bg-black"
            role="dialog"
            aria-label="Escáner de código de barras por cámara"
            aria-modal="true"
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm shrink-0 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-teal-500/20 rounded-lg border border-teal-500/30">
                        <Camera size={18} className="text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-white text-sm font-bold leading-tight">Escanear Código</h2>
                        <p className="text-slate-400 text-[11px]">Apunta la cámara al código de barras</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Cerrar escáner"
                >
                    <X size={22} />
                </button>
            </div>

            {/* ── Área de Cámara ─────────────────────────────────────────── */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">

                {/* Video stream */}
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                    aria-label="Vista de cámara para escaneo"
                />

                {/* Estado: Iniciando */}
                {iniciando && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                        <Loader2 size={40} className="text-teal-400 animate-spin" />
                        <p className="text-white text-sm font-semibold">Iniciando cámara...</p>
                        <p className="text-slate-400 text-xs">Si se solicita permiso, acéptalo</p>
                    </div>
                )}

                {/* Estado: Error */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 px-6 text-center">
                        <div className="p-4 bg-rose-500/20 rounded-full border border-rose-500/30">
                            <AlertTriangle size={36} className="text-rose-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base mb-1">Error de Cámara</p>
                            <p className="text-slate-300 text-sm leading-relaxed">{error}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {/* Estado: Código detectado (feedback) */}
                {ultimoCodigo && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                        <div className="p-5 bg-teal-500/20 rounded-full border-2 border-teal-400 animate-ping-once">
                            <CheckCircle2 size={48} className="text-teal-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-base">¡Código detectado!</p>
                            <p className="text-teal-300 font-mono text-sm mt-1">{ultimoCodigo}</p>
                        </div>
                    </div>
                )}

                {/* ── Visor de Escaneo (línea animada) ── */}
                {!iniciando && !error && !ultimoCodigo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Fondo oscuro con ventana central */}
                        <div className="absolute inset-0 bg-black/50" />

                        {/* Ventana de escaneo */}
                        <div className="relative w-72 h-44 sm:w-80 sm:h-52">
                            {/* Fondo transparente (se ve el video) */}
                            <div className="absolute inset-0 bg-transparent border-0" />

                            {/* Esquinas del visor */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-teal-400 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-teal-400 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-teal-400 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-teal-400 rounded-br-lg" />

                            {/* Línea de escaneo animada */}
                            <div className="absolute left-2 right-2 h-0.5 bg-teal-400/90 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-scan-line" />
                        </div>

                        {/* Texto de guía */}
                        <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
                                <ScanLine size={16} className="text-teal-400" />
                                <p className="text-white text-xs font-semibold">
                                    Centra el código dentro del visor
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <div className="shrink-0 px-4 py-3 bg-black/80 border-t border-white/10 flex items-center justify-between">
                <p className="text-slate-400 text-[11px]">
                    Soporta: EAN-13, Code128, QR, Code39, UPC-A
                </p>
                <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                    Cancelar
                </button>
            </div>

            {/* Estilos de la animación scan-line (inyectados en el DOM via style tag) */}
            <style>{`
                @keyframes scan-line {
                    0%   { top: 8px; opacity: 1; }
                    50%  { opacity: 0.7; }
                    100% { top: calc(100% - 8px); opacity: 1; }
                }
                .animate-scan-line {
                    animation: scan-line 1.8s ease-in-out infinite alternate;
                    position: absolute;
                }
                @keyframes ping-once {
                    0%   { transform: scale(0.8); opacity: 0; }
                    50%  { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1);   opacity: 1; }
                }
                .animate-ping-once {
                    animation: ping-once 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
