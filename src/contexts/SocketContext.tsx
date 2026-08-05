import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { socketBaseUrl } from "../utils/networkUrls";
import { SocketContext, type ConnectedUser, type RealtimeNotification } from "./socket-context";

function authErrorMessage(message?: string): string {
  const detail = String(message || "No autorizado");
  return `${/sucursal|botica|pertenece/i.test(detail) ? "403" : "401"} — ${detail}`;
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, isAuthenticated, isLoading, sucursalActual } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [usuariosConectados, setUsuariosConectados] = useState<ConnectedUser[]>([]);
  const [notificaciones, setNotificaciones] = useState<RealtimeNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !token || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsReconnecting(false);
      setSocketError(null);
      setUsuariosConectados([]);
      setNotificaciones([]);
      return;
    }

    const current = io(socketBaseUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });
    socketRef.current = current;
    setSocket(current);

    const invalidateProductos = () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    };
    const invalidateInventario = () => {
      invalidateProductos();
      void queryClient.invalidateQueries({ queryKey: ["reportes-inventario"] });
    };
    const invalidateClientes = () => {
      void queryClient.invalidateQueries({ queryKey: ["clientes"] });
    };
    const invalidateVentas = () => {
      void queryClient.invalidateQueries({ queryKey: ["ventas"] });
      invalidateProductos();
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["reportes-ventas"] });
    };

    current.on("connect", () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setSocketError(null);
    });
    current.on("disconnect", () => {
      setIsConnected(false);
      setUsuariosConectados([]);
    });
    current.on("auth_error", (data?: { message?: string }) => {
      setSocketError(authErrorMessage(data?.message));
      setIsConnected(false);
    });
    current.on("connect_error", (error: Error) => {
      setSocketError(authErrorMessage(error.message));
      setIsConnected(false);
    });
    current.io.on("reconnect_attempt", () => setIsReconnecting(true));
    current.io.on("reconnect", () => {
      setIsConnected(true);
      setIsReconnecting(false);
    });

    current.on("users.active_list", (users: ConnectedUser[]) => {
      setUsuariosConectados(Array.isArray(users) ? users : []);
    });
    current.on("notification.created", (data?: Partial<RealtimeNotification>) => {
      const notification: RealtimeNotification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        titulo: data?.titulo || "Notificación de Sistema",
        mensaje: data?.mensaje || "",
        tipo: data?.tipo || "INFO",
        timestamp: new Date(),
      };
      setNotificaciones((previous) => [notification, ...previous.slice(0, 9)]);
    });
    current.on("stock.minimum", (data?: { mensaje?: string }) => {
      setNotificaciones((previous) => [{
        id: `stock_min_${Date.now()}`,
        titulo: "Alerta de Stock Mínimo",
        mensaje: data?.mensaje || "Producto en stock crítico",
        tipo: "WARNING",
        timestamp: new Date(),
      }, ...previous.slice(0, 9)]);
    });
    current.on("stock.out", (data?: { mensaje?: string }) => {
      setNotificaciones((previous) => [{
        id: `stock_out_${Date.now()}`,
        titulo: "Producto AGOTADO",
        mensaje: data?.mensaje || "El producto se ha agotado",
        tipo: "DANGER",
        timestamp: new Date(),
      }, ...previous.slice(0, 9)]);
    });

    ["producto.creado", "producto.actualizado", "producto.eliminado", "precio.actualizado"]
      .forEach((event) => current.on(event, invalidateProductos));
    current.on("inventario.actualizado", invalidateInventario);
    current.on("stock.actualizado", invalidateInventario);
    current.on("cliente.creado", invalidateClientes);
    current.on("cliente.actualizado", invalidateClientes);
    current.on("venta.creada", invalidateVentas);
    current.on("venta.anulada", invalidateVentas);
    current.on("dashboard.actualizado", () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });

    return () => {
      current.disconnect();
      if (socketRef.current === current) socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsReconnecting(false);
    };
  }, [isAuthenticated, isLoading, queryClient, token, user]);

  useEffect(() => {
    if (!socket?.connected || !sucursalActual?.id) return;
    socket.emit("identify_user", { sucursalId: sucursalActual.id }, (ack?: { success?: boolean; error?: string }) => {
      if (ack?.success === false) setSocketError(authErrorMessage(ack.error));
    });
  }, [isConnected, socket, sucursalActual?.id]);

  const descartarNotificacion = useCallback((id: string) => {
    setNotificaciones((previous) => previous.filter((notification) => notification.id !== id));
  }, []);

  const reconnect = useCallback(() => {
    if (!token || !isAuthenticated) return;
    socketRef.current?.connect();
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      isReconnecting,
      socketError,
      usuariosConectados,
      notificaciones,
      descartarNotificacion,
      reconnect,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
