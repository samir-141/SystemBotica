import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";

interface Props {
    onDetected: (codigo: string) => void;
}

export default function BarcodeScanner({ onDetected }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const reader = useRef(new BrowserMultiFormatReader());
    const controlsRef = useRef<IScannerControls | null>(null);

    const [ready, setReady] = useState(false);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        iniciarCamara();

        return () => {
            if (controlsRef.current) {
                controlsRef.current.stop();
            }
        };
    }, []);

    const iniciarCamara = async () => {
        try {
            const devices =
                await BrowserMultiFormatReader.listVideoInputDevices();

            if (!devices.length) {
                alert("No se encontró ninguna cámara.");
                return;
            }

            const deviceId = devices[devices.length - 1].deviceId;

            if (controlsRef.current) {
                controlsRef.current.stop();
            }

            controlsRef.current = await reader.current.decodeFromVideoDevice(
                deviceId,
                videoRef.current!,
                () => {
                    // Solo muestra la cámara.
                }
            );

            setReady(true);

        } catch (e) {
            console.error(e);
        }
    };

    const escanear = async () => {
        const devices =
            await BrowserMultiFormatReader.listVideoInputDevices();

        const deviceId = devices[devices.length - 1].deviceId;

        setScanning(true);

        if (controlsRef.current) {
            controlsRef.current.stop();
        }

        controlsRef.current = await reader.current.decodeFromVideoDevice(
            deviceId,
            videoRef.current!,
            (result, _error, controls) => {

                if (!result) return;

                onDetected(result.getText());

                controls.stop();

                setScanning(false);

                iniciarCamara();
            }
        );
    };

    return (
        <div className="flex flex-col items-center gap-5">

            <div className="relative w-[420px] h-[250px] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">

                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Oscurecer */}
                <div className="absolute inset-0 bg-black/35"></div>

                {/* Área de escaneo */}
                <div className="absolute left-1/2 top-1/2 w-[320px] h-[90px] -translate-x-1/2 -translate-y-1/2 border-4 border-green-400 rounded-lg">

                    {/* Línea animada */}
                    {scanning && (
                        <div className="absolute left-0 top-0 h-1 w-full bg-red-500 animate-pulse"></div>
                    )}

                </div>

            </div>

            <button
                disabled={!ready || scanning}
                onClick={escanear}
                className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-slate-400"
            >
                {scanning ? "Escaneando..." : "Escanear"}
            </button>

        </div>
    );
}