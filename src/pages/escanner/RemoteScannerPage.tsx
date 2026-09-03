import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, CheckCircle2, Wifi, ArrowLeft, RefreshCw, Activity, Smartphone } from "lucide-react";
import { useRemoteScannerSocket } from "../../hooks/useRemoteScannerSocket";
import { useCameraBarcodeScanner } from "../../hooks/useCameraBarcodeScanner";

export default function RemoteScannerPage() {
  const [searchParams] = useSearchParams();
  const sessionParam = searchParams.get("session");

  const [escaneando] = useState(true);
  const [ultimoEscaneo, setUltimoEscaneo] = useState<string | null>(null);
  const [historial, setHistorial] = useState<Array<{ codigo: string; hora: string }>>([]);
  const [contadorTotal, setContadorTotal] = useState(0);

  // Hook de comunicación WebSocket en tiempo real con la PC
  const { connected, paired, pingMs, sendBarcode, sessionCode, expired, error: connectionError } = useRemoteScannerSocket(
    undefined,
    sessionParam,
    "phone"
  );

  // Transmitir código escaneado mediante WebSocket instantáneo
  const transmitirAlPOS = useCallback(async (codigo: string) => {
    const sent = await sendBarcode(codigo);
    if (!sent) return;

    const hora = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setUltimoEscaneo(codigo);
    setContadorTotal((prev) => prev + 1);
    setHistorial((prev) => [{ codigo, hora }, ...prev.slice(0, 15)]);
  }, [sendBarcode]);

  // Hook madre de escáner de cámara
  const { videoRef, error: errorCamara, startScanning } = useCameraBarcodeScanner({
    enabled: escaneando && connected && paired && !expired && !connectionError,
    continuous: true,
    cooldownMs: 500,
    vibrate: true,
    onScan: (codigo) => {
      void transmitirAlPOS(codigo);
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <a href="/ventas/nueva" className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <ArrowLeft size={18} />
          </a>
          <div>
            <h1 className="font-extrabold text-xs flex items-center gap-1.5 text-teal-400">
              <Smartphone size={16} className="text-teal-400" />
              <span>Celular Asistente</span>
              <span className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                {sessionCode}
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Rol: Asistente (Carrito Compartido con PC Principal)</p>
          </div>
        </div>

        {/* WebSocket Connection Badge & Latency */}
        <div className="flex items-center gap-2">
          {pingMs !== null && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1">
              <Activity size={10} /> {pingMs}ms
            </span>
          )}

          <div
            className={`flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
              connected
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse"
            }`}
          >
            <Wifi size={12} className={connected ? "animate-pulse" : ""} />
            <span>{connected && paired ? "EMPAREJADO" : connected ? "CONECTANDO AL POS..." : "SIN CONEXIÓN"}</span>
          </div>
        </div>
      </div>

      {/* Cam Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden">
        {connectionError ? (
          <div className="p-6 bg-amber-950/80 border border-amber-700 text-amber-100 rounded-2xl text-center space-y-3 max-w-sm">
            <p className="font-extrabold text-sm">Emparejamiento no disponible</p>
            <p className="font-medium text-xs">{connectionError}</p>
            <p className="text-[11px] text-amber-300">
              {expired
                ? "Solicita un QR nuevo en la caja y vuelve a abrirlo."
                : "Verifica que hayas iniciado sesión en esta misma botica y abre el QR generado por el POS."}
            </p>
          </div>
        ) : errorCamara ? (
          <div className="p-6 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-2xl text-center space-y-3 max-w-xs">
            <p className="font-bold text-xs">{errorCamara}</p>
            <button
              onClick={() => startScanning()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center w-full cursor-pointer"
            >
              <RefreshCw size={14} /> Reintentar Cámara
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm aspect-[4/3] bg-black rounded-3xl overflow-hidden border-2 border-teal-500/50 shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />

            {/* Target Reticle overlay */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
              <div className="w-full h-28 border-2 border-teal-400 rounded-2xl relative animate-pulse shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]" />
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-teal-300 flex items-center gap-1.5 border border-teal-500/30">
              <Camera size={13} />
              <span>Apunta al código de barras</span>
            </div>
          </div>
        )}

        {/* Último código escaneado con animación */}
        {ultimoEscaneo && (
          <div className="mt-4 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center font-mono font-black text-emerald-300 text-sm flex items-center gap-2 shadow-lg animate-in zoom-in-95 duration-150">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Enviado a Caja: {ultimoEscaneo}</span>
          </div>
        )}
      </div>

      {/* Historial de Escaneos en el Teléfono */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2 shrink-0 max-h-48 overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>Enviados a Caja #{sessionCode}</span>
          <span className="bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full text-[10px]">
            {contadorTotal} escaneados
          </span>
        </div>

        {historial.length === 0 ? (
          <p className="text-[11px] text-slate-600 text-center py-2">
            No se han transmitido ítems aún.
          </p>
        ) : (
          <div className="space-y-1.5">
            {historial.map((h, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-xl text-xs font-mono border border-slate-800/80"
              >
                <span className="font-bold text-emerald-400">{h.codigo}</span>
                <span className="text-[10px] text-slate-500">{h.hora}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
