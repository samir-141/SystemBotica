import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../AuthContext";
import { useAuth } from "../auth-context";

vi.mock("../../components/venta/utils/cartStorage", () => ({
  limpiarCarritoStorage: vi.fn(() => Promise.resolve()),
}));

function EstadoSesion() {
  const { isAuthenticated, isLoading } = useAuth();
  return <span>{isLoading ? "cargando" : isAuthenticated ? "autenticado" : "anonimo"}</span>;
}

describe("AuthProvider", () => {
  beforeEach(() => localStorage.clear());

  it("descarta una sesión corrupta sin romper la aplicación", async () => {
    localStorage.setItem("token", "token-invalido");
    localStorage.setItem("user", "{json-corrupto");
    localStorage.setItem("sucursalActual", "{json-corrupto");

    render(<AuthProvider><EstadoSesion /></AuthProvider>);

    await waitFor(() => expect(screen.getByText("anonimo")).toBeInTheDocument());
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("sucursalActual")).toBeNull();
  });

  it("descarta JSON válido con una estructura de sesión inválida", async () => {
    localStorage.setItem("token", "token-invalido");
    localStorage.setItem("user", JSON.stringify({ correo: "sin-id@example.com" }));
    localStorage.setItem("sucursalActual", JSON.stringify({ nombre: "Sin identificador" }));

    render(<AuthProvider><EstadoSesion /></AuthProvider>);

    await waitFor(() => expect(screen.getByText("anonimo")).toBeInTheDocument());
    expect(localStorage.getItem("token")).toBeNull();
  });
});
