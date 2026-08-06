// src/components/dashboard/utils/dashboardUtils.ts
import { enmascararDocumento } from "../../../utils/documento";

export { enmascararDocumento };

/**
 * Calcula el Margen Bruto sobre Ventas: ((Ventas - Costo) / Ventas) * 100
 */
export function calcularMargenBruto(ventas: number, costo: number): number {
  if (ventas <= 0) return 0;
  const margen = ((ventas - costo) / ventas) * 100;
  return Number(margen.toFixed(1));
}

/**
 * Calcula el Markup sobre el Costo: ((Ventas - Costo) / Costo) * 100
 */
export function calcularMarkup(ventas: number, costo: number): number {
  if (costo <= 0) return 0;
  const markup = ((ventas - costo) / costo) * 100;
  return Number(markup.toFixed(1));
}

/**
 * Determina si el % de margen calculado es un dato anómalo para el sector farmacéutico (>60%).
 */
export function esMargenAnomalo(margenPct: number): boolean {
  return margenPct > 60;
}
