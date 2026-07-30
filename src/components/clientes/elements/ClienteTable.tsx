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
  Eye,
  AlertTriangle,
  MessageCircle,
  FileCheck,
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
              <th className="py-3 px-4">Cliente / Clasificación</th>
              <th className="py-3 px-4">Documento & SUNAT</th>
              <th className="py-3 px-4">Contacto & WhatsApp</th>
              <th className="py-3 px-4">Límite & Crédito (S/)</th>
              <th className="py-3 px-4 text-center">Compras</th>
              <th className="py-3 px-4 text-right">Total Gastado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {clientes.map((c) => {
              const esJuridico = c.tipo_cliente === "JURIDICO" || c.tipo_documento === "RUC";
              const esHabido = c.condicion_contribuyente === "HABIDO" || !c.condicion_contribuyente;
              const tieneCredito = (c.limite_credito || 0) > 0;
              const esMoroso = c.estado_credito === "MOROSO" || (c.saldo_actual || 0) > (c.limite_credito || 0);

              return (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Nombre y Tipo */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-extrabold text-slate-900 group-hover:text-teal-700 transition flex items-center gap-1.5">
                          {c.nombre}
                          {c.estado === "BLOQUEADO" && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 rounded border border-rose-200">
                              BLOQUEADO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            c.tipo_cliente === "JURIDICO"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : c.tipo_cliente === "HOSPITAL" || c.tipo_cliente === "CLINICA"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {c.tipo_cliente || (esJuridico ? "JURÍDICO" : "NATURAL")}
                          </span>
                          {c.direccion && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate max-w-[180px]">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {c.direccion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Documento & SUNAT */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.tipo_documento}: {c.numero_documento}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded flex items-center gap-1 border ${
                          esHabido
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {esHabido ? <FileCheck className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                          {c.condicion_contribuyente || "HABIDO"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contacto & WhatsApp */}
                  <td className="py-3 px-4 space-y-0.5">
                    {c.telefono || c.whatsapp ? (
                      <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium">
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>{c.whatsapp || c.telefono}</span>
                        {c.whatsapp && (
                          <a
                            href={`https://wa.me/51${c.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-0.5 text-emerald-600 hover:text-emerald-700 transition"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-50" />
                          </a>
                        )}
                      </div>
                    ) : null}
                    {c.email && (
                      <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate max-w-[160px]">
                        <Mail className="w-3 h-3 text-slate-400" /> {c.email}
                      </div>
                    )}
                    {!c.telefono && !c.email && !c.whatsapp && <span className="text-slate-300 italic">-</span>}
                  </td>

                  {/* Límite & Crédito */}
                  <td className="py-3 px-4">
                    {tieneCredito ? (
                      <div className="space-y-0.5">
                        <div className="font-mono text-slate-800 font-bold text-[11px]">
                          Límite: S/ {(c.limite_credito || 0).toFixed(2)} ({c.dias_credito || 0}d)
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black inline-block border ${
                          esMoroso
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          Deuda: S/ {(c.saldo_actual || 0).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Sin crédito</span>
                    )}
                  </td>

                  {/* Compras */}
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                      <ShoppingBag className="w-3 h-3" />
                      {c.total_compras}
                    </span>
                  </td>

                  {/* Total Gastado */}
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm tabular-nums">
                    S/ {(c.monto_total_comprado || 0).toFixed(2)}
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onSelect(c)}
                        title="Ver Detalle 360°"
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(c)}
                        title="Editar Cliente"
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ VISTA MÓVIL (CARDS) ═══════════════════════════════════════ */}
      <div className="md:hidden divide-y divide-slate-100">
        {clientes.map((c) => (
          <div key={c.id} className="p-3 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-800">{c.nombre}</div>
            <div className="text-[10px] text-slate-500">
              {c.tipo_documento}: {c.numero_documento}
            </div>
            {(c.telefono || c.email || c.whatsapp) && (
              <div className="text-[10px] text-slate-500">
                {c.telefono && <span>{c.telefono}</span>}
                {c.email && <span>{c.email}</span>}
                {c.whatsapp && <span>{c.whatsapp}</span>}
              </div>
            )}
            <button
              onClick={() => onSelect(c)}
              className="px-2 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg"
            >
              Ver detalle
            </button>
          </div>
        ))}
      </div>

      {/* ═══ PAGINACIÓN EXPLÍCITA ══════════════════════════════════════ */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Mostrando{" "}
            <span className="font-bold text-slate-700">
              {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)}
            </span>{" "}
            de <span className="font-bold text-slate-700">{meta.total}</span> clientes
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
