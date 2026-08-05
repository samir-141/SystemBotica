export { PrinterStatus } from "./components/PrinterStatus";
export { PrinterConfigurationPage } from "./components/PrinterConfiguration";
export { ReceiptPreview } from "./components/ReceiptPreview";
export { PrintErrorModal } from "./components/PrintErrorModal";

export { printerService } from "./services/printer.service";
export { qzService } from "./services/qz.service";
export { buildReceiptCommands, buildTestPageCommands, buildCashDrawerCommand } from "./services/receipt-builder.service";

export {
  getOrCreateDeviceId,
  loadPrinterConfiguration,
  savePrinterConfiguration,
  clearPrinterConfiguration,
  createDefaultConfiguration,
  validatePrinterConfiguration,
  getDefaultCharactersPerLine,
} from "./services/printer-config.service";

export type { ReceiptData, ReceiptCompany, ReceiptBranch, ReceiptDocument, ReceiptItem, ReceiptTotals, ReceiptPayment } from "./types/receipt.types";
export type { PrinterConfiguration, PaperWidth, PrinterConnectionStatus, PrintResult } from "./types/printer.types";

export { PAPER_CONFIG } from "./constants/paper.constants";
export { ESC_POS } from "./constants/escpos.constants";
