import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

export interface RealtimeNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
  timestamp: Date;
}

export interface ConnectedUser {
  socketId: string;
  usuarioId: string;
  nombre: string;
  rol: string;
  sucursalId: string;
  connectedAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isReconnecting: boolean;
  usuariosConectados: ConnectedUser[];
  notificaciones: RealtimeNotification[];
  descartarNotificacion: (id: string) => void;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isReconnecting: false,
  usuariosConectados: [],
  notificaciones: [],
  descartarNotificacion: () => {},
  reconnect: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, sucursalActual } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [usuariosConectados, setUsuariosConectados] = useState<ConnectedUser[]>([]);
  const [notificaciones, setNotificaciones] = useState<RealtimeNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const getSocketUrl = useCallback(() => {
    const envUrl = import.meta.env.VITE_API_URL || "";
    if (envUrl) {
      return envUrl.trim().replace(/\/api\/?$/, "");
    }
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:3000`;
    }
    return "http://localhost:3000";
  }, []);

  const conectarSocket = useCallback(() => {
    const serverHost = getSocketUrl();
    if (!serverHost) return;

    if (socketRef.current?.connected) return;

    const s = io(serverHost, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      console.info("[SocketContext] Conectado al servidor WebSocket en tiempo real");
      setIsConnected(true);
      setIsReconnecting(false);

      // Identificar usuario y sucursal activa
      if (user) {
        s.emit("identify_user", {
          usuarioId: user.id,
          nombre: user.nombre || user.correo || "Usuario POS",
          rol: user.rol || "USUARIO",
          sucursalId: sucursalActual?.id || "GLOBAL",
        });
      }
    });

    s.on("disconnect", (reason) => {
      console.warn(`[SocketContext] Desconectado: ${reason}`);
      setIsConnected(false);
      if (reason === "io server disconnect") {
        s.connect();
      }
    });

    s.io.on("reconnect_attempt", () => {
      setIsReconnecting(true);
    });

    s.io.on("reconnect", () => {
      setIsConnected(true);
      setIsReconnecting(false);
    });

    s.on("users.active_list", (lista: ConnectedUser[]) => {
      setUsuariosConectados(lista || []);
    });

    s.on("notification.created", (data: any) => {
      const nuevaNotif: RealtimeNotification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        titulo: data.titulo || "Notificación de Sistema",
        mensaje: data.mensaje || "",
        tipo: data.tipo || "INFO",
        timestamp: new Date(),
      };
      setNotificaciones((prev) => [nuevaNotif, ...prev.slice(0, 9)]);
    });

    s.on("stock.minimum", (data: any) => {
      setNotificaciones((prev) => [
        {
          id: `stock_min_${Date.now()}`,
          titulo: "Alerta de Stock Mínimo",
          mensaje: data.mensaje || `Producto en stock crítico`,
          tipo: "WARNING",
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    });

    s.on("stock.out", (data: any) => {
      setNotificaciones((prev) => [
        {
          id: `stock_out_${Date.now()}`,
          titulo: "Producto AGOTADO",
          mensaje: data.mensaje || `El producto se ha agotado`,
          tipo: "DANGER",
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    });
  }, [getSocketUrl, user, sucursalActual]);

  useEffect(() => {
    conectarSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conectarSocket]);

  const descartarNotificacion = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    } else {
      conectarSocket();
    }
  }, [conectarSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isReconnecting,
        usuariosConectados,
        notificaciones,
        descartarNotificacion,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
