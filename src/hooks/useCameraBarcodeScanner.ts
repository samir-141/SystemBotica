import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export interface UseCameraBarcodeScannerOptions {
  /** Callback que se ejecuta cuando se detecta un código de barras */
  onScan: (code: string) => void;
  /** Si está activo, el escáner se iniciará automáticamente cuando esté listo */
  enabled?: boolean;
  /** Modo continuo: no se detiene tras el primer escaneo */
  continuous?: boolean;
  /** Tiempo de espera en milisegundos entre escaneos para evitar duplicados en ráfaga (por defecto 1000ms) */
  cooldownMs?: number;
  /** Modo de cámara: "environment" (trasera) o "user" (frontal) */
  facingMode?: "environment" | "user";
  /** Si debe vibrar el dispositivo móvil al detectar un código */
  vibrate?: boolean;
  /** Callback opcional para manejar errores de cámara */
  onError?: (error: Error | string) => void;
}

export interface UseCameraBarcodeScannerReturn {
  /** Referencia que se debe asignar al elemento <video> */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Si la cámara está escaneando activamente */
  isScanning: boolean;
  /** Mensaje de error amigable en caso de falla de permisos o dispositivo */
  error: string | null;
  /** Iniciar manualmente el escaneo */
  startScanning: () => void;
  /** Detener manualmente el escaneo y apagar la cámara */
  stopScanning: () => void;
  /** Último código escaneado */
  lastScannedCode: string | null;
}

export function useCameraBarcodeScanner({
  onScan,
  enabled = true,
  continuous = false,
  cooldownMs = 1000,
  facingMode = "environment",
  vibrate = true,
  onError,
}: UseCameraBarcodeScannerOptions): UseCameraBarcodeScannerReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const cooldownRef = useRef<boolean>(false);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  // Mantener actualizadas las referencias de callbacks para evitar recreaciones
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const stopScanning = useCallback(() => {
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch (err) {
        console.warn("[CameraScanner] Error al resetear lector:", err);
      }
      readerRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      } catch (err) {
        console.warn("[CameraScanner] Error al detener tracks de video:", err);
      }
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(() => {
    if (!videoRef.current) return;
    stopScanning();

    setError(null);
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    reader
      .decodeFromConstraints(constraints, videoRef.current, (result, decodeError) => {
        if (result && !cooldownRef.current) {
          const code = result.getText().trim();
          if (code) {
            cooldownRef.current = true;
            setLastScannedCode(code);

            if (vibrate && typeof navigator !== "undefined" && "vibrate" in navigator) {
              try {
                navigator.vibrate(100);
              } catch {
                // Ignore in browsers where vibrate is blocked
              }
            }

            onScanRef.current(code);

            if (!continuous) {
              stopScanning();
            } else {
              setTimeout(() => {
                cooldownRef.current = false;
              }, cooldownMs);
            }
          }
        }

        if (decodeError && !(decodeError instanceof NotFoundException)) {
          // Log solo errores reales de decodificación (no los cuadros vacíos)
          console.warn("[CameraScanner] Error durante decodificación:", decodeError);
        }
      })
      .then(() => {
        setIsScanning(true);
      })
      .catch((err) => {
        const mensajeAmigable =
          err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
            ? "Permiso de cámara denegado. Habilita el acceso a la cámara en el navegador."
            : err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError"
            ? "No se encontró ninguna cámara disponible en este dispositivo."
            : "No se pudo acceder a la cámara. Puedes ingresar el código manualmente o usar un lector USB.";

        setError(mensajeAmigable);
        setIsScanning(false);
        if (onErrorRef.current) {
          onErrorRef.current(err instanceof Error ? err : new Error(mensajeAmigable));
        }
      });
  }, [facingMode, continuous, cooldownMs, vibrate, stopScanning]);

  useEffect(() => {
    if (enabled && videoRef.current) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [enabled, startScanning, stopScanning]);

  return {
    videoRef,
    isScanning,
    error,
    startScanning,
    stopScanning,
    lastScannedCode,
  };
}
