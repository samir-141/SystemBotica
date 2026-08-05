import { useSocket, type RealtimeNotification } from "../../contexts/socket-context";
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, X } from "lucide-react";

export default function RealtimeNotifications() {
  const { notificaciones, descartarNotificacion, isConnected, isReconnecting } = useSocket();

  if (notificaciones.length === 0 && isConnected && !isReconnecting) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {/* Banner de Estado de Conexión si está reconectando */}
      {isReconnecting && (
        <div className="pointer-events-auto bg-amber-500 text-slate-950 p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-amber-600 animate-pulse">
          <AlertTriangle size={18} className="shrink-0" />
          <span>Reconectando servidor en tiempo real...</span>
        </div>
      )}

      {/* Lista de Notificaciones de Eventos Realtime */}
      {notificaciones.map((notif: RealtimeNotification) => {
        const getStyles = () => {
          switch (notif.tipo) {
            case "DANGER":
              return {
                bg: "bg-rose-900/95 text-white border-rose-700",
                icon: <AlertOctagon size={18} className="text-rose-400 shrink-0" />,
              };
            case "WARNING":
              return {
                bg: "bg-amber-900/95 text-white border-amber-700",
                icon: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
              };
            case "SUCCESS":
              return {
                bg: "bg-emerald-900/95 text-white border-emerald-700",
                icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
              };
            default:
              return {
                bg: "bg-slate-900/95 text-white border-slate-700",
                icon: <Info size={18} className="text-blue-400 shrink-0" />,
              };
          }
        };

        const { bg, icon } = getStyles();

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border flex items-start justify-between gap-3 text-xs animate-in slide-in-from-right duration-200 ${bg}`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div className="space-y-0.5">
                <h4 className="font-black text-xs tracking-tight">{notif.titulo}</h4>
                <p className="text-[11px] font-medium text-slate-200 leading-snug">{notif.mensaje}</p>
                <span className="text-[9px] text-slate-400 block pt-0.5 font-mono">
                  {notif.timestamp.toLocaleTimeString("es-PE")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => descartarNotificacion(notif.id)}
              className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
