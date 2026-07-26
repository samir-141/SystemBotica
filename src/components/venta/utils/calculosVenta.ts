// src/components/venta/utils/calculosVenta.ts
import type { ItemCarrito } from "../types";

export interface ResumenTotalesVenta {
  subtotalBruto: number;
  descuentoTotal: number;
  montoNetoFinal: number;
  baseImponible: number;
  igvCalculado: number;
}

export function formatMoney(amount: number, simbolo = "S/"): string {
  const safeAmount = isNaN(amount) || !isFinite(amount) ? 0 : amount;
  return `${simbolo} ${safeAmount.toFixed(2)}`;
}

export function calcularTotales(
  carrito: ItemCarrito[],
  descuentoGlobalPorcentaje = 0,
  descuentoGlobalFijo = 0,
  tasaIgv = 0.18
): ResumenTotalesVenta {
  const subtotalBruto = carrito.reduce(
    (acc, item) => acc + Math.max(0, item.precio_unitario) * Math.max(0, item.cantidad),
    0
  );

  let descuentoPorcentajeMonto = 0;
  if (descuentoGlobalPorcentaje > 0) {
    descuentoPorcentajeMonto = subtotalBruto * (Math.min(100, descuentoGlobalPorcentaje) / 100);
  }

  const descuentoTotal = Math.min(
    subtotalBruto,
    descuentoPorcentajeMonto + Math.max(0, descuentoGlobalFijo)
  );

  const montoNetoFinal = Math.max(0, subtotalBruto - descuentoTotal);
  const factorIgv = 1 + tasaIgv;
  const baseImponible = montoNetoFinal / factorIgv;
  const igvCalculado = montoNetoFinal - baseImponible;

  return {
    subtotalBruto: Number(subtotalBruto.toFixed(2)),
    descuentoTotal: Number(descuentoTotal.toFixed(2)),
    montoNetoFinal: Number(montoNetoFinal.toFixed(2)),
    baseImponible: Number(baseImponible.toFixed(2)),
    igvCalculado: Number(igvCalculado.toFixed(2)),
  };
}

export function calcularVuelto(montoRecibido: number, totalAPagar: number): { vuelto: number; suficiente: boolean } {
  const recibido = Math.max(0, montoRecibido);
  const pagar = Math.max(0, totalAPagar);
  const vuelto = Number((recibido - pagar).toFixed(2));

  return {
    vuelto: vuelto > 0 ? vuelto : 0,
    suficiente: recibido >= pagar,
  };
}
