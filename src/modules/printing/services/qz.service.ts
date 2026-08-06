import type { Qz } from "qz-tray";
import type { QzSecurityCertificate } from "../types/qz.types";

let qzInstance: Qz | null = null;
let connectionPromise: Promise<Qz> | null = null;

async function loadQz(): Promise<Qz> {
  if (qzInstance) {
    return qzInstance;
  }

  const imported = await import("qz-tray");
  const qz = (imported.default ?? imported) as Qz;

  if (!qz || !qz.websocket) {
    throw new Error(
      "QZ Tray fue importado correctamente pero websocket no existe."
    );
  }

  qzInstance = qz;
  return qzInstance;
}

async function connectQz(): Promise<Qz> {
  const qz = await loadQz();

  if (qz.websocket.isActive()) {
    return qz;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    qz.api.setVersionPromise(true);
    await qz.websocket.connect();
    return qz;
  })().finally(() => {
    connectionPromise = null;
  });

  return connectionPromise;
}

export const qzService = {
  async connectQz(): Promise<Qz> {
    return connectQz();
  },

  async connect(): Promise<void> {
    await connectQz();
  },

  async disconnect(): Promise<void> {
    const qz = await loadQz();
    if (qz.websocket.isActive()) {
      await qz.websocket.disconnect();
    }
  },

  isConnected(): boolean {
    return qzInstance ? qzInstance.websocket.isActive() : false;
  },

  async getPrinters(): Promise<string[]> {
    const qz = await loadQz();
    const result = await qz.printers.find();
    if (Array.isArray(result)) {
      return result;
    }
    return result ? [result] : [];
  },

  async findPrinter(name: string): Promise<string> {
    const printers = await this.getPrinters();
    const found = printers.find(
      (p) => p.toLowerCase() === name.toLowerCase(),
    );
    if (!found) {
      throw new Error(`Impresora "${name}" no encontrada.`);
    }
    return found;
  },

  async printRaw(printerName: string, commands: (string | Uint8Array)[]): Promise<void> {
    const qz = await loadQz();
    await qz.print({ printer: printerName }, commands);
  },

  async getSignaturePromise(): Promise<string> {
    return Promise.resolve("");
  },

  async setCertificate(_cert: QzSecurityCertificate): Promise<void> {
    const qz = await loadQz();
    qz.security.setCertificatePromise(
      () => Promise.resolve(_cert.certificate),
      () => Promise.resolve(_cert.privateKey),
    );
    if (_cert.algorithm) {
      qz.security.setSignatureAlgorithm(_cert.algorithm);
    }
  },

  async testConnection(): Promise<{ success: boolean; version?: string; printers?: string[]; error?: string }> {
    try {
      const qz = await this.connectQz();
      const version = await qz.api.getVersion();
      const printers = await this.getPrinters();
      return { success: true, version, printers };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Prueba de QZ Tray falló:", error);
      return { success: false, error: errorMsg };
    }
  }
};

if (typeof window !== "undefined") {
  (window as any).testQz = () => qzService.testConnection();
}
