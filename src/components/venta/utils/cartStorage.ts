// src/components/venta/utils/cartStorage.ts
import { get, set, del } from "idb-keyval";
import type { ItemCarrito } from "../types";

const LEGACY_CART_STORAGE_KEY = "pos_farmacia_active_cart";
const BROADCAST_CHANNEL_NAME = "pos_farmacia_cart_sync";

export interface CartScope {
  usuarioId: string;
  boticaId: string;
  sucursalId: string;
}

const DEFAULT_SCOPE: CartScope = {
  usuarioId: "anonimo",
  boticaId: "sin-botica",
  sucursalId: "sin-sucursal",
};

const normalizarParte = (value: string | null | undefined, fallback: string) =>
  encodeURIComponent(String(value || fallback).trim().toLowerCase());

export function obtenerClaveCarrito(scope: CartScope = DEFAULT_SCOPE): string {
  return [
    LEGACY_CART_STORAGE_KEY,
    normalizarParte(scope.boticaId, DEFAULT_SCOPE.boticaId),
    normalizarParte(scope.sucursalId, DEFAULT_SCOPE.sucursalId),
    normalizarParte(scope.usuarioId, DEFAULT_SCOPE.usuarioId),
  ].join(":");
}

let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (err) {
    console.warn("[CartSync] BroadcastChannel no disponible:", err);
  }
}

function isIDBAvailable(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.indexedDB !== "undefined" &&
      window.indexedDB !== null
    );
  } catch {
    return false;
  }
}

/**
 * Guarda el carrito activo en IndexedDB (o localStorage como fallback).
 */
export async function guardarCarritoStorage(
  carrito: ItemCarrito[],
  scope: CartScope = DEFAULT_SCOPE,
): Promise<void> {
  try {
    const storageKey = obtenerClaveCarrito(scope);
    if (isIDBAvailable()) {
      await set(storageKey, carrito);
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(carrito));
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "CART_UPDATED", storageKey, payload: carrito });
    }
  } catch (error) {
    console.error("[CartStorage] Error al guardar carrito:", error);
  }
}

/**
 * Carga el carrito guardado en IndexedDB (o localStorage como fallback).
 */
export async function cargarCarritoStorage(scope: CartScope = DEFAULT_SCOPE): Promise<ItemCarrito[]> {
  try {
    const storageKey = obtenerClaveCarrito(scope);
    // El carrito histórico no tenía propietario ni sucursal. No se migra para
    // evitar que otra sesión herede una venta preparada por un usuario distinto.
    if (isIDBAvailable()) {
      await del(LEGACY_CART_STORAGE_KEY);
    }
    if (typeof localStorage !== "undefined") localStorage.removeItem(LEGACY_CART_STORAGE_KEY);

    if (isIDBAvailable()) {
      const carritoGuardado = await get<ItemCarrito[]>(storageKey);
      return Array.isArray(carritoGuardado) ? carritoGuardado : [];
    } else if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(storageKey);
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
export async function limpiarCarritoStorage(scope: CartScope = DEFAULT_SCOPE): Promise<void> {
  try {
    const storageKey = obtenerClaveCarrito(scope);
    if (isIDBAvailable()) {
      await del(storageKey);
    }
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: "CART_UPDATED", storageKey, payload: [] });
    }
  } catch (error) {
    console.error("[CartStorage] Error al limpiar carrito:", error);
  }
}

/**
 * Suscribe a actualizaciones en vivo del carrito desde otras pestañas del navegador.
 */
export function suscribirCambiosCarrito(
  scope: CartScope,
  onUpdate: (carrito: ItemCarrito[]) => void,
): () => void {
  if (!broadcastChannel) return () => {};
  const storageKey = obtenerClaveCarrito(scope);

  const listener = (event: MessageEvent) => {
    if (
      event.data?.type === "CART_UPDATED" &&
      event.data.storageKey === storageKey &&
      Array.isArray(event.data.payload)
    ) {
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
