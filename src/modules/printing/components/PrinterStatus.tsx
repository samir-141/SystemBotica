import { useState, useEffect, useCallback } from "react";
import { CircleCheck, CircleAlert, Circle, RefreshCw, Loader2 } from "lucide-react";
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
            <a
              href="#"
              className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Ver instrucciones
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
