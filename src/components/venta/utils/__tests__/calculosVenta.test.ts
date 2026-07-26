import { describe, it, expect } from "vitest";
import { calcularTotales, calcularVuelto, formatMoney } from "../calculosVenta";
import type { ItemCarrito } from "../../types";

describe("Cálculos Financieros de Ventas (calculosVenta)", () => {
  it("debe retornar 0 en todos los campos si el carrito está vacío", () => {
    const res = calcularTotales([]);
    expect(res.subtotalBruto).toBe(0);
    expect(res.descuentoTotal).toBe(0);
    expect(res.montoNetoFinal).toBe(0);
    expect(res.baseImponible).toBe(0);
    expect(res.igvCalculado).toBe(0);
  });

  it("debe calcular correctamente Subtotal, Base Imponible e IGV (18%) para un producto de S/ 118.00", () => {
    const carrito: ItemCarrito[] = [
      {
        id_carrito: "1_Unidad",
        producto_comercial_id: "1",
        nombre_comercial: "Paracetamol 500mg",
        presentacion_nombre: "Caja x 100",
        precio_unitario: 118,
        cantidad: 1,
        unidades_base_por_pack: 1,
        unidades_base_totales: 1,
        lote_fefo_numero: "LOT-100",
        lote_fefo_vencimiento: "2027-12-31",
      },
    ];

    const res = calcularTotales(carrito);
    expect(res.subtotalBruto).toBe(118);
    expect(res.montoNetoFinal).toBe(118);
    expect(res.baseImponible).toBe(100);
    expect(res.igvCalculado).toBe(18);
  });

  it("debe aplicar correctamente descuentos porcentuales y fijos sin exceder el subtotal", () => {
    const carrito: ItemCarrito[] = [
      {
        id_carrito: "2_Unidad",
        producto_comercial_id: "2",
        nombre_comercial: "Amoxicilina 500mg",
        presentacion_nombre: "Blister",
        precio_unitario: 100,
        cantidad: 2, // Subtotal 200
        unidades_base_por_pack: 1,
        unidades_base_totales: 2,
        lote_fefo_numero: "LOT-200",
        lote_fefo_vencimiento: "2026-10-10",
      },
    ];

    // Aplicar 10% de descuento (S/ 20) + S/ 10 fijo = S/ 30 descuento total -> Neto S/ 170
    const res = calcularTotales(carrito, 10, 10);
    expect(res.subtotalBruto).toBe(200);
    expect(res.descuentoTotal).toBe(30);
    expect(res.montoNetoFinal).toBe(170);
  });

  it("debe calcular el vuelto adecuadamente cuando el monto recibido es mayor o igual", () => {
    const resSuficiente = calcularVuelto(100, 75.50);
    expect(resSuficiente.suficiente).toBe(true);
    expect(resSuficiente.vuelto).toBe(24.50);

    const resExacto = calcularVuelto(50, 50);
    expect(resExacto.suficiente).toBe(true);
    expect(resExacto.vuelto).toBe(0);

    const resInsuficiente = calcularVuelto(40, 50);
    expect(resInsuficiente.suficiente).toBe(false);
    expect(resInsuficiente.vuelto).toBe(0);
  });

  it("debe formatear montos monetarios correctamente", () => {
    expect(formatMoney(15.5)).toBe("S/ 15.50");
    expect(formatMoney(0)).toBe("S/ 0.00");
    expect(formatMoney(NaN)).toBe("S/ 0.00");
    expect(formatMoney(10, "$")).toBe("$ 10.00");
  });
});
