import type { ProductoPOS } from "../../types/api.types";
import { fechaCivil } from "../../utils/localDate";

export interface CompraLineDraft {
  key: string;
  productoId: string;
  presentacionId: string;
  cantidad: string;
  costoUnitario: string;
  numeroLote: string;
  fechaFabricacion: string;
  fechaVencimiento: string;
}

let lineSequence = 0;

export const nuevaLineaCompra = (): CompraLineDraft => ({
  key: `compra-linea-${Date.now()}-${++lineSequence}`,
  productoId: "",
  presentacionId: "",
  cantidad: "1",
  costoUnitario: "",
  numeroLote: "",
  fechaFabricacion: "",
  fechaVencimiento: "",
});

export function unidadesBase(linea: CompraLineDraft, producto?: ProductoPOS) {
  const cantidad = Number(linea.cantidad);
  return producto && Number.isFinite(cantidad)
    ? cantidad * producto.cantidad_unidad_base
    : 0;
}

export function calcularTotales(
  lineas: CompraLineDraft[],
  productos: ProductoPOS[],
) {
  let subtotal = 0;
  let baseAfecta = 0;
  for (const linea of lineas) {
    const producto = productos.find(
      (item) => item.presentacion_id === linea.presentacionId,
    );
    const importe = Number(linea.cantidad) * Number(linea.costoUnitario);
    if (!Number.isFinite(importe)) continue;
    subtotal += importe;
    if (producto?.afecto_igv ?? true) baseAfecta += importe;
  }
  const igv = Math.round(baseAfecta * 0.18 * 100) / 100;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    igv,
    total: Math.round((subtotal + igv) * 100) / 100,
  };
}

export interface EstadoLote {
  estado: "vigente" | "por_vencer" | "vencido";
  dias: number;
}

export interface LoteExistente {
  id: string;
  numero_lote: string;
  fecha_fabricacion: string | null;
  fecha_vencimiento: string | null;
  stock_actual?: number;
}

// Identifica a qué lote pertenece una compra según la fecha de vencimiento
// (misma lógica de identificación de lote usada en inventario / ReabastecerModal).
export function lotesConFechaVencimiento(
  lotes: LoteExistente[],
  fechaVencimiento: string,
): LoteExistente[] {
  if (!fechaVencimiento) return [];
  return lotes.filter(
    (lote) => lote.fecha_vencimiento?.slice(0, 10) === fechaVencimiento,
  );
}

// Identifica un lote según su fecha de vencimiento (misma lógica FEFO de venta).
// Vencido = fecha pasada; por_vencer = dentro de los próximos 90 días.
export function estadoLotePorVencimiento(
  fechaVencimiento: string | null | undefined,
  hoy: string = fechaCivil(),
): EstadoLote {
  if (!fechaVencimiento) return { estado: "vigente", dias: 0 };
  const venc = new Date(`${fechaVencimiento}T00:00:00`);
  const hoyDate = new Date(`${hoy}T00:00:00`);
  if (Number.isNaN(venc.getTime())) return { estado: "vigente", dias: 0 };
  const dias = Math.round(
    (venc.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (venc < hoyDate) return { estado: "vencido", dias };
  const diffMeses =
    (venc.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  return { estado: diffMeses <= 3 ? "por_vencer" : "vigente", dias };
}

export function mensajeCompraError(error: unknown): string {
  const item = error as { status?: number; message?: string } | null;
  if (item?.status === 409)
    return item.message || "Ese comprobante ya fue registrado.";
  if (item?.status === 403)
    return "No tiene permiso para operar en esta sucursal.";
  if (item?.status === 400)
    return item.message || "Revise los datos de la compra.";
  return item?.message || "No se pudo registrar la compra.";
}
