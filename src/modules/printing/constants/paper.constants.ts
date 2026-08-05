import type { PaperWidth } from "../types/printer.types";

export const PAPER_CONFIG = {
  "58mm": {
    previewWidthMm: 58,
    contentWidthMm: 52,
    defaultCharactersPerLine: 32,
    label: "58 mm",
  },
  "80mm": {
    previewWidthMm: 80,
    contentWidthMm: 72,
    defaultCharactersPerLine: 42,
    label: "80 mm",
  },
} as const;

export const PRINTER_SUGGESTION_KEYWORDS = [
  "POS",
  "EPSON",
  "THERMAL",
  "TICKET",
  "58",
  "80",
  "TM-",
  "XP-",
  "BIXOLON",
  "STAR",
  "CITIZEN",
  "ZEBRA",
] as const;

export function suggestPrinter(printerName: string): boolean {
  const upper = printerName.toUpperCase();
  return PRINTER_SUGGESTION_KEYWORDS.some((kw) => upper.includes(kw));
}

export const CONFIG_STORAGE_KEY = "pos_printer_configuration";
export const DEVICE_ID_KEY = "pos_device_id";

export function getConfigKey(
  empresaId: string,
  sucursalId: string,
  cajaId: string,
  deviceId: string,
): string {
  return `${empresaId}:${sucursalId}:${cajaId}:${deviceId}`;
}
