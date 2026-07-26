// src/components/venta/hooks/useCamaraScanner.ts
// Hook que gestiona la cámara para escanear códigos de barras con ZXing

import { useState, useRef, useCallback, useEffect } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export interface UseCamaraScannerReturn {
    /** Si el modal de cámara está abierto */
    camaraAbierta: boolean;
    /** Abre la cámara */
    abrirCamara: () => void;
    /** Cierra la cámara y libera el stream */
    cerrarCamara: () => void;
    /** Ref para el elemento <video> */
    videoRef: React.RefObject<HTMLVideoElement | null>;
    /** Último código escaneado (se resetea al cerrar) */
    ultimoCodigo: string | null;
    /** Mensaje de error si falla la cámara */
    error: string | null;
    /** Si está inicializando la cámara */
    iniciando: boolean;
}

export function useCamaraScanner(
    onDecode: (codigo: string) => void
): UseCamaraScannerReturn {
    const [camaraAbierta, setCamaraAbierta] = useState(false);
    const [ultimoCodigo, setUltimoCodigo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [iniciando, setIniciando] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const readerRef = useRef<BrowserMultiFormatReader | null>(null);
    const decodedRef = useRef(false); // evitar múltiples disparos por el mismo scan

    const cerrarCamara = useCallback(() => {
        // Resetear estado del lector ZXing
        readerRef.current?.reset();
        readerRef.current = null;
        decodedRef.current = false;
        setCamaraAbierta(false);
        setUltimoCodigo(null);
        setError(null);
        setIniciando(false);
    }, []);

    const abrirCamara = useCallback(() => {
        setError(null);
        setIniciando(true);
        setCamaraAbierta(true);
        decodedRef.current = false;
    }, []);

    // Iniciar ZXing cuando el video está montado y la cámara está abierta
    useEffect(() => {
        if (!camaraAbierta || !videoRef.current) return;

        // Comprobación de contexto seguro (HTTPS o Localhost)
        if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError(
                "La cámara requiere conexión HTTPS o habilitar tu IP local como origen seguro. En Chrome para celular, entra a 'chrome://flags', busca 'Insecure origins treated as secure', agrega tu IP de desarrollo y habilítala."
            );
            setIniciando(false);
            return;
        }

        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;

        // Preferir cámara trasera para móviles
        const constraintsHint = {
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
        };

        reader
            .decodeFromConstraints(constraintsHint, videoRef.current, (result, err) => {
                if (result && !decodedRef.current) {
                    decodedRef.current = true;
                    const codigo = result.getText();
                    setUltimoCodigo(codigo);
                    onDecode(codigo);
                    // Pequeño delay para mostrar feedback visual antes de cerrar
                    setTimeout(() => cerrarCamara(), 300);
                }
                if (err && !(err instanceof NotFoundException)) {
                    // NotFoundException es normal (frame sin código), solo loguear errores reales
                    console.warn("[CamaraScanner]", err);
                }
                setIniciando(false);
            })
            .catch((e: Error) => {
                const msg =
                    e.name === "NotAllowedError"
                        ? "Permiso de cámara denegado. Habilítalo en la configuración del navegador."
                        : e.name === "NotFoundError"
                        ? "No se encontró ninguna cámara en este dispositivo."
                        : `Error al iniciar la cámara: ${e.message}`;
                setError(msg);
                setIniciando(false);
                readerRef.current = null;
            });

        return () => {
            reader.reset();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [camaraAbierta]);

    return {
        camaraAbierta,
        abrirCamara,
        cerrarCamara,
        videoRef,
        ultimoCodigo,
        error,
        iniciando,
    };
}
