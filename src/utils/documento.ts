// src/utils/documento.ts
// Utilidades para el tratamiento de documentos de identidad (DNI / RUC).

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