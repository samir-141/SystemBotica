export type PaperWidth = "58mm" | "80mm";

export type PrinterConnectionStatus =
  | "NOT_CHECKED"
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR";

export type PrintJobStatus = "IDLE" | "PRINTING" | "SUCCESS" | "ERROR";

export interface PrinterConfiguration {
  printerName: string;
  paperWidth: PaperWidth;
  charactersPerLine: number;
  autoCut: boolean;
  openCashDrawer: boolean;
  encoding: string;
  enabled: boolean;
  deviceId: string;
}

export interface PrinterConfigurationKey {
  empresaId: string;
  sucursalId: string;
  cajaId: string;
  deviceId: string;
}

export type EncodingOption =
  | "CP437"
  | "CP850"
  | "CP858"
  | "Windows-1252"
  | "UTF-8";

export const ENCODING_OPTIONS: EncodingOption[] = [
  "CP437",
  "CP850",
  "CP858",
  "Windows-1252",
  "UTF-8",
];

export const DEFAULT_PRINTER_CONFIG: Omit<PrinterConfiguration, "deviceId"> = {
  printerName: "",
  paperWidth: "80mm",
  charactersPerLine: 42,
  autoCut: true,
  openCashDrawer: false,
  encoding: "CP850",
  enabled: false,
};

export type PrintErrorCode =
  | "QZ_NOT_RUNNING"
  | "QZ_CONNECTION_TIMEOUT"
  | "QZ_CERTIFICATE_ERROR"
  | "PRINTER_NOT_CONFIGURED"
  | "PRINTER_NOT_FOUND"
  | "PRINTER_OFFLINE"
  | "INVALID_RECEIPT"
  | "INVALID_CONFIGURATION"
  | "ENCODING_ERROR"
  | "PRINT_REJECTED"
  | "PRINT_UNKNOWN_ERROR";

export interface PrintResult {
  success: boolean;
  code: "PRINTED" | PrintErrorCode;
  message: string;
  technicalMessage?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface QzAvailability {
  available: boolean;
  reason: PrintErrorCode | null;
  technicalDetail?: string;
}
