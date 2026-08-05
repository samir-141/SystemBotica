import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReabastecerModal from "../ReabastecerModal";

vi.mock("../../../api/api.data", () => ({
  posApi: {
    getProductoDetalle: vi.fn(() => Promise.resolve({
      nombre_comercial: "Producto prueba",
      sku: "PRUEBA-1",
      controla_lote: true,
      requiere_vencimiento: true,
      lotes: [],
      presentaciones: [],
    })),
  },
}));

describe("ReabastecerModal accesible", () => {
  afterEach(() => vi.restoreAllMocks());

  it("expone un diálogo, cierra con Escape y restaura el foco", async () => {
    const onClose = vi.fn();
    const trigger = document.createElement("button");
    trigger.textContent = "Abrir stock";
    document.body.appendChild(trigger);
    trigger.focus();

    const view = render(
      <ReabastecerModal
        open
        onClose={onClose}
        producto={{ id: "producto-1", nombre_comercial: "Producto prueba", controla_lote: true, requiere_vencimiento: true }}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Reabastecer stock de lote" })).toHaveAttribute("aria-modal", "true");
    const closeButton = screen.getByRole("button", { name: "Cerrar ingreso de stock" });
    await waitFor(() => expect(closeButton).toHaveFocus());

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    view.unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
