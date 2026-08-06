// src/utils/money.ts
// Utilidades monetarias centralizadas del POS.
//
// Antes existían dos implementaciones duplicadas de formatMoney con
// comportamiento distinto (una con símbolo, otra sin él). Se consolidan aquí
// ambas semánticas bajo nombres explícitos, conservando una sola fuente de
// verdad y sin cambiar los contratos de los consumidores.

/**
 * Formatea un monto con símbolo de moneda.
 * Ejemplo: formatMoney(10) -> "S/ 10.00"
 */
export function formatMoney(amount: number, simbolo = "S/"): string {
  const safeAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
  return `${simbolo} ${safeAmount.toFixed(2)}`;
}

/**
 * Formatea un número a dos decimales sin símbolo de moneda.
 * Se usa en tickets/impresión donde el símbolo se coloca aparte.
 * Ejemplo: formatMoneyPlain(10) -> "10.00"
 */
export function formatMoneyPlain(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "0.00";
  return value.toFixed(2);
}

/**
 * Formatea un valor con el símbolo SOL adelante (sin validación de finito,
 * pensado para impresión). Ejemplo: formatMoneyWithSymbol(10) -> "S/ 10.00".
 */
export function formatMoneyWithSymbol(value: number): string {
  return `S/ ${formatMoneyPlain(value)}`;
}