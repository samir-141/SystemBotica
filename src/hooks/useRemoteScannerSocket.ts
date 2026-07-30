import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

function generarSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "POS-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useRemoteScannerSocket(
  onBarcodeScanned?: (barcode: string, deviceName?: string) => void,
  initialSessionCode?: string | null,
  role: "pc" | "phone" = "pc",
  enabled: boolean = true
) {
  const [sessionCode, setSessionCode] = useState<string>(() => {
    if (initialSessionCode) return initialSessionCode.toUpperCase();
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem("pos_session_code") : null;
    if (stored) return stored;
    const nuevo = generarSessionCode();
    if (typeof localStorage !== "undefined") localStorage.setItem("pos_session_code", nuevo);
    return nuevo;
  });

  const [connected, setConnected] = useState(false);
  const [remoteDeviceConnected, setRemoteDeviceConnected] = useState(false);
  const [remoteDeviceName, setRemoteDeviceName] = useState<string | null>(null);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Mantener callback estable mediante useRef para evitar ciclo infinito de reconexión
  const onBarcodeScannedRef = useRef(onBarcodeScanned);
  useEffect(() => {
    onBarcodeScannedRef.current = onBarcodeScanned;
  }, [onBarcodeScanned]);

  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        setRemoteDeviceConnected(false);
      }
      return;
    }

    // Determinar URL del servidor backend para WebSocket
    const envUrl = import.meta.env.VITE_API_URL || "";
    let serverHost = "";

    if (envUrl) {
      serverHost = envUrl.trim().replace(/\/api\/?$/, "");
    } else if (typeof window !== "undefined") {
      serverHost = `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    const socketUrl = `${serverHost}/escanner`;

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      const name = role === "phone" ? "Smartphone Remoto" : "Caja Principal POS";
      socket.emit("join_session", { sessionCode, role, deviceName: name });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setRemoteDeviceConnected(false);
    });

    socket.on("device_joined", (data) => {
      setRemoteDeviceConnected(true);
      if (data?.deviceName) setRemoteDeviceName(data.deviceName);
    });

    socket.on("device_disconnected", () => {
      setRemoteDeviceConnected(false);
    });

    socket.on("barcode_scanned", (data) => {
      if (data?.barcode && onBarcodeScannedRef.current) {
        onBarcodeScannedRef.current(data.barcode, data.deviceName);
      }
    });

    // Medición de Ping en tiempo real
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();
        socket.emit("ping_check", { timestamp: start }, (res: any) => {
          if (res?.pong) {
            setPingMs(Date.now() - start);
          }
        });
      }
    }, 3000);

    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionCode, role, enabled]);

  const sendBarcode = useCallback(
    (barcode: string) => {
      if (socketRef.current && socketRef.current.connected) {
        const devName = role === "phone" ? "Smartphone Remoto" : "POS";
        socketRef.current.emit("scan_barcode", {
          sessionCode,
          barcode,
          deviceName: devName,
        });
      }
    },
    [sessionCode, role]
  );

  const changeSessionCode = (newCode: string) => {
    const codeClean = newCode.toUpperCase().trim();
    if (codeClean) {
      setSessionCode(codeClean);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pos_session_code", codeClean);
      }
    }
  };

  return {
    connected,
    remoteDeviceConnected,
    remoteDeviceName,
    sessionCode,
    pingMs,
    sendBarcode,
    changeSessionCode,
  };
}
