import type {
  PrinterConfiguration,
  PaperWidth,
} from "../types/printer.types";
import {
  DEFAULT_PRINTER_CONFIG,
} from "../types/printer.types";
import {
  CONFIG_STORAGE_KEY,
  DEVICE_ID_KEY,
} from "../constants/paper.constants";
import { PAPER_CONFIG } from "../constants/paper.constants";

export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const newId = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, newId);
  return newId;
}

export function loadPrinterConfiguration(): PrinterConfiguration | null {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PrinterConfiguration;
    return parsed;
  } catch {
    return null;
  }
}

export function savePrinterConfiguration(config: PrinterConfiguration): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function clearPrinterConfiguration(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}

export function createDefaultConfiguration(
  deviceId: string,
): PrinterConfiguration {
  return {
    ...DEFAULT_PRINTER_CONFIG,
    deviceId,
  };
}

export function validatePrinterConfiguration(
  config: PrinterConfiguration | null,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config) {
    errors.push("No hay configuración de impresora.");
    return { valid: false, errors };
  }
  if (!config.printerName) {
    errors.push("Debe seleccionar una impresora.");
  }
  if (!config.paperWidth) {
    errors.push("Debe seleccionar un ancho de papel.");
  }
  if (config.charactersPerLine <= 0) {
    errors.push("Los caracteres por línea deben ser mayores a 0.");
  }
  return { valid: errors.length === 0, errors };
}

export function getDefaultCharactersPerLine(paperWidth: PaperWidth): number {
  return PAPER_CONFIG[paperWidth].defaultCharactersPerLine;
}
