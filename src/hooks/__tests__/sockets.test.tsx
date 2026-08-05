import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SocketProvider } from "../../contexts/SocketContext";
import { useRemoteScannerSocket } from "../useRemoteScannerSocket";

const harness = vi.hoisted(() => {
  type Handler = (...args: any[]) => void;
  const sockets: any[] = [];
  const io = vi.fn(() => {
    const handlers = new Map<string, Handler[]>();
    const managerHandlers = new Map<string, Handler[]>();
    const socket: any = {
      connected: false,
      handlers,
      emitted: [] as Array<{ event: string; args: any[] }>,
      ackByEvent: {} as Record<string, any>,
      io: {
        on: vi.fn((event: string, handler: Handler) => {
          managerHandlers.set(event, [...(managerHandlers.get(event) || []), handler]);
          return socket.io;
        }),
      },
      on: vi.fn((event: string, handler: Handler) => {
        handlers.set(event, [...(handlers.get(event) || []), handler]);
        return socket;
      }),
      emit: vi.fn((event: string, ...args: any[]) => {
        socket.emitted.push({ event, args });
        const ack = args.at(-1);
        if (typeof ack === "function" && event in socket.ackByEvent) ack(socket.ackByEvent[event]);
        return socket;
      }),
      connect: vi.fn(() => {
        socket.connected = true;
        (handlers.get("connect") || []).forEach((handler) => handler());
        return socket;
      }),
      disconnect: vi.fn(() => {
        socket.connected = false;
        return socket;
      }),
      trigger(event: string, ...args: any[]) {
        if (event === "connect") socket.connected = true;
        (handlers.get(event) || []).forEach((handler) => handler(...args));
      },
    };
    sockets.push(socket);
    return socket;
  });
  return { io, sockets };
});

let authState: any;

vi.mock("socket.io-client", () => ({ io: harness.io }));
vi.mock("../useAuth", () => ({ useAuth: () => authState }));

function authenticated() {
  return {
    token: "jwt-seguro",
    isAuthenticated: true,
    isLoading: false,
    user: { id: "usuario-1", nombre: "Caja", correo: "caja@local", rol: "CAJERO" },
    sucursalActual: { id: "sucursal-1", nombre: "Principal", es_principal: true },
  };
}

describe("sockets autenticados y scanner remoto", () => {
  beforeEach(() => {
    harness.io.mockClear();
    harness.sockets.length = 0;
    authState = { token: null, isAuthenticated: false, isLoading: false, user: null, sucursalActual: null };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("no crea un cliente scanner sin token", () => {
    const { result } = renderHook(() => useRemoteScannerSocket(undefined, null, "pc", true));

    expect(harness.io).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/^401/);
  });

  it("autentica el namespace y acepta únicamente el código creado por el servidor", async () => {
    authState = authenticated();
    const { result } = renderHook(() => useRemoteScannerSocket(undefined, null, "pc", true));
    const socket = harness.sockets[0];
    socket.ackByEvent.create_session = {
      success: true,
      sessionCode: "CODIGO-SERVIDOR-CRIPTOGRAFICO",
      expiresAt: Date.now() + 300_000,
    };

    act(() => socket.trigger("connect"));

    await waitFor(() => expect(result.current.sessionCode).toBe("CODIGO-SERVIDOR-CRIPTOGRAFICO"));
    expect(harness.io).toHaveBeenCalledWith(expect.stringMatching(/\/escanner$/), expect.objectContaining({
      auth: { token: "jwt-seguro" },
    }));
    expect(socket.emitted.some((entry: any) => entry.event === "create_session")).toBe(true);
  });

  it("marca la sesión como expirada al cumplir el TTL del servidor", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T10:00:00Z"));
    authState = authenticated();
    const { result } = renderHook(() => useRemoteScannerSocket(undefined, null, "pc", true));
    const socket = harness.sockets[0];
    socket.ackByEvent.create_session = {
      success: true,
      sessionCode: "TEMPORAL-SERVIDOR",
      expiresAt: Date.now() + 1_000,
    };

    act(() => socket.trigger("connect"));
    await act(async () => { await vi.advanceTimersByTimeAsync(1_001); });

    expect(result.current.expired).toBe(true);
    expect(result.current.error).toMatch(/expiró/i);

    socket.ackByEvent.create_session = {
      success: true,
      sessionCode: "NUEVA-SESION-SERVIDOR",
      expiresAt: Date.now() + 300_000,
    };
    act(() => result.current.renewSession());
    expect(result.current.sessionCode).toBe("NUEVA-SESION-SERVIDOR");
    expect(result.current.expired).toBe(false);
  });

  it("muestra 403 cuando el servidor rechaza el móvil por pertenecer a otra botica", async () => {
    authState = authenticated();
    const { result } = renderHook(() => useRemoteScannerSocket(undefined, "CODIGO-OTRA-BOTICA", "phone", true));
    const socket = harness.sockets[0];
    socket.ackByEvent.join_session = { success: false, error: "Sesión de otra botica" };

    act(() => socket.trigger("connect"));

    await waitFor(() => expect(result.current.error).toMatch(/^403/));
    expect(result.current.paired).toBe(false);
  });

  it("mantiene cero sockets globales antes del login y exactamente uno después de autenticar", async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <SocketProvider>{children}</SocketProvider>
      </QueryClientProvider>
    );
    const view = render(<div>contenido</div>, { wrapper: Wrapper });
    expect(harness.io).not.toHaveBeenCalled();

    authState = authenticated();
    view.rerender(<div>contenido autenticado</div>);

    await waitFor(() => expect(harness.io).toHaveBeenCalledTimes(1));
    expect(harness.io).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ auth: { token: "jwt-seguro" } }));

    act(() => harness.sockets[0].trigger("venta.creada", { venta_id: "venta-1" }));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["ventas"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["productos"] });
  });
});
