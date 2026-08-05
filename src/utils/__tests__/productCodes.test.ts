// src/utils/__tests__/productCodes.test.ts
import { describe, it, expect } from "vitest";
import {
  generateSkuSuggestion,
  normalizeProductText,
  extractRelevantWords,
} from "../productCodes";

describe("normalizeProductText", () => {
  it("convierte a mayúsculas, quita tildes y símbolos", () => {
    expect(normalizeProductText("Café Puro 250 g")).toBe("CAFE PURO 250 G");
    expect(normalizeProductText("Coca-Cola 3 L")).toBe("COCA COLA 3 L");
  });

  it("colapsa espacios sobrantes", () => {
    expect(normalizeProductText("  Agua   Cielo  625  ml  ")).toBe(
      "AGUA CIELO 625 ML",
    );
  });
});

describe("extractRelevantWords", () => {
  it("omite palabras genéricas y artículos", () => {
    expect(extractRelevantWords("Agua Cielo")).toEqual(["CIELO"]);
    expect(extractRelevantWords("Papas Lays")).toEqual(["LAYS"]);
  });

  it("devuelve un arreglo vacío si todas las palabras son genéricas", () => {
    expect(extractRelevantWords("Producto de unidad")).toEqual([]);
  });
});

describe("generateSkuSuggestion", () => {
  it.each([
    { input: "Agua Cielo 625 ml", expected: "CIE-625ML" },
    { input: "Agua San Luis 625 ml", expected: "SL-625ML" },
    { input: "Agua San Mateo 2.5 L", expected: "SM-25L" },
    { input: "Coca Cola 3 L", expected: "COC-3L" },
    { input: "Inca Kola 1.5 L", expected: "INC-15L" },
    { input: "Papas Lays 40 g", expected: "LAY-40G" },
    { input: "Paracetamol 500 mg", expected: "PAR-500MG" },
    { input: "Panadol Forte 500 mg", expected: "PAN-500MG" },
    { input: "Ibuprofeno 400 mg", expected: "IBU-400MG" },
  ])("genera $expected para '$input'", ({ input, expected }) => {
    expect(generateSkuSuggestion({ nombreComercial: input })).toBe(expected);
  });

  it("usa cantidad y unidad explícitas cuando se proporcionan", () => {
    expect(
      generateSkuSuggestion({
        nombreComercial: "Paracetamol",
        cantidad: 500,
        unidadMedida: "mg",
      }),
    ).toBe("PAR-500MG");
  });

  it("genera SKU sin guiones cuando no hay cantidad", () => {
    expect(generateSkuSuggestion({ nombreComercial: "Coca Cola" })).toBe(
      "COC",
    );
  });

  it("normaliza nombres con tildes y símbolos", () => {
    expect(generateSkuSuggestion({ nombreComercial: "Café Puro 250 g" })).toBe(
      "CAF-250G",
    );
  });

  it("no genera basura si el nombre está vacío", () => {
    expect(generateSkuSuggestion({ nombreComercial: "" })).toBe("");
  });

  it("usa laboratorio como respaldo cuando el nombre es genérico", () => {
    expect(
      generateSkuSuggestion({
        nombreComercial: "Producto de unidad",
        laboratorioNombre: "Genfar",
      }),
    ).toBe("GEN");
  });
});
