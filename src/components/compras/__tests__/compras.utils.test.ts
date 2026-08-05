import { describe, expect, it } from "vitest";
import type { ProductoPOS } from "../../../types/api.types";
import {
  calcularTotales,
  estadoLotePorVencimiento,
  lotesConFechaVencimiento,
  mensajeCompraError,
  type CompraLineDraft,
  type LoteExistente,
} from "../compras.utils";

const linea: CompraLineDraft = {
  key: "1",
  productoId: "prod1",
  presentacionId: "p1",
  cantidad: "2",
  costoUnitario: "10",
  numeroLote: "L1",
  fechaFabricacion: "",
  fechaVencimiento: "2027-01-01",
};

describe("utilidades de compras", () => {
  it("estima importes con IGV solo para productos afectos", () => {
    const producto = {
      presentacion_id: "p1",
      afecto_igv: true,
    } as ProductoPOS;
    expect(calcularTotales([linea], [producto])).toEqual({
      subtotal: 20,
      igv: 3.6,
      total: 23.6,
    });
  });

  it("traduce errores de autorización y conflicto", () => {
    expect(mensajeCompraError({ status: 403 })).toContain("permiso");
    expect(mensajeCompraError({ status: 409, message: "Duplicado" })).toBe(
      "Duplicado",
    );
  });

  it("identifica un lote vencido según su fecha de vencimiento", () => {
    expect(
      estadoLotePorVencimiento("2026-07-01", "2026-08-02"),
    ).toEqual({ estado: "vencido", dias: -32 });
  });

  it("identifica un lote por vencer dentro de 90 días", () => {
    expect(
      estadoLotePorVencimiento("2026-09-15", "2026-08-02"),
    ).toEqual({ estado: "por_vencer", dias: 44 });
  });

  it("considera vigente un lote con vencimiento lejano o sin fecha", () => {
    expect(
      estadoLotePorVencimiento("2028-01-01", "2026-08-02"),
    ).toEqual({ estado: "vigente", dias: 517 });
    expect(estadoLotePorVencimiento("", "2026-08-02")).toEqual({
      estado: "vigente",
      dias: 0,
    });
  });

  it("identifica el lote que coincide con una fecha de vencimiento", () => {
    const lotes: LoteExistente[] = [
      { id: "l1", numero_lote: "A-01", fecha_fabricacion: "2026-06-01T00:00:00.000Z", fecha_vencimiento: "2026-12-31T00:00:00.000Z" },
      { id: "l2", numero_lote: "B-02", fecha_fabricacion: null, fecha_vencimiento: "2027-05-01T00:00:00.000Z" },
    ];
    expect(lotesConFechaVencimiento(lotes, "2026-12-31")).toEqual([lotes[0]]);
    expect(lotesConFechaVencimiento(lotes, "2030-01-01")).toEqual([]);
    expect(lotesConFechaVencimiento(lotes, "")).toEqual([]);
  });
});
