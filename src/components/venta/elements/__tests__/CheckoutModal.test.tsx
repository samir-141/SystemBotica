import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutModal from "../CheckoutModal";
import {
  buildComprobanteSnapshot,
  buildVentaPayload,
  enlaceComprobante,
} from "../checkoutContract";
import { ventasService } from "../../../../services/ventas.service";
import { facturacionService } from "../../../../services/facturacion.service";
import type { ItemCarrito } from "../../types";

vi.mock("../../../../services/ventas.service", () => ({
  ventasService: {
    registrarVenta: vi.fn(),
    getSeriesDocumentos: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../../../services/facturacion.service", () => ({
  facturacionService: {
    emitir: vi.fn(),
    obtenerConfiguracion: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock("../../../../services/clientes.service", () => ({
  clientesService: {
    consultarDocumentoPadron: vi.fn(),
  },
}));

vi.mock("../../../reportes/elements/ImpresionComprobanteModal", () => ({
  default: () => null,
}));

const item: ItemCarrito = {
  id_carrito: "producto-1_presentacion-1",
  producto_presentacion_id: "11111111-1111-4111-8111-111111111111",
  producto_comercial_id: "22222222-2222-4222-8222-222222222222",
  nombre_comercial: "Producto de prueba",
  presentacion_nombre: "Unidad",
  precio_unitario: 10,
  cantidad: 2,
  unidades_base_por_pack: 1,
  unidades_base_totales: 2,
  stock_total: 20,
  lote_fefo_numero: "L-1",
  lote_fefo_vencimiento: "2028-01-01",
};

const respuestaCanonica = {
  exito: true,
  mensaje: "Venta registrada correctamente",
  venta_id: "33333333-3333-4333-8333-333333333333",
  subtotal: 25.42,
  igv: 4.58,
  total: 30,
  tipo_comprobante: "NOTA_VENTA",
  metodo_pago: "YAPE_PLIN",
  comprobante_url: "/c/token-prueba",
};

function renderCheckout() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CheckoutModal
        open
        onClose={vi.fn()}
        carrito={[item]}
        montoBrutoFinal={20}
        baseImponible={16.95}
        igvCalculado={3.05}
        tipoPago="CONTADO"
      />
    </QueryClientProvider>,
  );
}

async function avanzarYEmitirNota() {
  fireEvent.click(screen.getByRole("button", { name: /Nota de Venta/i }));
  fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
  fireEvent.click(screen.getByRole("button", { name: /Yape \/ Plin/i }));
  fireEvent.click(screen.getByRole("button", { name: /Confirmar y emitir/i }));
}

describe("CheckoutModal - contrato canónico de venta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envía IDs y cantidad sin confiar precios ni totales calculados en el navegador", () => {
    const payload = buildVentaPayload({
      idempotencyKey: "44444444-4444-4444-8444-444444444444",
      tipoComprobante: "NOTA_VENTA",
      tipoPago: "CONTADO",
      metodoPago: "YAPE_PLIN",
      montoRecibido: "",
      datosCliente: { tipo_documento: "NINGUNO", numero_documento: "", nombre_razon_social: "", direccion: "" },
      carrito: [item],
    });

    expect(payload.idempotency_key).toBe("44444444-4444-4444-8444-444444444444");
    expect(payload.items).toEqual([{
      producto_presentacion_id: item.producto_presentacion_id,
      producto_comercial_id: item.producto_comercial_id,
      presentacion_nombre: "Unidad",
      cantidad: 2,
    }]);
    expect(payload).not.toHaveProperty("subtotal");
    expect(payload).not.toHaveProperty("igv");
    expect(payload).not.toHaveProperty("total");
    expect(payload.items[0]).not.toHaveProperty("precio_unitario");
  });

  it("construye el comprobante con los totales canónicos devueltos por el backend", () => {
    const snapshot = buildComprobanteSnapshot({
      venta: respuestaCanonica,
      tipoComprobante: "NOTA_VENTA",
      datosCliente: { tipo_documento: "NINGUNO", numero_documento: "", nombre_razon_social: "", direccion: "" },
      carrito: [item],
      metodoPago: "YAPE_PLIN",
      montoRecibido: "",
    });

    expect(snapshot).toMatchObject({ subtotal: 25.42, igv: 4.58, total: 30 });
    expect(snapshot.total).not.toBe(20);
  });

  it("rechaza un carrito legado que perdió el ID de presentación", () => {
    expect(() => buildVentaPayload({
      idempotencyKey: "44444444-4444-4444-8444-444444444444",
      tipoComprobante: "NOTA_VENTA",
      tipoPago: "CONTADO",
      metodoPago: "YAPE_PLIN",
      montoRecibido: "",
      datosCliente: { tipo_documento: "NINGUNO", numero_documento: "", nombre_razon_social: "", direccion: "" },
      carrito: [{ ...item, producto_presentacion_id: "" }],
    })).toThrow(/Retíralo del carrito y vuelve a seleccionarlo/i);
  });

  it("construye el enlace desde el token si el backend no devuelve una URL", () => {
    const link = enlaceComprobante(null, "token con espacios");
    expect(link?.url).toContain("/c/token%20con%20espacios");
  });

  it("reutiliza la clave del mismo checkout al reintentar y no emite un comprobante secundario", async () => {
    vi.mocked(ventasService.registrarVenta)
      .mockRejectedValueOnce(new Error("corte temporal"))
      .mockResolvedValueOnce(respuestaCanonica);
    renderCheckout();

    await avanzarYEmitirNota();
    await screen.findByText(/corte temporal/i);
    fireEvent.click(screen.getByRole("button", { name: /Confirmar y emitir/i }));
    await screen.findByText(/Venta Registrada/i);

    const primerPayload = vi.mocked(ventasService.registrarVenta).mock.calls[0][0];
    const segundoPayload = vi.mocked(ventasService.registrarVenta).mock.calls[1][0];
    expect(segundoPayload.idempotency_key).toBe(primerPayload.idempotency_key);
    expect(facturacionService.emitir).not.toHaveBeenCalled();
  });

  it("muestra el error real de comprobante sin revertir una venta ya registrada", async () => {
    vi.mocked(ventasService.registrarVenta).mockResolvedValue({
      ...respuestaCanonica,
      tipo_comprobante: "BOLETA",
      comprobante_url: null,
      comprobante_estado: "ERROR",
      comprobante_error: "SUNAT rechazó temporalmente el documento",
    });
    renderCheckout();

    await avanzarYEmitirNota();
    await waitFor(() => expect(screen.getByText(/SUNAT rechazó temporalmente/i)).toBeInTheDocument());
    expect(screen.getByText(/Venta Registrada/i)).toBeInTheDocument();
    expect(facturacionService.emitir).not.toHaveBeenCalled();
  });

  it("no ofrece WhatsApp cuando el comprobante solo tiene una URL local", async () => {
    vi.mocked(ventasService.registrarVenta).mockResolvedValue(respuestaCanonica);
    renderCheckout();

    await avanzarYEmitirNota();

    expect(await screen.findByRole("button", { name: /Copiar enlace local/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Compartir WhatsApp/i })).not.toBeInTheDocument();
    expect(screen.getByText(/solo es accesible en la red local/i)).toBeInTheDocument();
  });
});
