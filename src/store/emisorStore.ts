// src/store/emisorStore.ts
import { create } from "zustand";
import {
  perfilesTributariosService,
  type PerfilTributario,
} from "../services/perfiles-tributarios.service";

const STORAGE_KEY = "pos_emisor_activo_id";

interface EmisorState {
  perfiles: PerfilTributario[];
  emisorActivoId: string | null;
  cargando: boolean;
  error: string | null;

  cargarPerfiles: (forceRefresh?: boolean) => Promise<void>;
  setEmisorActivoId: (id: string) => void;
  getEmisorActivo: () => PerfilTributario | null;
}

export const useEmisorStore = create<EmisorState>((set, get) => ({
  perfiles: [],
  emisorActivoId: localStorage.getItem(STORAGE_KEY),
  cargando: false,
  error: null,

  cargarPerfiles: async (forceRefresh = false) => {
    const current = get().perfiles;
    if (current.length > 0 && !forceRefresh) return;

    set({ cargando: true, error: null });
    try {
      const perfiles = await perfilesTributariosService.listar();
      const perfilesActivos = perfiles.filter((p) => p.activo);

      let storedId = localStorage.getItem(STORAGE_KEY);
      const existsInList = perfilesActivos.some((p) => p.id === storedId);

      if (!existsInList) {
        const principal = perfilesActivos.find((p) => p.es_principal) || perfilesActivos[0];
        storedId = principal ? principal.id : null;
        if (storedId) {
          localStorage.setItem(STORAGE_KEY, storedId);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      set({
        perfiles: perfilesActivos,
        emisorActivoId: storedId,
        cargando: false,
      });
    } catch (err: any) {
      set({
        cargando: false,
        error: err?.response?.data?.message || err?.message || "Error al cargar emisores",
      });
    }
  },

  setEmisorActivoId: (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    set({ emisorActivoId: id });
  },

  getEmisorActivo: () => {
    const { perfiles, emisorActivoId } = get();
    if (!emisorActivoId) {
      return perfiles.find((p) => p.es_principal) || perfiles[0] || null;
    }
    return perfiles.find((p) => p.id === emisorActivoId) || perfiles[0] || null;
  },
}));
