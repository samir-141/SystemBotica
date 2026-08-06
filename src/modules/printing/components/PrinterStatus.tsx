import { useState, useEffect, useCallback } from "react";
import { CircleCheck, CircleAlert, Circle, RefreshCw, Loader2, X, Settings } from "lucide-react";
import type { PrinterConnectionStatus, QzAvailability } from "../types/printer.types";
import { qzService } from "../services/qz.service";
import { classifyQzError, getErrorMessage } from "../utils/printer-errors.utils";

interface PrinterStatusProps {
  onStatusChange?: (status: PrinterConnectionStatus) => void;
}

export function PrinterStatus({ onStatusChange }: PrinterStatusProps) {
  const [status, setStatus] = useState<PrinterConnectionStatus>("NOT_CHECKED");
  const [availability, setAvailability] = useState<QzAvailability | null>(null);
  const [checking, setChecking] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    setStatus("CONNECTING");
    try {
      await qzService.connect();
      setStatus("CONNECTED");
      setAvailability({ available: true, reason: null });
    } catch (error) {
      setStatus("DISCONNECTED");
      setAvailability(classifyQzError(error));
    } finally {
      setChecking(false);
      onStatusChange?.(status);
    }
  }, [onStatusChange, status]);

  useEffect(() => {
    void checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusConfig: Record<
    PrinterConnectionStatus,
    { icon: React.ReactNode; label: string; color: string }
  > = {
    NOT_CHECKED: {
      icon: <Circle className="w-4 h-4 text-gray-400" />,
      label: "No verificado",
      color: "text-gray-600",
    },
    CONNECTING: {
      icon: <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />,
      label: "Conectando",
      color: "text-yellow-600",
    },
    CONNECTED: {
      icon: <CircleCheck className="w-4 h-4 text-green-500" />,
      label: "Conectado",
      color: "text-green-600",
    },
    DISCONNECTED: {
      icon: <CircleAlert className="w-4 h-4 text-red-500" />,
      label: "Desconectado",
      color: "text-red-600",
    },
    ERROR: {
      icon: <CircleAlert className="w-4 h-4 text-red-500" />,
      label: "Error",
      color: "text-red-600",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {config.icon}
        <span className={`text-sm font-medium ${config.color}`}>
          Servicio de impresión: {config.label}
        </span>
        <button
          type="button"
          onClick={() => void checkStatus()}
          disabled={checking}
          className="ml-auto p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          title="Verificar conexión"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
        </button>
      </div>

      {status === "DISCONNECTED" && availability && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <p className="whitespace-pre-line">{getErrorMessage(availability.reason || "QZ_NOT_RUNNING")}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => void checkStatus()}
              disabled={checking}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
            >
              Reintentar
            </button>
            <button
              type="button"
              className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 cursor-pointer"
              onClick={() => setShowInstructionsModal(true)}
            >
              Ver instrucciones
            </button>
          </div>
        </div>
      )}

      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-emerald-950 text-white">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-300" />
                Guía de Conexión QZ Tray
              </h3>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-xs">
              <div className="flex gap-3 bg-amber-50 border border-amber-200 p-3.5 rounded-xl">
                <CircleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-xs">El servicio de impresión está desconectado</h4>
                  <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                    Marifarma POS requiere el software local <strong>QZ Tray</strong> para realizar impresiones directas y silenciosas a tu ticketera térmica.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Pasos para conectar:</h4>
                
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div>
                    <h5 className="font-semibold text-slate-800 text-xs">Descargar QZ Tray</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Descarga e instala la última versión recomendada para Windows directamente desde la página oficial.
                    </p>
                    <a
                      href="https://qz.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold mt-1.5 underline"
                    >
                      Descargar QZ Tray desde qz.io ↗
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div>
                    <h5 className="font-semibold text-slate-800 text-xs">Ejecutar el programa</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Abre QZ Tray. Deberías ver un icono verde con forma de impresora en la bandeja de tareas (junto al reloj de Windows).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div>
                    <h5 className="font-semibold text-slate-800 text-xs">Reintentar Conexión</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Haz clic en el botón <strong>"Reintentar"</strong> en el panel de impresión de Marifarma. El navegador te solicitará permitir la conexión, marca la casilla "Recordar decisión" y haz clic en "Permitir".
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs mb-2">¿Sigues teniendo problemas?</h4>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                  <li>Asegúrate de que la ticketera esté encendida y conectada a la computadora.</li>
                  <li>Prueba reiniciando QZ Tray (clic derecho sobre el icono $\rightarrow$ Exit y ábrelo de nuevo).</li>
                  <li>Verifica si el antivirus o firewall de Windows está bloqueando la conexión.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
