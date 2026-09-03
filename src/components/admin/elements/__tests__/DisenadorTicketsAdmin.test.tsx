import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import DisenadorTicketsAdmin from "../DisenadorTicketsAdmin";

vi.mock("../../../../hooks/useAuth", () => ({
  useAuth: () => ({
    sucursalActual: {
      botica_id: "botica-test-id",
      nombre: "Botica San Pedro",
      direccion: "Av. Principal 450",
      telefono: "987654321",
    },
  }),
}));

vi.mock("react-to-print", () => ({
  useReactToPrint: () => vi.fn(),
}));

vi.mock("../../../../services/api", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: null }),
    post: vi.fn().mockResolvedValue({ data: { ok: true } }),
  },
}));

describe("DisenadorTicketsAdmin", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renderiza correctamente las pestañas y el simulador en vivo", () => {
    render(<DisenadorTicketsAdmin />);

    expect(screen.getByText("Diseñador y Personalizador de Tickets (POS)")).toBeInTheDocument();
    expect(screen.getByText("Simulador en Tiempo Real")).toBeInTheDocument();
    expect(screen.getByText("Formato y Letra")).toBeInTheDocument();
    expect(screen.getByText("Logo e Imagen")).toBeInTheDocument();
    expect(screen.getByText("Textos y Mensajes")).toBeInTheDocument();
    expect(screen.getByText("Campos Visibles")).toBeInTheDocument();
  });

  it("permite cambiar entre pestañas de configuración", () => {
    render(<DisenadorTicketsAdmin />);

    // Cambiar a pestaña Logo
    fireEvent.click(screen.getByText("Logo e Imagen"));
    expect(screen.getByText("Mostrar Logotipo en el Ticket")).toBeInTheDocument();

    // Cambiar a pestaña Textos
    fireEvent.click(screen.getByText("Textos y Mensajes"));
    expect(screen.getByText("Nombre Comercial en Encabezado")).toBeInTheDocument();
    expect(screen.getByText("Eslogan o Subtítulo Superior")).toBeInTheDocument();

    // Cambiar a pestaña Campos Visibles
    fireEvent.click(screen.getByText("Campos Visibles"));
    expect(screen.getByText("Mostrar RUC de la Empresa")).toBeInTheDocument();
    expect(screen.getByText("Mostrar Código QR Tributario")).toBeInTheDocument();
  });

  it("permite alternar el formato del simulador entre 80mm y 58mm", () => {
    const { container } = render(<DisenadorTicketsAdmin />);

    const btn58 = screen.getByRole("button", { name: "58 mm" });
    fireEvent.click(btn58);

    expect(container.querySelector(".ticket-pos-58mm")).toBeInTheDocument();

    const btn80 = screen.getByRole("button", { name: "80 mm" });
    fireEvent.click(btn80);

    expect(container.querySelector(".ticket-pos-80mm")).toBeInTheDocument();
  });

  it("permite guardar la configuración en localStorage", () => {
    render(<DisenadorTicketsAdmin />);

    const saveBtn = screen.getByRole("button", { name: /Guardar Diseño/i });
    fireEvent.click(saveBtn);

    const saved = localStorage.getItem("marifarma_ticket_config_botica-test-id");
    expect(saved).not.toBeNull();
  });
});
