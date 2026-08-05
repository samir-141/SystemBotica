export interface QzPrinter {
  name: string;
  description: string;
  isDefault: boolean;
  isConnected: boolean;
}

export interface QzPrintJob {
  printer: string;
  data: (string | Uint8Array)[];
  options?: QzPrintOptions;
}

export interface QzPrintOptions {
  encoding?: string;
  language?: "ESCPOS" | "ZPL" | "EPL";
  perSide?: boolean;
}

export interface QzSecurityCertificate {
  certificate: string;
  privateKey: string;
  algorithm?: string;
}
