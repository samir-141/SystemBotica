// src/components/productos/hooks/useCatalogos.ts
import { useState, useEffect, useCallback } from "react";
import { posApi } from "../../api/api.data";
import type { ItemCatalogo, TipoCatalogo } from "../types";

/* ── Catálogos que necesitamos en el formulario ───────── */
const CATALOGO_TIPOS: TipoCatalogo[] = [
  "principios-activos",
  "formas-farmaceuticas",
  "laboratorios",
  "categorias",
  "unidades-presentacion",
];

export type CatalogosMap = Record<TipoCatalogo, ItemCatalogo[]>;

/**
 * Hook que carga todos los catálogos maestros en paralelo.
 * Expone `refreshCatalogo(tipo)` para recargar uno tras crear un ítem nuevo.
 */
export function useCatalogos() {
  const [catalogos, setCatalogos] = useState<CatalogosMap>({
    "principios-activos": [],
    "formas-farmaceuticas": [],
    "laboratorios": [],
    "categorias": [],
    "unidades-presentacion": [],
  });
  const [loading, setLoading] = useState(true);

  /* carga inicial de todos los catálogos */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        CATALOGO_TIPOS.map((tipo) =>
          posApi
            .getCatalogo(tipo, { limit: 20, orden: "asc" })
            .then((res) => ({ tipo, items: res.data }))
            .catch(() => ({ tipo, items: [] as ItemCatalogo[] }))
        )
      );

      const map = { ...catalogos };
      results.forEach(({ tipo, items }) => {
        map[tipo] = items;
      });
      setCatalogos(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* refrescar un catálogo específico (ej: tras crear nuevo laboratorio) */
  const refreshCatalogo = useCallback(async (tipo: TipoCatalogo) => {
    try {
      const res = await posApi.getCatalogo(tipo, { limit: 20, orden: "asc" });
      setCatalogos((prev) => ({ ...prev, [tipo]: res.data }));
    } catch {
      /* silencioso — el select sigue mostrando los datos previos */
    }
  }, []);

  return { catalogos, loading, refreshCatalogo };
}
