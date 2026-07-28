// src/hooks/useSocketInvalidation.ts
// Escucha eventos Socket.IO en tiempo real e invalida las queries de TanStack Query
// (Secciones 6, 9, 10 y 22 del Documento de Arquitectura)

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export function useSocketInvalidation() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const envUrl = import.meta.env.VITE_API_URL || "";
    let serverHost = "";
    if (envUrl) {
      serverHost = envUrl.trim().replace(/\/api\/?$/, "");
    } else if (typeof window !== "undefined") {
      serverHost = `${window.location.protocol}//${window.location.hostname}:3000`;
    }

    if (!serverHost) return;

    const socket = io(serverHost, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.info("[Socket.IO] Conectado para sincronización en tiempo real");
    });

    // --- 1. Eventos de Productos / Inventario / Precios ---
    const handleProductosChange = () => {
      console.info("[Socket.IO] Evento de producto recibido -> Invalidando cache de productos");
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    };

    socket.on("producto.creado", handleProductosChange);
    socket.on("producto.actualizado", handleProductosChange);
    socket.on("producto.eliminado", handleProductosChange);
    socket.on("precio.actualizado", handleProductosChange);
    socket.on("inventario.actualizado", () => {
      console.info("[Socket.IO] Inventario actualizado -> Invalidando productos e inventario");
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["reportes-inventario"] });
    });

    // --- 2. Eventos de Clientes ---
    const handleClientesChange = () => {
      console.info("[Socket.IO] Evento de cliente recibido -> Invalidando cache de clientes");
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    };

    socket.on("cliente.creado", handleClientesChange);
    socket.on("cliente.actualizado", handleClientesChange);

    // --- 3. Eventos de Ventas / Dashboard ---
    const handleVentasChange = () => {
      console.info("[Socket.IO] Evento de venta recibido -> Invalidando ventas, productos y dashboard");
      queryClient.invalidateQueries({ queryKey: ["ventas"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reportes-ventas"] });
    };

    socket.on("venta.creada", handleVentasChange);
    socket.on("venta.anulada", handleVentasChange);
    socket.on("dashboard.actualizado", () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
