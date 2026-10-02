import { describe, it, expect, vi } from "vitest";
import { toast } from "../toast";
import { sileo } from "sileo";

vi.mock("sileo", () => ({
  sileo: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    action: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
    clear: vi.fn(),
  },
  Toaster: () => null,
}));

describe("toast utility backed by Sileo", () => {
  it("invokes sileo.success with title and description", () => {
    toast.success("Venta completada", "Total S/ 25.00");
    expect(sileo.success).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Venta completada",
        description: "Total S/ 25.00",
      })
    );
  });

  it("invokes sileo.error with title and description", () => {
    toast.error("Error SUNAT", "Servidor no disponible");
    expect(sileo.error).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error SUNAT",
        description: "Servidor no disponible",
      })
    );
  });

  it("handles compatibility method toast.show", () => {
    toast.show({ severity: "warn", summary: "Alerta stock", detail: "Quedan 2 unidades" });
    expect(sileo.warning).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Alerta stock",
        description: "Quedan 2 unidades",
      })
    );

    toast.show({ severity: "info", summary: "Información", detail: "Turno abierto" });
    expect(sileo.info).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Información",
        description: "Turno abierto",
      })
    );
  });
});
