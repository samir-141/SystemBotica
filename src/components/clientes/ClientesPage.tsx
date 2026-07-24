import { useState, useCallback } from "react";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  X,
  Filter,
  ChevronDown
} from "lucide-react";
import type { Cliente, FormMode } from "./types";
import { useClientes } from "./hooks/useClientes";
import ClienteTable from "./elements/ClienteTable";
import ClienteForm from "./elements/ClienteForm";
import ClienteDetailModal from "./elements/ClienteDetailModal";

export default function ClientesPage() {
  const {
    clientes,
    meta,
    loading,
    error,
    busqueda,
    setBusqueda,
    tipoDocumentoFilter,
    setTipoDocumentoFilter,
    setPage,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    refetch,
  } = useClientes();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("crear");
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [clienteDetalle, setClienteDetalle] = useState<Cliente | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = () => {
    setClienteEditar(null);
    setFormMode("crear");
    setFormOpen(true);
  };

  const handleEdit = (c: Cliente) => {
    setClienteEditar(c);
    setFormMode("editar");
    setFormOpen(true);
  };

  const handleSelect = (c: Cliente) => {
    setClienteDetalle(c);
    setDetailOpen(true);
  };

  const handleDelete = (c: Cliente) => {
    setDeleteTarget(c);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eliminarCliente(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || "Error al eliminar el cliente");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = useCallback(
    async (data: Record<string, unknown>, mode: FormMode) => {
      if (mode === "editar" && clienteEditar) {
        await actualizarCliente(clienteEditar.id, data);
      } else {
        await crearCliente(data);
      }
    },
    [clienteEditar, actualizarCliente, crearCliente]
  );

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans text-slate-800">
      {/* ═══ TOOLBAR / HEADER ════════════════════════════════════════ */}
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-4 md:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">Gestión de Clientes</h1>
              <p className="text-xs text-slate-400 font-medium">
                {meta.total} cliente{meta.total !== 1 ? "s" : ""} registrado{meta.total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              title="Refrescar Lista"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700
                text-white text-xs font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="px-4 pb-3 md:px-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por Nombre, DNI, RUC, Teléfono o Email..."
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white
                placeholder:text-slate-400 transition"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tipoDocumentoFilter}
              onChange={(e) => setTipoDocumentoFilter(e.target.value)}
              className="px-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-700 cursor-pointer"
            >
              <option value="">Todos los Documentos</option>
              <option value="DNI">DNI (Persona)</option>
              <option value="RUC">RUC (Empresa)</option>
              <option value="CE">Carnet Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 md:mx-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
          <span><strong>Error:</strong> {error}</span>
          <button onClick={refetch} className="font-bold underline text-rose-800">Reintentar</button>
        </div>
      )}

      {/* ═══ TABLE / LIST ════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <ClienteTable
          clientes={clientes}
          loading={loading}
          meta={meta}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSelect={handleSelect}
          onPageChange={setPage}
        />
      </div>

      {/* ═══ MODALES / FORMULARIO SLIDE-OVER ═════════════════════════ */}
      <ClienteForm
        open={formOpen}
        mode={formMode}
        cliente={clienteEditar}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />

      <ClienteDetailModal
        open={detailOpen}
        cliente={clienteDetalle}
        onClose={() => setDetailOpen(false)}
      />

      {/* Modal de Eliminación */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn"
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                <X className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">¿Eliminar Cliente?</h3>
              <p className="text-xs text-slate-500 mb-1">
                Se eliminará <strong className="text-slate-800">{deleteTarget.nombre}</strong>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                {deleteTarget.tipo_documento}: {deleteTarget.numero_documento}
              </p>
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 rounded-xl shadow-sm transition"
              >
                {deleting ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
