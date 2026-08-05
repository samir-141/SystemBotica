import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import { socketBaseUrl } from "../utils/networkUrls";

interface ScannerAck {
  success?: boolean;
  sessionCode?: string;
  expiresAt?: number;
  status?: string;
  error?: string;
}

function mensajeSeguro(message?: string): string {
  const detail = String(message || "No autorizado");
  if (/sesión (expirada|no existe)|código de sesión ya utilizado/i.test(detail)) return detail;
  if (/otra botica|no pertenece|no autorizado|dispositivo no emparejado/i.test(detail)) {
    return `403 — ${detail}`;
  }
  if (/token|autentic|acceso|sesión/i.test(detail)) return `401 — ${detail}`;
  return detail;
}

export function useRemoteScannerSocket(
  onBarcodeScanned?: (barcode: string, deviceName?: string) => void,
  initialSessionCode?: string | null,
  role: "pc" | "phone" = "pc",
  enabled = true,
) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const requestedCode = String(initialSessionCode || "").trim().toUpperCase();
  const [sessionCode, setSessionCode] = useState(role === "phone" ? requestedCode : "");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [connected, setConnected] = useState(false);
  const [paired, setPaired] = useState(false);
  const [remoteDeviceConnected, setRemoteDeviceConnected] = useState(false);
  const [remoteDeviceName, setRemoteDeviceName] = useState<string | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const sessionCodeRef = useRef(sessionCode);
  const onBarcodeScannedRef = useRef(onBarcodeScanned);

  const actualizarCodigo = useCallback((code: string, expiration?: number) => {
    const normalized = String(code || "").trim().toUpperCase();
    sessionCodeRef.current = normalized;
    setSessionCode(normalized);
    setExpiresAt(expiration || null);
    setExpired(false);
  }, []);

  useEffect(() => {
    onBarcodeScannedRef.current = onBarcodeScanned;
  }, [onBarcodeScanned]);

  useEffect(() => {
    if (role === "phone") actualizarCodigo(requestedCode);
  }, [actualizarCodigo, requestedCode, role]);

  const solicitarSesionServidor = useCallback((target?: Socket | null) => {
    const socket = target || socketRef.current;
    if (!socket?.connected || role !== "pc") return;
    setError(null);
    setPaired(false);
    setRemoteDeviceConnected(false);
    socket.emit("create_session", {}, (ack: ScannerAck) => {
      if (!ack?.success || !ack.sessionCode || !ack.expiresAt) {
        setError(mensajeSeguro(ack?.error || "El servidor no pudo crear la sesión de escaneo"));
        return;
      }
      actualizarCodigo(ack.sessionCode, ack.expiresAt);
    });
  }, [actualizarCodigo, role]);

  useEffect(() => {
    if (!enabled || isLoading || !isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setPaired(false);
      setRemoteDeviceConnected(false);
      if (!isLoading && enabled && !token) setError("401 — Inicia sesión para usar el escáner remoto");
      return;
    }

    if (role === "phone" && !requestedCode) {
      setError("No hay un código de emparejamiento. Abre el enlace o QR generado por el POS.");
      return;
    }

    const socket = io(`${socketBaseUrl}/escanner`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
      if (role === "pc") {
        solicitarSesionServidor(socket);
        return;
      }
      socket.emit("join_session", {
        sessionCode: requestedCode,
        role: "phone",
        deviceName: "Smartphone Remoto",
      }, (ack: ScannerAck) => {
        if (!ack?.success) {
          setPaired(false);
          if (/expirada/i.test(String(ack?.error || ""))) setExpired(true);
          setError(mensajeSeguro(ack?.error || "No se pudo emparejar con el POS"));
          return;
        }
        setPaired(true);
        actualizarCodigo(ack.sessionCode || requestedCode);
      });
    });

    socket.on("auth_error", (data?: { message?: string }) => {
      setError(mensajeSeguro(data?.message));
      setConnected(false);
      setPaired(false);
    });
    socket.on("connect_error", (connectionError: Error) => {
      setError(mensajeSeguro(connectionError.message));
      setConnected(false);
    });
    socket.on("disconnect", () => {
      setConnected(false);
      setPaired(false);
      setRemoteDeviceConnected(false);
    });
    socket.on("device_joined", (data?: { deviceName?: string }) => {
      setPaired(true);
      setRemoteDeviceConnected(true);
      setRemoteDeviceName(data?.deviceName || "Smartphone Remoto");
    });
    socket.on("device_disconnected", () => {
      setPaired(false);
      setRemoteDeviceConnected(false);
      setRemoteDeviceName(null);
    });
    socket.on("barcode_scanned", (data?: { barcode?: string; deviceName?: string }) => {
      if (data?.barcode) onBarcodeScannedRef.current?.(data.barcode, data.deviceName);
    });

    const pingInterval = window.setInterval(() => {
      if (!socket.connected) return;
      const start = Date.now();
      socket.emit("ping_check", { timestamp: start }, (ack: { pong?: boolean }) => {
        if (ack?.pong) setPingMs(Date.now() - start);
      });
    }, 3000);

    return () => {
      window.clearInterval(pingInterval);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [actualizarCodigo, enabled, isAuthenticated, isLoading, requestedCode, role, solicitarSesionServidor, token]);

  useEffect(() => {
    if (!expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      setPaired(false);
      setError("La sesión de escaneo expiró. Genera un nuevo emparejamiento.");
      return;
    }
    const timeout = window.setTimeout(() => {
      setExpired(true);
      setPaired(false);
      setError("La sesión de escaneo expiró. Genera un nuevo emparejamiento.");
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [expiresAt]);

  const sendBarcode = useCallback((barcode: string): Promise<boolean> => {
    const socket = socketRef.current;
    const code = sessionCodeRef.current;
    if (!socket?.connected || !paired || !code || expired) {
      setError(expired ? "La sesión de escaneo expiró." : "El celular no está emparejado con una caja activa.");
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      const timeout = window.setTimeout(() => {
        setError("No hubo respuesta del POS. Verifica la conexión e intenta nuevamente.");
        resolve(false);
      }, 5000);
      socket.emit("scan_barcode", {
        sessionCode: code,
        barcode: barcode.trim(),
        deviceName: "Smartphone Remoto",
      }, (ack: ScannerAck) => {
        window.clearTimeout(timeout);
        if (!ack?.success) {
          if (/expirada/i.test(String(ack?.error || ""))) setExpired(true);
          setError(mensajeSeguro(ack?.error || "El POS rechazó el código"));
          resolve(false);
          return;
        }
        setError(null);
        resolve(true);
      });
    });
  }, [expired, paired]);

  const changeSessionCode = useCallback((newCode: string) => {
    if (role !== "phone") {
      setError("El código de emparejamiento solo puede generarlo el servidor.");
      return;
    }
    actualizarCodigo(newCode);
  }, [actualizarCodigo, role]);

  return {
    connected,
    paired,
    remoteDeviceConnected,
    remoteDeviceName,
    sessionCode,
    expiresAt,
    expired,
    pingMs,
    error,
    sendBarcode,
    changeSessionCode,
    renewSession: solicitarSesionServidor,
  };
}
