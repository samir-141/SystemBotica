// src/components/productos/elements/ProductoTable.tsx
import {
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Pill,
  FlaskConical,
} from "lucide-react";
import type { ProductoPOS } from "../../api/api.data";

type Props = {
  productos: ProductoPOS[];
  loading: boolean;
  meta: { total: number; page: number; limit: number; totalPages: number };
  onEdit: (producto: ProductoPOS) => void;
  onDelete: (producto: ProductoPOS) => void;
  onPageChange: (page: number) => void;
};

/**
 * Tabla responsive de productos.
 * Mobile: cards apiladas. Desktop: tabla con columnas.
 */
export default function ProductoTable({
  productos,
  loading,
  meta,
  onEdit,
  onDelete,
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
                  <span className="truncate">{p.principio_activo}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                  <FlaskConical className="w-3 h-3" />
                  <span className="truncate">{p.laboratorio}</span>
                </div>
              </div>

              {/* Precio + stock */}
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-900">
                  S/ {p.precio_actual.toFixed(2)}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1
                    ${p.stock_total > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-600"
                    }`}
                >
                  {p.stock_total > 0 ? `${p.stock_total} en stock` : "Sin stock"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 flex-1 truncate">
                {p.sku}
              </span>
              <button
                onClick={() => onEdit(p)}
                className="p-2 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(p)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ DESKTOP: Tabla ══════════════════════════════ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">Principio Activo</th>
              <th className="text-left px-4 py-3">Laboratorio</th>
              <th className="text-left px-4 py-3">Presentación</th>
              <th className="text-right px-4 py-3">Precio</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-center px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productos.map((p) => (
              <tr
                key={`${p.producto_comercial_id}-${p.presentacion_id}`}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-slate-500">{p.sku}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-800 truncate max-w-[200px]">
                      {p.nombre_comercial}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {p.forma_farmaceutica} — {p.concentracion}{p.unidad_concentracion}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{p.principio_activo}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{p.laboratorio}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {p.presentacion_nombre}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">
                  S/ {p.precio_actual.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${p.stock_total > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-600"
                      }`}
                  >
                    {p.stock_total > 0 ? p.stock_total : (
                      <span className="flex items-center gap-1 justify-end">
                        <AlertTriangle className="w-3 h-3" /> 0
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(p)}
                      title="Editar"
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
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white
                disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* Page numbers */}
            {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, i) => {
              const pageNum = getPageNumber(meta.page, meta.totalPages, i);
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition
                    ${pageNum === meta.page
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
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white
                disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Utilidad: calcula el número de página para el botón i-ésimo */
function getPageNumber(current: number, total: number, index: number): number {
  const maxVisible = Math.min(total, 5);
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  if (start + maxVisible - 1 > total) start = total - maxVisible + 1;
  return start + index;
}
