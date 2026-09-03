import { useEffect } from "react";
import { X, Camera, AlertCircle, RefreshCw } from "lucide-react";
import { useCameraBarcodeScanner } from "../../hooks/useCameraBarcodeScanner";

export interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  subtitle?: string;
  continuous?: boolean;
  cooldownMs?: number;
}

export function CameraScannerModal({
  isOpen,
  onClose,
  onScan,
  title = "Escanear Código de Barras",
  subtitle = "Enfoca el código de barras o QR con la cámara",
  continuous = false,
  cooldownMs = 1000,
}: CameraScannerModalProps) {
  const { videoRef, isScanning, error, startScanning, lastScannedCode } =
    useCameraBarcodeScanner({
      enabled: isOpen,
      continuous,
      cooldownMs,
      onScan: (code) => {
        onScan(code);
        if (!continuous) {
          onClose();
        }
      },
    });

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-white">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Visor de Video */}
        <div className="relative aspect-[4/3] sm:aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />

          {/* Guías de escaneo visuales sobre el video */}
          {!error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="relative w-64 h-40 border-2 border-teal-400/70 rounded-2xl shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center justify-center">
                {/* Esquinas destacadas */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                {/* Línea láser de escaneo animada */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse shadow-[0_0_8px_#2dd4bf]" />
              </div>
            </div>
          )}

          {/* Estado de error de cámara */}
          {error && (
            <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
                <AlertCircle size={28} />
              </div>
              <p className="text-xs text-slate-200 font-medium max-w-xs">{error}</p>
              <button
                type="button"
                onClick={startScanning}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Reintentar</span>
              </button>
            </div>
          )}

          {/* Badge de último código escaneado (en modo continuo) */}
          {continuous && lastScannedCode && (
            <div className="absolute bottom-3 inset-x-4 bg-slate-950/80 backdrop-blur border border-teal-500/40 text-teal-300 px-3 py-1.5 rounded-xl text-xs font-mono text-center font-bold">
              ✓ Detectado: {lastScannedCode}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isScanning ? "bg-emerald-400 animate-ping" : "bg-slate-500"
              }`}
            />
            <span>{isScanning ? "Cámara activa" : "Cámara en espera"}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraScannerModal;
