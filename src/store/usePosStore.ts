// src/store/usePosStore.ts
// Store Global con Zustand (Sección 12 del Documento de Arquitectura)
// Maneja únicamente estado global de UI/Aplicación (Usuario, Caja, Sucursal, Tema, Filtros)

import { create } from "zustand";

interface UsuarioStore {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
}

interface SucursalStore {
  id: string;
  nombre: string;
  empresa: string;
  es_principal?: boolean;
}

interface PosState {
  // --- Usuario y Autenticación ---
  usuario: UsuarioStore | null;
  setUsuario: (usuario: UsuarioStore | null) => void;

  // --- Sucursal Activa ---
  sucursalActual: SucursalStore | null;
  setSucursalActual: (sucursal: SucursalStore | null) => void;
  sucursalesDisponibles: SucursalStore[];
  setSucursalesDisponibles: (sucursales: SucursalStore[]) => void;

  // --- Estado de Caja POS ---
  cajaAbierta: boolean;
  cajaId: string | null;
  setCajaStatus: (abierta: boolean, id?: string | null) => void;

  // --- Tema y Preferencias de UI ---
  tema: "dark" | "light";
  toggleTema: () => void;

  // --- Filtros UI ---
  busquedaGlobal: string;
  setBusquedaGlobal: (q: string) => void;
  filtroCategoria: string | null;
  setFiltroCategoria: (cat: string | null) => void;

  // --- Dispositivo y Sesión Distribuida (Documento 00 Sección 9/10) ---
  dispositivoRol: "principal" | "asistente";
  setDispositivoRol: (rol: "principal" | "asistente") => void;
  sessionCode: string | null;
  setSessionCode: (code: string | null) => void;
}

export const usePosStore = create<PosState>((set) => ({
  usuario: null,
  setUsuario: (usuario) => set({ usuario }),

  sucursalActual: null,
  setSucursalActual: (sucursalActual) => set({ sucursalActual }),
  sucursalesDisponibles: [],
  setSucursalesDisponibles: (sucursalesDisponibles) => set({ sucursalesDisponibles }),

  cajaAbierta: true,
  cajaId: null,
  setCajaStatus: (cajaAbierta, cajaId = null) => set({ cajaAbierta, cajaId }),

  tema: "dark",
  toggleTema: () => set((state) => ({ tema: state.tema === "dark" ? "light" : "dark" })),

  busquedaGlobal: "",
  setBusquedaGlobal: (busquedaGlobal) => set({ busquedaGlobal }),
  filtroCategoria: null,
  setFiltroCategoria: (filtroCategoria) => set({ filtroCategoria }),

  dispositivoRol: "principal",
  setDispositivoRol: (dispositivoRol) => set({ dispositivoRol }),
  sessionCode: null,
  setSessionCode: (sessionCode) => set({ sessionCode }),
}));
