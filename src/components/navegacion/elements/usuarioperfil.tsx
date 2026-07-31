import { ShieldCheck, Wifi, WifiOff } from "lucide-react";
import { useSocket } from "../../../contexts/SocketContext";

interface UsuarioperfilProps {
    isCollapsed: boolean;
    user: any;
    rolUsuario: string;
}

export default function Usuarioperfil({ isCollapsed, user, rolUsuario }: UsuarioperfilProps) {
    const { isConnected, usuariosConectados } = useSocket();
    const inicial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U";

    return (
        <div className={`border-b border-marifarma-gold/20 bg-[#00362b] shrink-0 ${isCollapsed ? "flex flex-col items-center py-3 px-2 gap-2" : "flex items-center gap-3 px-4 py-3"}`}>
            {/* Avatar inicial con indicador de conexión */}
            <div className="relative shrink-0">
                <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-marifarma-gold to-[#d5a400] text-marifarma-green-deep font-black flex items-center justify-center text-sm shadow-md"
                    title={user?.nombre || "Usuario"}
                >
                    {inicial}
                </div>
                <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-marifarma-green-deep ${
                        isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                    title={isConnected ? "WebSocket Realtime Conectado" : "Conexión Realtime Reintentando"}
                />
            </div>

            {!isCollapsed && (
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-[13px] text-white truncate leading-tight">
                        {user?.nombre || "Usuario POS"}
                    </p>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                        <div className="flex items-center gap-1 min-w-0">
                            <ShieldCheck size={11} className="text-marifarma-gold shrink-0" />
                            <span className="text-[11px] text-marifarma-gold font-semibold truncate">{rolUsuario}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400" title="Usuarios/Cajeros en línea en tiempo real">
                            {isConnected ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-amber-400" />}
                            <span className={isConnected ? "text-emerald-400" : "text-amber-400"}>
                                {isConnected ? `${usuariosConectados.length || 1} en línea` : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
