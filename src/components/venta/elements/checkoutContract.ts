import type { ComprobanteData } from "../../reportes/elements/comprobanteDocument";
import type { CreateVentaDto, EstadoComprobanteVenta, VentaRegistradaResponse } from "../../../types/dto";
import type { DatosCliente, ItemCarrito, MetodoPago, TipoComprobante } from "../types";
import { resolveReceiptLink, type ReceiptLink } from "../../../utils/networkUrls";

export function buildVentaPayload(opts: {
  idempotencyKey: string;
  tipoComprobante: TipoComprobante | null;
  tipoPago: "CONTADO" | "ABONO" | "ANTICIPO";
  metodoPago: MetodoPago;
  montoRecibido: string;
  datosCliente: DatosCliente;
  carrito: ItemCarrito[];
}): CreateVentaDto {
  if (!opts.tipoComprobante) {
    throw new Error("Selecciona un tipo de comprobante válido.");
  }
  const itemSinPresentacion = opts.carrito.find((item) => !item.producto_presentacion_id);
  if (itemSinPresentacion) {
    throw new Error(
      `La presentación de ${itemSinPresentacion.nombre_comercial} no es válida. Retíralo del carrito y vuelve a seleccionarlo.`,
    );
  }
  return {
    idempotency_key: opts.idempotencyKey,
    tipo_comprobante: opts.tipoComprobante,
    tipo_pago: opts.tipoPago,
    metodo_pago: opts.metodoPago,
    monto_recibido:
      opts.metodoPago === "EFECTIVO" && opts.montoRecibido
        ? parseFloat(opts.montoRecibido)
        : undefined,
    datos_cliente: opts.tipoComprobante !== "NOTA_VENTA" ? opts.datosCliente : undefined,
    items: opts.carrito.map((item) => ({
      producto_presentacion_id: item.producto_presentacion_id,
      producto_comercial_id: item.producto_comercial_id,
      presentacion_nombre: item.presentacion_nombre,
      cantidad: item.cantidad,
    })),
  };
}

export function buildComprobanteSnapshot(opts: {
  venta: VentaRegistradaResponse;
  tipoComprobante: TipoComprobante;
  datosCliente: DatosCliente;
  carrito: ItemCarrito[];
  metodoPago: MetodoPago;
  montoRecibido: string;
  configTributaria?: {
    ruc: string;
    razon_social: string;
    nombre_comercial: string | null;
    direccion_fiscal: string;
  } | null;
  sucursalActual?: {
    empresa: string;
    botica_ruc?: string;
    botica_direccion?: string;
    botica_telefono?: string;
  } | null;
}): ComprobanteData {
  const vuelto = Math.max(
    opts.metodoPago === "EFECTIVO" && opts.montoRecibido
      ? parseFloat(opts.montoRecibido) - opts.venta.total
      : 0,
    0,
  );

  // Datos de la empresa desde la configuración tributaria (base de datos) o sesión local
  const boticaData = opts.configTributaria
    ? {
        nombre: opts.configTributaria.nombre_comercial || opts.configTributaria.razon_social,
        ruc: opts.configTributaria.ruc,
        direccion: opts.configTributaria.direccion_fiscal,
        telefono: "",
      }
    : (opts.sucursalActual ? {
        nombre: opts.sucursalActual.empresa,
        ruc: opts.sucursalActual.botica_ruc || "",
        direccion: opts.sucursalActual.botica_direccion || "",
        telefono: opts.sucursalActual.botica_telefono || "",
      } : undefined);

  return {
    id: opts.venta.venta_id,
    tipoComprobante: opts.tipoComprobante,
    serieNumero: opts.venta.comprobante?.serie_numero || opts.venta.venta_id,
    fechaEmision: new Date().toISOString(),
    botica: boticaData,
    cliente: {
      nombre: opts.datosCliente.nombre_razon_social || "CLIENTE VARIOS",
      tipoDocumento: opts.datosCliente.tipo_documento || "DNI",
      numeroDocumento: opts.datosCliente.numero_documento || "",
      direccion: opts.datosCliente.direccion,
    },
    items: opts.carrito.map((item) => ({
      descripcion: item.nombre_comercial,
      presentacion: item.presentacion_nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precio_unitario,
      subtotal: item.precio_unitario * item.cantidad,
    })),
    subtotal: Number(opts.venta.subtotal),
    igv: Number(opts.venta.igv),
    total: Number(opts.venta.total),
    metodoPago: opts.venta.metodo_pago || opts.metodoPago,
    montoRecibido: opts.montoRecibido ? parseFloat(opts.montoRecibido) : Number(opts.venta.total),
    vuelto,
    estadoSunat: opts.tipoComprobante === "NOTA_VENTA" ? undefined : "PENDIENTE",
  };
}

export function nuevaClaveIdempotencia(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function estadoComprobanteDe(venta: VentaRegistradaResponse): EstadoComprobanteVenta {
  if (venta.comprobante?.estado) return venta.comprobante.estado;
  if (venta.comprobante_estado) return venta.comprobante_estado;
  if (venta.comprobante_url || venta.comprobante_token) return "GENERADO";
  return venta.tipo_comprobante === "NOTA_VENTA" ? "NO_APLICA" : "PENDIENTE";
}

export function enlaceComprobante(url?: string | null, token?: string | null): ReceiptLink | null {
  const target = url || (token ? `/c/${encodeURIComponent(token)}` : null);
  return resolveReceiptLink(target, import.meta.env.VITE_PUBLIC_APP_URL);
}
