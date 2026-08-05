/**
 * Type declarations for qz-tray v2.2.6
 * QZ Tray provides browser-to-printer communication via WebSocket.
 *
 * @see https://qz.io/documentation/
 */

declare module 'qz-tray' {
  interface QzPrinter {
    name: string;
    description: string;
    isDefault: boolean;
    isConnected: boolean;
  }

  interface QzPrintData {
    type: string;
    format?: string;
    data?: string | object;
  }

  interface QzPrintOptions {
    altPrinting?: boolean;
    bounds?: { x: number; y: number; width: number; height: number };
    colorType?: string;
    copies?: number;
    density?: number;
    doubleSided?: boolean;
    interpolate?: string;
    jobName?: string;
    legacy?: boolean;
    margins?: { top: number; right: number; bottom: number; left: number };
    orientation?: string;
    paperThickness?: number;
    pixelDensity?: number;
    printerId?: string;
    rasterize?: boolean;
    rotation?: number;
    scaleContent?: boolean;
    size?: { width: number; height: number };
    spellCheck?: boolean;
    stubDocument?: boolean;
    threadCatch?: boolean;
    trim?: boolean;
    win32?: Record<string, unknown>;
    forceRaw?: boolean;
  }

  interface QzWebSocket {
    /** Check if there is an active connection with QZ Tray */
    isActive(): boolean;
    /** Setup connection with QZ Tray */
    connect(options?: Record<string, unknown>): Promise<void>;
    /** Stop any active connection with QZ Tray */
    disconnect(): Promise<void>;
    /** Set error callbacks for connection errors */
    setErrorCallbacks(calls: ((event: Event) => void) | ((event: Event) => void)[]): void;
    /** Set closed callbacks for connection closing events */
    setClosedCallbacks(calls: ((event: Event) => void) | ((event: Event) => void)[]): void;
  }

  interface QzPrinters {
    /** Get the default printer name */
    getDefault(): Promise<string>;
    /** Find printers, optionally by query. Returns printer name(s) */
    find(query?: string): Promise<string | string[]>;
    /** Get detailed information for each printer */
    details(): Promise<QzPrinter[]>;
  }

  interface QzSecurity {
    /** Set the certificate promise handler for signing requests */
    setCertificatePromise(
      promiseHandler: (certificate: string) => Promise<string>,
      options?: (privateKey: string) => Promise<string>
    ): void;
    /** Set the signature algorithm (e.g., 'RSA-SHA512') */
    setSignatureAlgorithm(algorithm: string): void;
    /** Get the current signature algorithm */
    getSignatureAlgorithm(): string;
  }

  interface QzApi {
    /** Show or hide QZ debugging logs in browser console */
    showDebug(show: boolean): boolean;
    /** Get internal branding title (e.g. "QZ Tray") */
    getTitle(): string;
    /** Get version of connected QZ Tray application */
    getVersion(): Promise<string>;
    /** Check if connected version matches specified version */
    isVersion(major: number, minor?: number, patch?: number): boolean;
    /** Check if connected version is greater than specified version */
    isVersionGreater(major: number, minor?: number, patch?: number, build?: number): boolean;
    /** Check if connected version is less than specified version */
    isVersionLess(major: number, minor?: number, patch?: number, build?: number): boolean;
    /** Change the promise library used by QZ API */
    setPromiseType(promiser: (resolver: (resolve: (value: unknown) => void, reject: (reason?: unknown) => void) => void) => void): void;
    /** Change the SHA-256 hashing function used by QZ API */
    setSha256Type(hasher: (message: string) => string): void;
    /** Change the internal branding of "QZ Tray" for logs and exceptions */
    setTitle(title: string): void;
    /** Change the WebSocket handler */
    setWebSocketType(ws: new () => WebSocket): void;
    /** Enable/disable version promise (recommended for async version checks) */
    setVersionPromise(enable: boolean): void;
  }

  interface QzSocket {
    /** Get details of active websocket connection */
    getOptions(): Promise<{ socket: string; host: string; port: number }>;
  }

  interface QzNetworking {
    /** Get network device information */
    device(hostname?: string, port?: number): Promise<{ ip: string; mac: string }>;
  }

  interface Qz {
    websocket: QzWebSocket;
    printers: QzPrinters;
    security: QzSecurity;
    api: QzApi;
    socket: QzSocket;
    networking: QzNetworking;
    /** Print to a specified printer */
    print(configs: string | Record<string, unknown>, data: (string | Uint8Array | QzPrintData)[] | string, options?: QzPrintOptions): Promise<void>;
    /** Print and hold for user interaction */
    printAndHold(configs: string | Record<string, unknown>, data: (string | Uint8Array | QzPrintData)[] | string, options?: QzPrintOptions, hold?: boolean): Promise<void>;
    /** Open a cash drawer */
    openCashDrawer(configs?: string | Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
    /** Version of the QZ Tray JavaScript library */
    version: string;
  }

  const qz: Qz;
  export default qz;
  export type {
    Qz,
    QzPrinter,
    QzPrintData,
    QzPrintOptions,
    QzWebSocket,
    QzPrinters,
    QzSecurity,
    QzApi,
    QzSocket,
    QzNetworking,
  };
}
