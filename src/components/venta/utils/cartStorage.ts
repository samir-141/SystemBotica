// src/components/venta/utils/cartStorage.ts
import { get, set, del } from "idb-keyval";
import type { ItemCarrito } from "../types";

const CART_STORAGE_KEY = "pos_farmacia_active_cart";
const BROADCAST_CHANNEL_NAME = "pos_farmacia_cart_sync";

let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (err) {
    console.warn("[CartSync] BroadcastChannel no disponible:", err);
  }
}

function isIDBAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window && window.indexedDB !== null;
}

/**
 * Guarda el carrito activo en IndexedDB (o localStorage como fallback).
 */
export async function guardarCarritoStorage(carrito: ItemCarrito[]): Promise<void> {
  try {
    if (isIDBAvailable()) {
      await set(CART_STORAGE_KEY, carrito);
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "CART_UPDATED", payload: carrito });
    }
  } catch (error) {
    console.error("[CartStorage] Error al guardar carrito:", error);
  }
}

/**
 * Carga el carrito guardado en IndexedDB (o localStorage como fallback).
 */
export async function cargarCarritoStorage(): Promise<ItemCarrito[]> {
  try {
    if (isIDBAvailable()) {
      const carritoGuardado = await get<ItemCarrito[]>(CART_STORAGE_KEY);
      return Array.isArray(carritoGuardado) ? carritoGuardado : [];
    } else if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  } catch (error) {
    console.error("[CartStorage] Error al cargar carrito:", error);
    return [];
  }
}

/**
 * Limpia el carrito en almacenamiento persistente y notifica a otras pestañas.
 */
export async function limpiarCarritoStorage(): Promise<void> {
  try {
    if (isIDBAvailable()) {
      await del(CART_STORAGE_KEY);
    }
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "CART_UPDATED", payload: [] });
    }
  } catch (error) {
    console.error("[CartStorage] Error al limpiar carrito:", error);
  }
}

/**
 * Suscribe a actualizaciones en vivo del carrito desde otras pestañas del navegador.
 */
export function suscribirCambiosCarrito(onUpdate: (carrito: ItemCarrito[]) => void): () => void {
  if (!broadcastChannel) return () => {};

  const listener = (event: MessageEvent) => {
    if (event.data && event.data.type === "CART_UPDATED" && Array.isArray(event.data.payload)) {
      onUpdate(event.data.payload);
    }
  };

  broadcastChannel.addEventListener("message", listener);
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", listener);
    }
  };
}
