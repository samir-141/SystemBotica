import type { PrintErrorCode, QzAvailability } from "../types/printer.types";

export function classifyQzError(error: unknown): QzAvailability {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("econnrefused") || lower.includes("connection refused")) {
    return {
      available: false,
      reason: "QZ_NOT_RUNNING",
      technicalDetail: message,
    };
  }

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return {
      available: false,
      reason: "QZ_CONNECTION_TIMEOUT",
      technicalDetail: message,
    };
  }

  if (lower.includes("certificate") || lower.includes("ssl") || lower.includes("tls")) {
    return {
      available: false,
      reason: "QZ_CERTIFICATE_ERROR",
      technicalDetail: message,
    };
  }

  if (lower.includes("websocket") || lower.includes("ws")) {
    return {
      available: false,
      reason: "QZ_NOT_RUNNING",
      technicalDetail: message,
    };
  }

  return {
    available: false,
    reason: "QZ_NOT_RUNNING",
    technicalDetail: message,
  };
}

export function getErrorMessage(code: PrintErrorCode): string {
  const messages: Record<PrintErrorCode, string> = {
    QZ_NOT_RUNNING:
      "No se pudo conectar con el servicio de impresión.\nVerifique que QZ Tray esté instalado y abierto.",
    QZ_CONNECTION_TIMEOUT:
      "La conexión con QZ Tray tardó demasiado.\nVerifique que QZ Tray esté respondiendo.",
    QZ_CERTIFICATE_ERROR:
      "Error de certificado con QZ Tray.\nVerifique la configuración de seguridad.",
    PRINTER_NOT_CONFIGURED:
      "No hay una impresora configurada para este dispositivo.",
    PRINTER_NOT_FOUND:
      "La impresora configurada ya no está disponible.\nSeleccione nuevamente una impresora.",
    PRINTER_OFFLINE:
      "La impresora está desconectada o apagada.",
    INVALID_RECEIPT:
      "Los datos del comprobante son inválidos.",
    INVALID_CONFIGURATION:
      "La configuración de impresión es inválida.",
    ENCODING_ERROR:
      "Error de codificación de caracteres.",
    PRINT_REJECTED:
      "La impresora rechazó el trabajo de impresión.",
    PRINT_UNKNOWN_ERROR:
      "Ocurrió un error desconocido durante la impresión.",
  };
  return messages[code] || "Error desconocido.";
}

export function formatPrintError(code: PrintErrorCode, detail?: string): string {
  const base = getErrorMessage(code);
  if (detail) {
    return `${base}\n\nDetalle técnico: ${detail}`;
  }
  return base;
}
