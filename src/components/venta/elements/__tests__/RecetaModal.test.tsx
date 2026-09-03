import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RecetaModal from "../RecetaModal";

describe("RecetaModal", () => {
  it("no se muestra cuando open es false", () => {
    const { container } = render(
      <RecetaModal
        open={false}
        nombreProducto="Amoxicilina 500 mg"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza correctamente para un producto específico", () => {
    render(
      <RecetaModal
        open={true}
        nombreProducto="Amoxicilina 500 mg"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText("Receta Médica Obligatoria")).toBeInTheDocument();
    expect(screen.getByText("Amoxicilina 500 mg")).toBeInTheDocument();
    expect(
      screen.getByText("Recordar para toda esta venta (Recomendado)")
    ).toBeInTheDocument();
  });

  it("muestra error si se intenta enviar vacío", () => {
    const onConfirm = vi.fn();
    render(
      <RecetaModal
        open={true}
        nombreProducto="Amoxicilina 500 mg"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Confirmar y Aplicar/i });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText("El número de receta médica o CMP es obligatorio.")
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("llama onConfirm con el valor y recordarParaVenta = true por defecto", () => {
    const onConfirm = vi.fn();
    render(
      <RecetaModal
        open={true}
        nombreProducto="Amoxicilina 500 mg"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const input = screen.getByPlaceholderText(/Ej. REC-2026-84920/i);
    fireEvent.change(input, { target: { value: "REC-2026-8899" } });

    const submitBtn = screen.getByRole("button", { name: /Confirmar y Aplicar/i });
    fireEvent.click(submitBtn);

    expect(onConfirm).toHaveBeenCalledWith("REC-2026-8899", true);
  });

  it("permite desmarcar la casilla de recordar para la venta", () => {
    const onConfirm = vi.fn();
    render(
      <RecetaModal
        open={true}
        nombreProducto="Amoxicilina 500 mg"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const input = screen.getByPlaceholderText(/Ej. REC-2026-84920/i);
    fireEvent.change(input, { target: { value: "REC-1234" } });

    const toggleCheckbox = screen.getByText("Recordar para toda esta venta (Recomendado)");
    fireEvent.click(toggleCheckbox);

    const submitBtn = screen.getByRole("button", { name: /Confirmar y Aplicar/i });
    fireEvent.click(submitBtn);

    expect(onConfirm).toHaveBeenCalledWith("REC-1234", false);
  });
});
