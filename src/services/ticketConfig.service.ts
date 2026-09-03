import { type TicketConfig, TICKET_CONFIG_DEFAULT } from "../types/ticketConfig";
import { api } from "./api";

const STORAGE_KEY_PREFIX = "marifarma_ticket_config_";

export const ticketConfigService = {
  /**
   * Obtiene la configuración inmediatamente desde el almacenamiento local
   */
  obtenerConfiguracion: (boticaId?: string): TicketConfig => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${boticaId || "default"}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        return { ...TICKET_CONFIG_DEFAULT, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("No se pudo cargar la configuración de tickets desde localStorage", e);
    }
    return { ...TICKET_CONFIG_DEFAULT };
  },

  /**
   * Sincroniza y descarga la configuración más reciente desde el backend
   */
  cargarConfiguracionRemota: async (boticaId?: string): Promise<TicketConfig> => {
    try {
      const response = await api.get<{ boticaId: string; config: TicketConfig | null }>("/storage/config");
      if (response.data?.config) {
        const fullConfig = { ...TICKET_CONFIG_DEFAULT, ...response.data.config };
        ticketConfigService.guardarLocal(fullConfig, boticaId);
        return fullConfig;
      }
    } catch (err) {
      console.warn("No se pudo obtener la configuración remota del servidor, usando local.", err);
    }
    return ticketConfigService.obtenerConfiguracion(boticaId);
  },

  /**
   * Guarda únicamente en local
   */
  guardarLocal: (config: TicketConfig, boticaId?: string): void => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${boticaId || "default"}`;
      localStorage.setItem(key, JSON.stringify(config));
    } catch (e) {
      console.error("Error al guardar en localStorage", e);
    }
  },

  /**
   * Guarda en local y sincroniza con el backend (DB y Supabase Storage)
   */
  guardarConfiguracion: async (config: TicketConfig, boticaId?: string): Promise<boolean> => {
    // 1. Guardado inmediato en cache local
    ticketConfigService.guardarLocal(config, boticaId);

    // 2. Sincronización con el servidor
    try {
      await api.post("/storage/config", config);
      return true;
    } catch (err) {
      console.warn("No se pudo sincronizar la configuración con el servidor backend.", err);
      return false;
    }
  },

  /**
   * Restablece la plantilla a valores por defecto
   */
  restablecerConfiguracion: async (boticaId?: string): Promise<TicketConfig> => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${boticaId || "default"}`;
      localStorage.removeItem(key);
      await api.post("/storage/config", TICKET_CONFIG_DEFAULT);
    } catch (e) {
      console.warn("Error al restablecer configuración", e);
    }
    return { ...TICKET_CONFIG_DEFAULT };
  },
};
