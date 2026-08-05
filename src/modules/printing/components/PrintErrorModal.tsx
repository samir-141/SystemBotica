import { AlertTriangle, X, RefreshCw, Settings } from "lucide-react";
import type { PrintResult } from "../types/printer.types";

interface PrintErrorModalProps {
  result: PrintResult | null;
  onClose: () => void;
  onRetry?: () => void;
  onConfigure?: () => void;
}

export function PrintErrorModal({ result, onClose, onRetry, onConfigure }: PrintErrorModalProps) {
  if (!result || result.success) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Error de impresión</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-700 whitespace-pre-line mb-4">{result.message}</p>

        {result.technicalMessage && (
          <details className="mb-4">
            <summary className="text-sm text-gray-500 cursor-pointer">Detalle técnico</summary>
            <pre className="mt-1 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-auto">
              {result.technicalMessage}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-end">
          {onConfigure && (
            <button
              type="button"
              onClick={onConfigure}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              Configurar impresora
            </button>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
