// src/components/productos/types.ts
import type { ProductoPOS, ItemCatalogo, TipoCatalogo } from "../api/api.data";

/* ── Tipo para filas de la tabla ──────────────────────── */
export type ProductoTableRow = ProductoPOS;

/* ── Datos del formulario crear/editar ────────────────── */
export interface ProductoFormData {
  producto_comercial_id?: string;
  nombre_comercial: string;
  sku: string;
  codigo_interno: string;
  principio_activo_id: string;
  forma_farmaceutica_id: string;
  laboratorio_id: string;
  categoria_id: string;
  concentracion: number | "";
  unidad_concentracion: string;
  via_administracion: string;
  requiere_receta: boolean;
  afecto_igv: boolean;
  presentacion_id: string;
  cantidad_unidad_base: number | "";
  precio_actual: number | "";
  codigo_barras: string;
}

/* ── Constantes de formulario ─────────────────────────── */
export const VIAS_ADMINISTRACION = [
  "Oral",
  "Tópica",
  "Intramuscular",
  "Intravenosa",
  "Subcutánea",
  "Rectal",
  "Oftálmica",
  "Ótica",
  "Nasal",
  "Inhalatoria",
  "Sublingual",
] as const;

export const UNIDADES_CONCENTRACION = [
  "mg",
  "g",
  "ml",
  "mcg",
  "UI",
  "%",
] as const;

/* ── Estado del formulario ────────────────────────────── */
export type FormMode = "crear" | "editar";

/* ── Mapa catálogo → label legible ────────────────────── */
export const CATALOGO_LABELS: Record<TipoCatalogo, string> = {
  "principios-activos": "Principio Activo",
  "formas-farmaceuticas": "Forma Farmacéutica",
  "laboratorios": "Laboratorio",
  "categorias": "Categoría",
  "unidades-presentacion": "Presentación",
};

/* ── Re-exports para conveniencia ─────────────────────── */
export type { ItemCatalogo, TipoCatalogo };
