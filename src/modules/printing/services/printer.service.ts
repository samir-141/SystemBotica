import type { ReceiptData } from "../types/receipt.types";
import type { PrinterConfiguration, PrintResult, ValidationResult } from "../types/printer.types";
import { qzService } from "./qz.service";
import { loadPrinterConfiguration, validatePrinterConfiguration } from "./printer-config.service";
import { buildReceiptCommands, buildTestPageCommands, buildCashDrawerCommand } from "./receipt-builder.service";

let printQueue: Promise<void> = Promise.resolve();

function enqueuePrint(task: () => Promise<void>): Promise<void> {
  printQueue = printQueue.then(task, task);
  return printQueue;
}

async function ensureConnected(): Promise<void> {
  if (!qzService.isConnected()) {
    await qzService.connect();
  }
}

async function verifyPrinter(printerName: string): Promise<void> {
  const printers = await qzService.getPrinters();
  const found = printers.find((p) => p.toLowerCase() === printerName.toLowerCase());
  if (!found) {
    throw new Error(`PRINTER_NOT_FOUND: Impresora "${printerName}" no encontrada.`);
  }
}

export const printerService = {
  async printReceipt(receipt: ReceiptData): Promise<PrintResult> {
    return enqueuePrint(async () => {
      try {
        const config = loadPrinterConfiguration();
        const validation = validatePrinterConfiguration(config);
        if (!validation.valid) {
          return {
            success: false,
            code: "PRINTER_NOT_CONFIGURED",
            message: validation.errors.join(" "),
          };
        }

        await ensureConnected();
        await verifyPrinter(config!.printerName);

        const commands = buildReceiptCommands(receipt, config!);
        await qzService.printRaw(config!.printerName, commands);

        return {
          success: true,
          code: "PRINTED",
          message: "Ticket impreso correctamente.",
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("PRINTER_NOT_FOUND")) {
          return {
            success: false,
            code: "PRINTER_NOT_FOUND",
            message: "La impresora configurada ya no está disponible.",
            technicalMessage: msg,
          };
        }
        if (msg.includes("ECONNREFUSED") || msg.includes("WebSocket")) {
          return {
            success: false,
            code: "QZ_NOT_RUNNING",
            message: "No se pudo conectar con QZ Tray.",
            technicalMessage: msg,
          };
        }
        return {
          success: false,
          code: "PRINT_UNKNOWN_ERROR",
          message: "Error durante la impresión.",
          technicalMessage: msg,
        };
      }
    });
  },

  async printTestPage(): Promise<PrintResult> {
    return enqueuePrint(async () => {
      try {
        const config = loadPrinterConfiguration();
        const validation = validatePrinterConfiguration(config);
        if (!validation.valid) {
          return {
            success: false,
            code: "PRINTER_NOT_CONFIGURED",
            message: validation.errors.join(" "),
          };
        }

        await ensureConnected();
        await verifyPrinter(config!.printerName);

        const commands = buildTestPageCommands(config!);
        await qzService.printRaw(config!.printerName, commands);

        return {
          success: true,
          code: "PRINTED",
          message: "Página de prueba impresa.",
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          code: "PRINT_UNKNOWN_ERROR",
          message: "Error al imprimir prueba.",
          technicalMessage: msg,
        };
      }
    });
  },

  async printCashDrawerPulse(): Promise<PrintResult> {
    return enqueuePrint(async () => {
      try {
        const config = loadPrinterConfiguration();
        const validation = validatePrinterConfiguration(config);
        if (!validation.valid) {
          return {
            success: false,
            code: "PRINTER_NOT_CONFIGURED",
            message: validation.errors.join(" "),
          };
        }

        await ensureConnected();
        const commands = buildCashDrawerCommand();
        await qzService.printRaw(config!.printerName, commands);

        return {
          success: true,
          code: "PRINTED",
          message: "Cajón abierto.",
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          success: false,
          code: "PRINT_UNKNOWN_ERROR",
          message: "Error al abrir cajón.",
          technicalMessage: msg,
        };
      }
    });
  },

  async getAvailablePrinters(): Promise<string[]> {
    await ensureConnected();
    return qzService.getPrinters();
  },

  async validateConfiguration(): Promise<ValidationResult> {
    const config = loadPrinterConfiguration();
    return validatePrinterConfiguration(config);
  },
};
