import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../App";

vi.mock("primereact/api", () => ({
  PrimeReactProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("primereact/toast", () => ({ Toast: () => null }));
vi.mock("../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("../contexts/SocketContext", () => ({
  SocketProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("../components/notifications/RealtimeNotifications", () => ({
  default: () => null,
}));
vi.mock("../components/login/common/PrivateRoute", () => ({
  default: () => <Outlet />,
}));
vi.mock("../components/login/common/RoleRoute", () => ({
  default: () => <Outlet />,
}));
vi.mock("../pages/navegacion/Nav", () => ({ default: () => <Outlet /> }));
vi.mock("../pages/auth/Login", () => ({
  default: () => <div>LOGIN_LAZY_OK</div>,
}));
vi.mock("../pages/escanner/RemoteScannerPage", () => ({
  default: () => <div>SCANNER_LAZY_OK</div>,
}));
vi.mock("../components/dashboard/DashboardPage", () => ({
  default: () => <div>DASHBOARD_LAZY_OK</div>,
}));
vi.mock("../components/compras/ComprasPage", () => ({
  default: () => <div>COMPRAS_LAZY_OK</div>,
}));

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("rutas cargadas bajo demanda", () => {
  it.each([
    ["/login", "LOGIN_LAZY_OK"],
    ["/escanner-remoto?session=SERVER-CODE", "SCANNER_LAZY_OK"],
    ["/dashboard", "DASHBOARD_LAZY_OK"],
    ["/compras", "COMPRAS_LAZY_OK"],
  ])("resuelve %s mediante su módulo lazy", async (path, expected) => {
    window.history.replaceState({}, "", path);
    render(<App />);

    expect(await screen.findByText(expected)).toBeInTheDocument();
  });
});
