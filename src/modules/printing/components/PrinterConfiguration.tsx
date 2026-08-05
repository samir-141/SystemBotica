import { useState, useEffect, useCallback } from "react";
import { Settings, RefreshCw, TestTube, Save, RotateCcw } from "lucide-react";
import type { PrinterConfiguration as PrinterConfig, PaperWidth } from "../types/printer.types";
import { ENCODING_OPTIONS } from "../types/printer.types";
import { PAPER_CONFIG } from "../constants/paper.constants";
import {
  getOrCreateDeviceId,
  loadPrinterConfiguration,
  savePrinterConfiguration,
  clearPrinterConfiguration,
  createDefaultConfiguration,
} from "../services/printer-config.service";
import { printerService } from "../services/printer.service";
import { PrinterStatus } from "./PrinterStatus";

export function PrinterConfigurationPage() {
  const [config, setConfig] = useState<PrinterConfig | null>(null);
  const [printers, setPrinters] = useState<string[]>([]);
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const deviceId = getOrCreateDeviceId();
    const existing = loadPrinterConfiguration();
    setConfig(existing || createDefaultConfiguration(deviceId));
  }, []);

  const fetchPrinters = useCallback(async () => {
    setLoadingPrinters(true);
    setMessage(null);
    try {
      const list = await printerService.getAvailablePrinters();
      setPrinters(list);
      setMessage({ type: "success", text: `${list.length} impresora(s) encontrada(s).` });
    } catch {
      setMessage({ type: "error", text: "No se pudieron obtener las impresoras. Verifique que QZ Tray esté activo." });
    } finally {
      setLoadingPrinters(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      savePrinterConfiguration(config);
      setMessage({ type: "success", text: "Configuración guardada correctamente." });
    } catch {
      setMessage({ type: "error", text: "Error al guardar la configuración." });
    } finally {
      setSaving(false);
    }
  }, [config]);

  const handleTestPrint = useCallback(async () => {
    setTesting(true);
    setMessage(null);
    const result = await printerService.printTestPage();
    setTesting(false);
    if (result.success) {
      setMessage({ type: "success", text: result.message });
    } else {
      setMessage({ type: "error", text: result.message });
    }
  }, []);

  const handleReset = useCallback(() => {
    clearPrinterConfiguration();
    const deviceId = getOrCreateDeviceId();
    setConfig(createDefaultConfiguration(deviceId));
    setMessage({ type: "success", text: "Configuración restablecida." });
  }, []);

  if (!config) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Configuración de Impresión</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <PrinterStatus />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Impresora</label>
          <div className="flex gap-2">
            <select
              value={config.printerName}
              onChange={(e) => setConfig({ ...config, printerName: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Seleccionar impresora...</option>
              {printers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void fetchPrinters()}
              disabled={loadingPrinters}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPrinters ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ancho de papel</label>
          <select
            value={config.paperWidth}
            onChange={(e) => {
              const pw = e.target.value as PaperWidth;
              setConfig({
                ...config,
                paperWidth: pw,
                charactersPerLine: PAPER_CONFIG[pw].defaultCharactersPerLine,
              });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="58mm">58 mm</option>
            <option value="80mm">80 mm</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Caracteres por línea</label>
          <input
            type="number"
            value={config.charactersPerLine}
            onChange={(e) => setConfig({ ...config, charactersPerLine: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Codificación</label>
          <select
            value={config.encoding}
            onChange={(e) => setConfig({ ...config, encoding: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            {ENCODING_OPTIONS.map((enc) => (
              <option key={enc} value={enc}>{enc}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.autoCut}
              onChange={(e) => setConfig({ ...config, autoCut: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Corte automático</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.openCashDrawer}
              onChange={(e) => setConfig({ ...config, openCashDrawer: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Abrir cajón después de cobrar</span>
          </label>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void handleTestPrint()}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <TestTube className="w-4 h-4" />
            {testing ? "Imprimiendo..." : "Imprimir prueba"}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer
          </button>
        </div>
      </div>
    </div>
  );
}
