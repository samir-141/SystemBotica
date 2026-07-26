// src/components/dashboard/utils/dashboardUtils.ts

/**
 * Enmascara números de DNI o RUC para cumplimiento de la Ley de Protección de Datos Personales.
 * Ejemplo: DNI "75582020" -> "75****20"
 * Ejemplo: RUC "10412345678" -> "10******78"
 */
export function enmascararDocumento(documento: string | null | undefined): string {
  if (!documento) return "Sin doc.";
  const cleaned = documento.trim();
  if (cleaned.length <= 4) return cleaned;

  const firstTwo = cleaned.slice(0, 2);
  const lastTwo = cleaned.slice(-2);
  const middleMask = "*".repeat(Math.max(2, cleaned.length - 4));

  return `${firstTwo}${middleMask}${lastTwo}`;
}

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
