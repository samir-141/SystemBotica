import { describe, it, expect, beforeEach, vi } from "vitest";
import { guardarCarritoStorage, cargarCarritoStorage, limpiarCarritoStorage } from "../cartStorage";
import type { ItemCarrito } from "../../types";

// Mock de idb-keyval
const store = new Map<string, any>();

vi.mock("idb-keyval", () => ({
  set: vi.fn((key: string, val: any) => {
    store.set(key, val);
    return Promise.resolve();
  }),
  get: vi.fn((key: string) => Promise.resolve(store.get(key))),
  del: vi.fn((key: string) => {
    store.delete(key);
    return Promise.resolve();
  }),
}));

describe("Persistencia del Carrito (cartStorage)", () => {
  beforeEach(() => {
    store.clear();
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
    vi.clearAllMocks();
  });

  const cartMock: ItemCarrito[] = [
    {
      id_carrito: "prod1_Unidad",
      producto_comercial_id: "prod1",
      nombre_comercial: "Alcohol Gel 70%",
      presentacion_nombre: "Frasco 500ml",
      precio_unitario: 12.5,
      cantidad: 2,
      unidades_base_por_pack: 1,
      unidades_base_totales: 2,
      lote_fefo_numero: "LOT-ALC-1",
      lote_fefo_vencimiento: "2027-05-01",
    },
  ];

  it("debe guardar el carrito en almacenamiento persistente", async () => {
    await guardarCarritoStorage(cartMock);
    const resultado = await cargarCarritoStorage();
    expect(resultado).toEqual(cartMock);
  });

  it("debe retornar un array vacío si no hay carrito guardado", async () => {
    const resultado = await cargarCarritoStorage();
    expect(resultado).toEqual([]);
  });

  it("debe eliminar el carrito guardado al invocar limpiarCarritoStorage", async () => {
    await guardarCarritoStorage(cartMock);
    await limpiarCarritoStorage();
    const resultado = await cargarCarritoStorage();
    expect(resultado).toEqual([]);
  });
});
