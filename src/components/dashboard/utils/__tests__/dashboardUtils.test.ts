import { describe, it, expect } from "vitest";
import {
  enmascararDocumento,
  calcularMargenBruto,
  calcularMarkup,
  esMargenAnomalo,
} from "../dashboardUtils";

describe("Utilidades del Dashboard (dashboardUtils)", () => {
  it("debe enmascarar un DNI de 8 dígitos mostrando solo los 2 primeros y 2 últimos", () => {
    expect(enmascararDocumento("75582020")).toBe("75****20");
    expect(enmascararDocumento("41234567")).toBe("41****67");
  });

  it("debe enmascarar un RUC de 11 dígitos adecuadamente", () => {
    expect(enmascararDocumento("10412345678")).toBe("10*******78");
  });

  it("debe manejar valores nulos o vacíos sin fallar", () => {
    expect(enmascararDocumento(null)).toBe("Sin doc.");
    expect(enmascararDocumento("")).toBe("Sin doc.");
    expect(enmascararDocumento("123")).toBe("123");
  });

  it("debe calcular el Margen Bruto sobre Ventas correctamente", () => {
    // Ventas 100, Costo 70 -> Margen = (30/100)*100 = 30%
    expect(calcularMargenBruto(100, 70)).toBe(30);
    // Ventas 87, Costo 60 -> Margen = (27/87)*100 = 31%
    expect(calcularMargenBruto(87, 60)).toBe(31);
    expect(calcularMargenBruto(0, 50)).toBe(0);
  });

  it("debe calcular el Markup sobre Costo adecuadamente", () => {
    // Ventas 150, Costo 100 -> Markup = (50/100)*100 = 50%
    expect(calcularMarkup(150, 100)).toBe(50);
  });

  it("debe identificar márgenes anómalos superiores al 60%", () => {
    expect(esMargenAnomalo(90.3)).toBe(true);
    expect(esMargenAnomalo(35.5)).toBe(false);
    expect(esMargenAnomalo(60.0)).toBe(false);
  });
});
