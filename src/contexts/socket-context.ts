import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

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

export interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  isReconnecting: boolean;
  socketError: string | null;
  usuariosConectados: ConnectedUser[];
  notificaciones: RealtimeNotification[];
  descartarNotificacion: (id: string) => void;
  reconnect: () => void;
}

export const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  isReconnecting: false,
  socketError: null,
  usuariosConectados: [],
  notificaciones: [],
  descartarNotificacion: () => {},
  reconnect: () => {},
});

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}
