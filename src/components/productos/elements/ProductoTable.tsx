import {
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pill,
  PackagePlus,
} from "lucide-react";
import type { ProductoPOS } from "../../api/api.data";

type Props = {
  productos: ProductoPOS[];
  loading: boolean;
  meta: { total: number; page: number; limit: number; totalPages: number };
  onEdit: (producto: ProductoPOS) => void;
  onDelete: (producto: ProductoPOS) => void;
  onReabastecer?: (producto: ProductoPOS) => void;
  onPageChange: (page: number) => void;
};

export default function ProductoTable({
  productos,
  loading,
  meta,
  onEdit,
  onDelete,
  onReabastecer,
  onPageChange,
}: Props) {
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
      {/* ═══ MOBILE: Cards ═══════════════════════════════ */}
      <div className="md:hidden space-y-3 p-4">
        {productos.map((p) => (
          <div
            key={`${p.producto_comercial_id}-${p.presentacion_id}`}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {p.nombre_comercial}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {p.forma_farmaceutica}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {p.concentracion}{p.unidad_concentracion}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                  <Pill className="w-3 h-3" />
                  <span>Presentación: {p.presentacion_nombre}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black text-slate-900 block">
                  S/ {p.precio_actual.toFixed(2)}
                </span>
                <span className={`text-[10px] font-extrabold ${p.stock_total <= 5 ? "text-rose-600" : "text-emerald-600"}`}>
                  {p.stock_total} disp.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100">
              {onReabastecer && (
                <button
                  onClick={() => onReabastecer(p)}
                  className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1"
                >
                  <PackagePlus size={13} />
                  <span>+Stock</span>
                </button>
              )}
              <button
                onClick={() => onEdit(p)}
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

      {/* ═══ DESKTOP: Tabla ══════════════════════════════ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Producto / P.A.</th>
              <th className="py-3 px-4">Forma & Concentración</th>
              <th className="py-3 px-4">Laboratorio</th>
              <th className="py-3 px-4">Presentación</th>
              <th className="py-3 px-4 text-right">Precio (S/)</th>
              <th className="py-3 px-4 text-right">Stock Base</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {productos.map((p) => (
              <tr key={`${p.producto_comercial_id}-${p.presentacion_id}`} className="hover:bg-slate-50/70 transition">
                <td className="py-3 px-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-slate-900 font-black">{p.nombre_comercial}</div>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || "N/A"}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-800">{p.forma_farmaceutica}</div>
                  <div className="text-[10px] text-slate-400">{p.principio_activo}</div>
                </td>
                <td className="py-3 px-4 font-medium text-slate-600">{p.laboratorio}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[10px]">
                    {p.presentacion_nombre}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-black text-teal-700 text-sm">
                  S/ {p.precio_actual.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-right font-bold">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${p.stock_total <= 5 ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700"}`}>
                    {p.stock_total > 0 ? p.stock_total : (
                      <span className="inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 0
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
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
                      onClick={() => onEdit(p)}
                      title="Editar Producto & Presentaciones"
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
            ))}
          </tbody>
        </table>
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
