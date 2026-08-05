import type { QzPrinter, QzSecurityCertificate } from "../types/qz.types";

type QzModule = typeof import("qz-tray");

let qzModule: QzModule | null = null;

async function loadQz(): Promise<QzModule> {
  if (!qzModule) {
    qzModule = await import("qz-tray");
  }
  return qzModule;
}

let connectionPromise: Promise<void> | null = null;
let connected = false;

export const qzService = {
  async connect(): Promise<void> {
    if (connected) return;

    if (connectionPromise) {
      return connectionPromise;
    }

    connectionPromise = (async () => {
      const qz = await loadQz();

      qz.api.setVersionPromise(true);
      qz.api.disconnect();

      await qz.api.connect();
      connected = true;
    })().finally(() => {
      connectionPromise = null;
    });

    return connectionPromise;
  },

  async disconnect(): Promise<void> {
    if (!connected) return;
    const qz = await loadQz();
    await qz.api.disconnect();
    connected = false;
  },

  isConnected(): boolean {
    return connected;
  },

  async getPrinters(): Promise<string[]> {
    const qz = await loadQz();
    const printers = await qz.api.getPrinters();
    return printers.map((p: QzPrinter) => p.name);
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
    await qz.api.print(printerName, commands);
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
};
