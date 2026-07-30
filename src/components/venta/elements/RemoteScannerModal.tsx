import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  X,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Activity,
  Monitor,
} from "lucide-react";
import { detectDevice } from "../../../utils/deviceDetector";

interface Props {
  open: boolean;
  onClose: () => void;
  sessionCode: string;
  connected: boolean;
  remoteDeviceConnected: boolean;
  remoteDeviceName?: string | null;
  pingMs?: number | null;
  ultimoCodigoRemoto?: string | null;
  onChangeSessionCode?: (newCode: string) => void;
}

export default function RemoteScannerModal({
  open,
  onClose,
  sessionCode,
  connected,
  remoteDeviceConnected,
  remoteDeviceName,
  pingMs,
  ultimoCodigoRemoto,
}: Props) {
  const [copiado, setCopiado] = useState(false);
  const [urlEscanner, setUrlEscanner] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const device = detectDevice();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // En desarrollo el POS puede abrirse en localhost, pero el teléfono no
      // puede resolverlo. En ese caso usamos la IP/host configurado para la API.
      const apiUrl = String(import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");
      const apiHost = apiUrl ? new URL(apiUrl).hostname : "";
      const origin = window.location.hostname === "localhost" && apiHost
        ? `${window.location.protocol}//${apiHost}:${window.location.port || "5173"}`
        : window.location.origin;
      const url = `${origin}/escanner-remoto?session=${encodeURIComponent(sessionCode)}`;
      setUrlEscanner(url);

      // Generar imagen DataURL de código QR 2D real scaneable por cualquier celular
      QRCode.toDataURL(url, {
        margin: 1,
        width: 220,
        color: {
          dark: "#1e1b4b",
          light: "#ffffff",
        },
      })
        .then((dataUri) => setQrDataUrl(dataUri))
        .catch((err) => console.error("Error al generar código QR:", err));
    }
  }, [sessionCode]);

  if (!open) return null;

  const handleCopiarUrl = () => {
    navigator.clipboard.writeText(urlEscanner);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-800 text-indigo-300 flex items-center justify-center font-bold shadow-inner">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <span>Escáner Celular Inalámbrico</span>
                <span className="text-[10px] font-mono font-black bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700">
                  {sessionCode}
                </span>
              </h3>
              <p className="text-[11px] text-indigo-300 flex items-center gap-1">
                <span>Sincronización Real-Time</span>
                <span>•</span>
                <span className="font-bold text-teal-300">
                  {device.esMovil ? `Móvil (${device.os})` : `PC (${device.os})`}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white rounded-xl hover:bg-indigo-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          {/* Indicador de Estado de Conexión en Vivo */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${remoteDeviceConnected
                  ? "bg-emerald-500 animate-ping"
                  : connected
                    ? "bg-amber-500 animate-pulse"
                    : "bg-slate-400"
                  }`}
              />
              <span className="font-bold text-slate-800">
                {remoteDeviceConnected
                  ? `VINCULADO: ${remoteDeviceName || "Smartphone Remoto"}`
                  : connected
                    ? "Esperando escáner de smartphone..."
                    : "Conectando con WebSocket..."}
              </span>
            </div>
            {pingMs !== null && pingMs !== undefined && (
              <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <Activity size={12} /> {pingMs} ms
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-700 font-bold">
              Escanea este QR con la cámara de tu smartphone:
            </p>
            <p className="text-[11px] text-slate-400">
              Cualquier producto que escanees con el celular se agregará instantáneamente al carrito de esta PC.
            </p>
          </div>

          {/* REAL 2D QR CODE IMAGE DISPLAY */}
          <div className="flex flex-col items-center justify-center bg-indigo-50/40 p-5 rounded-3xl border-2 border-dashed border-indigo-200 space-y-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Código QR escaneable para sesión ${sessionCode}`}
                className="w-48 h-48 rounded-2xl border-2 border-white shadow-md bg-white p-2"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400 font-bold">
                Generando Código QR...
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-indigo-700 bg-white px-3 py-1 rounded-xl border border-indigo-200 shadow-2xs">
                {urlEscanner || "/escanner-remoto"}
              </span>
            </div>
          </div>

          {/* Feedback de último código recibido */}
          {ultimoCodigoRemoto && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-extrabold flex items-center justify-between animate-in zoom-in-95 duration-200 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Código Recibido: <span className="font-mono text-sm">{ultimoCodigoRemoto}</span></span>
              </div>
              <Zap size={14} className="text-emerald-600 fill-emerald-600" />
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="flex items-center justify-center gap-2 w-full">
              <button
                type="button"
                onClick={handleCopiarUrl}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {copiado ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                <span>{copiado ? "Copiado!" : "Copiar Enlace"}</span>
              </button>

              {device.esMovil ? (
                <a
                  href={urlEscanner}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Smartphone size={15} />
                  <span>Abrir Modo Celular</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title={`Función no disponible en PC (${device.os}). Abre este enlace desde tu celular iOS o Android.`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold cursor-not-allowed opacity-75"
                >
                  <Monitor size={15} className="text-slate-400" />
                  <span>Modo Celular (Inactivo en PC)</span>
                </button>
              )}
            </div>

            {!device.esMovil && (
              <p className="text-[10px] text-slate-400 font-medium">
                💻 Estás en una computadora (<strong>{device.os}</strong>). Para usar el modo escáner en celular, escanea el QR superior usando la cámara de tu móvil iOS o Android.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
