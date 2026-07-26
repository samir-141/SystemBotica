import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCart } from "../useCart";

describe("Hook useCart con Persistencia", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("alert", vi.fn());
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  const productoMock = {
    producto_comercial_id: "prod-101",
    nombre_comercial: "Ibuprofeno 400mg",
    precio_actual: 15.0,
    stock_total: 10,
    lote_fefo_numero: "LOT-IBU-1",
    lote_fefo_vencimiento: "2028-01-01",
  };

  it("debe inicializar con un carrito vacío y montos en cero", async () => {
    let hookResult: any;
    await act(async () => {
      const { result } = renderHook(() => useCart());
      hookResult = result;
    });

    expect(hookResult.current.carrito).toEqual([]);
    expect(hookResult.current.totalItems).toBe(0);
    expect(hookResult.current.montoBrutoFinal).toBe(0);
    expect(hookResult.current.baseImponible).toBe(0);
    expect(hookResult.current.igvCalculado).toBe(0);
  });

  it("debe agregar un producto correctamente al carrito y actualizar totales", async () => {
    let hookResult: any;
    await act(async () => {
      const { result } = renderHook(() => useCart());
      hookResult = result;
    });

    await act(async () => {
      hookResult.current.agregarAlCarrito(productoMock);
    });

    expect(hookResult.current.carrito).toHaveLength(1);
    expect(hookResult.current.carrito[0].nombre_comercial).toBe("Ibuprofeno 400mg");
    expect(hookResult.current.carrito[0].cantidad).toBe(1);
    expect(hookResult.current.totalItems).toBe(1);
    expect(hookResult.current.montoBrutoFinal).toBe(15.0);
  });

  it("debe incrementar la cantidad si el producto ya existe en el carrito", async () => {
    let hookResult: any;
    await act(async () => {
      const { result } = renderHook(() => useCart());
      hookResult = result;
    });

    await act(async () => {
      hookResult.current.agregarAlCarrito(productoMock);
    });
    await act(async () => {
      hookResult.current.agregarAlCarrito(productoMock);
    });

    expect(hookResult.current.carrito).toHaveLength(1);
    expect(hookResult.current.carrito[0].cantidad).toBe(2);
    expect(hookResult.current.totalItems).toBe(2);
    expect(hookResult.current.montoBrutoFinal).toBe(30.0);
  });

  it("debe prevenir el agregado si se supera el stock disponible", async () => {
    let hookResult: any;
    const productoStockBajo = { ...productoMock, stock_total: 1 };

    await act(async () => {
      const { result } = renderHook(() => useCart());
      hookResult = result;
    });

    await act(async () => {
      hookResult.current.agregarAlCarrito(productoStockBajo);
    });
    expect(hookResult.current.carrito[0].cantidad).toBe(1);

    await act(async () => {
      hookResult.current.agregarAlCarrito(productoStockBajo);
    });

    expect(globalThis.alert).toHaveBeenCalledWith("Stock insuficiente. Disponible: 1");
    expect(hookResult.current.carrito[0].cantidad).toBe(1);
  });

  it("debe actualizar la cantidad correctamente y remover el ítem si se establece en cero", async () => {
    let hookResult: any;
    await act(async () => {
      const { result } = renderHook(() => useCart());
      hookResult = result;
    });

    await act(async () => {
      hookResult.current.agregarAlCarrito(productoMock);
    });

    const idCarrito = hookResult.current.carrito[0].id_carrito;

    await act(async () => {
      hookResult.current.actualizarCantidad(idCarrito, 5);
    });
    expect(hookResult.current.carrito[0].cantidad).toBe(5);
    expect(hookResult.current.montoBrutoFinal).toBe(75.0);

    await act(async () => {
      hookResult.current.actualizarCantidad(idCarrito, 0);
    });
    expect(hookResult.current.carrito).toHaveLength(0);
    expect(hookResult.current.totalItems).toBe(0);
  });
});
