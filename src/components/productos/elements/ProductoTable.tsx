import {
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  Calendar,
  Layers,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import type { ProductoPOS } from "../../api/api.data";

type Props = {
  productos: ProductoPOS[];
  loading: boolean;
  meta: { total: number; page: number; limit: number; totalPages: number };
  onEdit: (producto: ProductoPOS, presentaciones?: ProductoPOS[]) => void;
  onDelete: (producto: ProductoPOS) => void;
  onReabastecer?: (producto: ProductoPOS) => void;
  onVerMovimientos?: (producto: ProductoPOS) => void;
  onPageChange: (page: number) => void;
};

export default function ProductoTable({
  productos,
  loading,
  meta,
  onEdit,
  onDelete,
  onReabastecer,
  onVerMovimientos,
  onPageChange,
}: Props) {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
  const productosAgrupados = useMemo(() => {
    const grupos = new Map<string, ProductoPOS[]>();
    productos.forEach((p) => {
      const grupo = grupos.get(p.producto_comercial_id) || [];
      grupo.push(p); grupos.set(p.producto_comercial_id, grupo);
    });
    return Array.from(grupos.values()).map((items) => ({ principal: items[0], presentaciones: items.sort((a, b) => a.cantidad_unidad_base - b.cantidad_unidad_base) }));
  }, [productos]);
  const toggleExpandido = (id: string) => setExpandidos((prev) => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });
  /* ── Helper de cálculo de días para vencimiento ──────── */
  const calcularDiasVencimiento = (fechaStr: string) => {
    if (!fechaStr) return null;
    const fechaVenc = new Date(fechaStr);
    const hoy = new Date();
    const difMs = fechaVenc.getTime() - hoy.getTime();
    return Math.ceil(difMs / (1000 * 60 * 60 * 24));
  };

  /* ── Skeleton loader ────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  /* ── Empty state ────────────────────────────────────── */
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
        <Package className="w-12 h-12 stroke-1 text-slate-300" />
        <p className="font-bold text-slate-500 text-sm">No se encontraron productos</p>
        <p className="text-xs text-slate-400">Intenta cambiar los filtros o crear uno nuevo</p>
      </div>
    );
  }

  return (
    <div>
      {/* ═══ DESKTOP: Tabla ══════════════════════════════ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Producto / P.A.</th>
              <th className="py-3 px-4">Forma & Reg. Sanitario</th>
              <th className="py-3 px-4">Laboratorio</th>
              <th className="py-3 px-4">Vencimiento (FEFO)</th>
              <th className="py-3 px-4 text-right">Precio (S/)</th>
              <th className="py-3 px-4 text-right">Stock Base</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {productosAgrupados.map(({ principal: p, presentaciones }) => {
              const diasVenc = calcularDiasVencimiento(p.lote_fefo_vencimiento);
              const expandido = expandidos.has(p.producto_comercial_id);

              return (
                <Fragment key={p.producto_comercial_id}>
                <tr key={p.producto_comercial_id} className="hover:bg-slate-50/70 transition">
                  {/* Producto / Nombre */}
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-slate-900 font-black flex items-center gap-2">
                          {p.nombre_comercial}
                          {p.requiere_receta && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 rounded-md shrink-0">
                              💊 Receta
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>SKU: {p.sku || "N/A"}</span>
                          {p.codigo_barras && (
                            <>
                              <span>•</span>
                              <span>EAN: {p.codigo_barras}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Forma / Reg. Sanitario */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{p.forma_farmaceutica} ({p.concentracion}{p.unidad_concentracion})</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{p.principio_activo}</div>
                    {p.registro_sanitario && (
                      <div className="text-[9px] text-teal-700 font-bold flex items-center gap-1 mt-0.5">
                        <FileCheck className="w-3 h-3 text-teal-600" />
                        <span>DIGEMID: {p.registro_sanitario}</span>
                      </div>
                    )}
                  </td>

                  {/* Laboratorio */}
                  <td className="py-3 px-4 font-medium text-slate-600">
                    <div>{p.laboratorio}</div>
                    <button type="button" onClick={() => toggleExpandido(p.producto_comercial_id)} className="mt-1 text-[10px] font-bold text-indigo-700 inline-flex items-center gap-1 hover:text-indigo-900">
                      <Layers className="w-3 h-3" /> {presentaciones.length} presentaciones <ChevronDown className={`w-3 h-3 transition ${expandido ? "rotate-180" : ""}`} />
                    </button>
                  </td>

                  {/* Vencimiento FEFO con Semáforo */}
                  <td className="py-3 px-4">
                    {p.lote_fefo_vencimiento ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(p.lote_fefo_vencimiento).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black inline-block border ${
                          diasVenc !== null && diasVenc < 0
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : diasVenc !== null && diasVenc <= 30
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : diasVenc !== null && diasVenc <= 90
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {diasVenc !== null && diasVenc < 0
                            ? "¡VENCIDO!"
                            : diasVenc !== null && diasVenc <= 30
                            ? `⚠️ Crítico (${diasVenc}d)`
                            : diasVenc !== null && diasVenc <= 90
                            ? `⚡ Vence pronto (${diasVenc}d)`
                            : `Lote: ${p.lote_fefo_numero}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Sin lote registrado</span>
                    )}
                  </td>

                  {/* Precio */}
                  <td className="py-3 px-4 text-right">
                    <div className="space-y-0.5">
                      {presentaciones.map((pres) => (
                        <div key={pres.presentacion_id} className="text-[11px] leading-tight">
                          <span className="font-semibold text-slate-500">{pres.presentacion_nombre}:</span>{" "}
                          <span className="font-black text-teal-700">S/ {pres.precio_actual.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Stock Base con Semáforo Tricolor */}
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-black inline-flex items-center gap-1 border ${
                      p.stock_total === 0
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : p.stock_total <= 10
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {p.stock_total === 0 ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>AGOTADO</span>
                        </>
                      ) : (
                        <span>{p.stock_total} unidades base</span>
                      )}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onVerMovimientos && (
                        <button
                          onClick={() => onVerMovimientos(p)}
                          title="Ver Lotes & Trazabilidad"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                      )}
                      {onReabastecer && (
                        <button
                          onClick={() => onReabastecer(p)}
                          title="Reabastecer Stock / Lote (+500 u)"
                          className="px-2 py-1 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 transition font-bold text-[10px] flex items-center gap-1"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                          <span>+Stock</span>
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(p, presentaciones)}
                        title="Editar Producto"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        title="Eliminar"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandido && <tr key={`${p.producto_comercial_id}-presentaciones`} className="bg-indigo-50/40"><td colSpan={7} className="px-4 py-3"><div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{presentaciones.map((pres) => { const disponibles = Math.floor(p.stock_total / Math.max(1, pres.cantidad_unidad_base)); return <div key={pres.presentacion_id} className="bg-white border border-indigo-100 rounded-xl px-3 py-2 text-xs"><p className="font-black text-slate-800">{pres.presentacion_nombre} <span className="text-slate-400">×{pres.cantidad_unidad_base}</span></p><p className="text-teal-700 font-bold">S/ {pres.precio_actual.toFixed(2)} · Disponibles: {disponibles}</p><p className="text-[10px] text-slate-400">Código: {pres.codigo_barras || "sin código"}</p></div>; })}</div></td></tr>}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ VISTA MÓVIL (CARDS) ══════════════════════════════════ */}
      <div className="md:hidden divide-y divide-slate-100">
        {productosAgrupados.map(({ principal: p, presentaciones }) => (
          <div key={p.producto_comercial_id} className="p-3 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-800">{p.nombre_comercial}</div>
            <div className="text-[10px] text-slate-500">
              SKU: {p.sku || "N/A"}
            </div>
            <div className="text-[10px] text-slate-500">
              {p.laboratorio}
            </div>
            <div className="text-[10px] text-slate-500">
              {p.categoria || "Sin categoría"}
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Stock base: {p.stock_total}</span>
              <span className="font-black text-slate-900">{presentaciones.length} presentaciones</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px]">{presentaciones.map((pres) => <span key={pres.presentacion_id} className="p-1.5 rounded bg-indigo-50 text-indigo-800 font-bold">{pres.presentacion_nombre} ×{pres.cantidad_unidad_base}<br/>S/ {pres.precio_actual.toFixed(2)} · Disp. {Math.floor(p.stock_total / Math.max(1, pres.cantidad_unidad_base))}</span>)}</div>
            <div className="flex items-center gap-2 pt-1">
              {onVerMovimientos && (
                <button
                  onClick={() => onVerMovimientos(p)}
                  className="px-2 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Ver lotes
                </button>
              )}
              {onReabastecer && (
                <button
                  onClick={() => onReabastecer(p)}
                  className="px-2 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg"
                >
                  Reabastecer
                </button>
              )}
              <button
                onClick={() => onEdit(p, presentaciones)}
                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg"
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={() => onDelete(p)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ PAGINACIÓN ══════════════════════════════════ */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="font-bold text-slate-700">
              {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)}
            </span>{" "}
            de <span className="font-bold text-slate-700">{meta.total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
              const pageNum = getPageNumber(meta.page, meta.totalPages, i);
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    pageNum === meta.page
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-white border border-slate-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getPageNumber(current: number, total: number, index: number): number {
  if (total <= 5) return index + 1;
  if (current <= 3) return index + 1;
  if (current >= total - 2) return total - 4 + index;
  return current - 2 + index;
}
