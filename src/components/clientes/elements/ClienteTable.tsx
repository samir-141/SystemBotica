import {
  Users,
  Edit2,
  Trash2,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";

import type { Cliente } from "../types";

type Props = {
  clientes: Cliente[];
  loading: boolean;
  meta: { total: number; page: number; limit: number; totalPages: number };
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
  onSelect: (cliente: Cliente) => void;
  onPageChange: (page: number) => void;
};

export default function ClienteTable({
  clientes,
  loading,
  meta,
  onEdit,
  onDelete,
  onSelect,
  onPageChange,
}: Props) {
  if (loading && clientes.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Cargando directorio de clientes...</p>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
        <Users className="w-12 h-12 stroke-1 text-slate-300 mb-1" />
        <p className="text-sm font-bold text-slate-600">No se encontraron clientes</p>
        <p className="text-xs text-slate-400">Intenta cambiar el término de búsqueda o agrega un nuevo cliente</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ═══ VISTA ESCRITORIO (Tabla HTML) ════════════════════════════ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Documento</th>
              <th className="py-3 px-4">Contacto</th>
              <th className="py-3 px-4 text-center">Compras</th>
              <th className="py-3 px-4 text-right">Total Gastado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {c.nombre}
                  </div>
                  {c.direccion && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {c.direccion}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {c.tipo_documento}: {c.numero_documento}
                  </span>
                </td>
                <td className="py-3 px-4 space-y-0.5">
                  {c.telefono ? (
                    <div className="flex items-center gap-1 text-slate-600 text-[11px]">
                      <Phone className="w-3 h-3 text-teal-600" /> {c.telefono}
                    </div>
                  ) : null}
                  {c.email ? (
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                    </div>
                  ) : null}
                  {!c.telefono && !c.email && <span className="text-slate-300 italic">-</span>}
                </td>
                <td className="py-3 px-4 text-center font-bold text-slate-700">
                  <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                    <ShoppingBag className="w-3 h-3" />
                    {c.total_compras}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-900 text-sm tabular-nums">
                  S/ {(c.monto_total_comprado || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSelect(c)}
                      title="Ver Detalle"
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      title="Editar"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      title="Eliminar"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

      {/* ═══ VISTA MÓVIL (CARDS) ═══════════════════════════════════════ */}
      <div className="md:hidden space-y-3 p-3">
        {clientes.map((c) => (
          <div
            key={c.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                  {c.tipo_documento}: {c.numero_documento}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{c.nombre}</h3>
              </div>
              <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl shrink-0">
                S/ {(c.monto_total_comprado || 0).toFixed(2)}
              </span>
            </div>

            {(c.telefono || c.direccion) && (
              <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {c.telefono && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>{c.telefono}</span>
                  </div>
                )}
                {c.direccion && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.direccion}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-teal-600" /> {c.total_compras} compras realizadas
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(c)}
                  className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(c)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(c)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ PAGINACIÓN ════════════════════════════════════════════════ */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 mt-auto">
        <span>
          Mostrando página <strong className="text-slate-800">{meta.page}</strong> de{" "}
          <strong className="text-slate-800">{meta.totalPages}</strong> ({meta.total} registros)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page <= 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page >= meta.totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
