// src/components/venta/hooks/usePerifericosStatus.ts
// Detecta: escáner USB/HID, disponibilidad de impresora, y sistema operativo / tipo de dispositivo

import { useState, useEffect } from "react";
import { detectDevice, type DeviceInfo } from "../../../utils/deviceDetector";

export interface EstadoPeriferico {
    /** Escáner HID/USB detectado vía WebHID API */
    scannerConectado: boolean;
    /** WebHID está disponible en este navegador */
    hidSoportado: boolean;
    /** El navegador permite abrir el diálogo de impresión; no confirma una impresora física. */
    impresoraDisponible: boolean;
    /** El dispositivo actual es un móvil/tablet (iOS o Android) */
    esCelular: boolean;
    /** Información detallada del SO y tipo de dispositivo */
    deviceInfo: DeviceInfo;
    /** Cámara trasera disponible en el dispositivo */
    camaraDisponible: boolean;
}

async function detectarCamara(): Promise<boolean> {
    try {
        if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;
        if (!navigator.mediaDevices.enumerateDevices) return true;
        const devices = await navigator.mediaDevices.enumerateDevices();
        // En móviles pre-permiso enumerateDevices devuelve elementos con kind o array sin labels
        if (!devices || devices.length === 0) return true;
        return devices.some((d) => d.kind === "videoinput" || (d.kind as string) === "");
    } catch {
        return true;
    }
}

function detectarImpresoraHeuristica(): boolean {
    return typeof window !== "undefined" && typeof window.print === "function";
}

export function usePerifericosStatus(): EstadoPeriferico {
    const hidSoportado = typeof (navigator as any).hid !== "undefined";
    const deviceInfo = detectDevice();
    const esCelular = deviceInfo.esMovil;

    const [scannerConectado, setScannerConectado] = useState(false);
    const [camaraDisponible, setCamaraDisponible] = useState(true);
    const impresoraDisponible = detectarImpresoraHeuristica();

    // ── Detección de cámara ───────────────────────────────────────────────
    useEffect(() => {
        detectarCamara().then(setCamaraDisponible);
    }, []);

    // ── Detección de escáner HID (WebHID API) ────────────────────────────
    useEffect(() => {
        if (!hidSoportado) return;

        const hid = (navigator as any).hid as EventTarget & {
            getDevices: () => Promise<any[]>;
            addEventListener: (type: string, fn: (e: any) => void) => void;
            removeEventListener: (type: string, fn: (e: any) => void) => void;
        };

        // Leer dispositivos ya autorizados al montar
        hid.getDevices().then((devices: any[]) => {
            // Un scanner típico tiene usagePage = 0x0D (digitizer) o es un HID keyboard
            const hasScannerLike = devices.some(
                (d) =>
                    d.opened ||
                    d.collections?.some(
                        (c: any) => c.usagePage === 0x01 // Generic Desktop
                    )
            );
            setScannerConectado(hasScannerLike || devices.length > 0);
        });

        const onConnect = (_e: any) => {
            // Un nuevo HID conectado — asumimos que podría ser un escáner
            setScannerConectado(true);
        };

        const onDisconnect = (_e: any) => {
            // Re-verificar cuántos quedan
            hid.getDevices().then((devices: any[]) => {
                setScannerConectado(devices.length > 0);
            });
        };

        hid.addEventListener("connect", onConnect);
        hid.addEventListener("disconnect", onDisconnect);

        return () => {
            hid.removeEventListener("connect", onConnect);
            hid.removeEventListener("disconnect", onDisconnect);
        };
    }, [hidSoportado]);

    // ── Fallback: detectar scanner por velocidad de tecleo (ya existe en venta.tsx)
    // Si hay eventos de teclado muy rápidos, es probable que haya un scanner activo
    useEffect(() => {
        let rapidKeyCount = 0;
        let lastKeyAt = 0;
        let rapidKeyTimer: ReturnType<typeof setTimeout> | null = null;

        const handleKeyDown = (event: KeyboardEvent) => {
            const now = Date.now();
            if (now - lastKeyAt > 80) rapidKeyCount = 0;
            lastKeyAt = now;
            if (event.key.length === 1) rapidKeyCount++;
            if (rapidKeyTimer) clearTimeout(rapidKeyTimer);
            rapidKeyTimer = setTimeout(() => { rapidKeyCount = 0; }, 100);

            if (event.key === "Enter" && rapidKeyCount >= 3) {
                setScannerConectado(true);
                rapidKeyCount = 0;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return {
        scannerConectado,
        hidSoportado,
        impresoraDisponible,
        esCelular,
        deviceInfo,
        camaraDisponible,
    };
}
