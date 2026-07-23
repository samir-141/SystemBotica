// src/components/productos/ProductosPage.tsx
import { useState, useCallback } from "react";
import {
  Search,
  Plus,
  Package,
  Filter,
  X,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import type { ProductoPOS } from "../api/api.data";
import type { FormMode, TipoCatalogo } from "./types";
import { useProductos } from "./hooks/useProductos";
import { useCatalogos } from "./hooks/useCatalogos";
import ProductoTable from "./elements/ProductoTable";
import ProductoForm from "./elements/ProductoForm";

/**
 * Página principal de gestión de productos.
 * Incluye toolbar, filtros colapsables, tabla y formulario slide-over.
 */
export default function ProductosPage() {
  const {
    productos,
    meta,
    loading,
    error,
    setBusqueda,
    setPage,
    setFiltro,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    refetch,
  } = useProductos();

  const { catalogos, refreshCatalogo } = useCatalogos();

  /* ── Estado UI ──────────────────────────────────────── */
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("crear");
  const [productoEditar, setProductoEditar] = useState<ProductoPOS | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductoPOS | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Handlers ───────────────────────────────────────── */
  const handleSearch = (value: string) => {
    setSearchText(value);
    setBusqueda(value);
  };

  const handleEdit = (producto: ProductoPOS) => {
    setProductoEditar(producto);
    setFormMode("editar");
    setFormOpen(true);
  };

  const handleCreate = () => {
    setProductoEditar(null);
    setFormMode("crear");
    setFormOpen(true);
  };

  const handleDelete = (producto: ProductoPOS) => {
    setDeleteTarget(producto);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await eliminarProducto(deleteTarget.producto_comercial_id);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message ?? "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = useCallback(
    async (data: Record<string, unknown>, mode: FormMode) => {
      if (mode === "editar" && productoEditar) {
        await actualizarProducto(productoEditar.producto_comercial_id, data);
      } else {
        await crearProducto(data);
      }
    },
    [productoEditar, actualizarProducto, crearProducto]
  );

  const handleCatalogoRefresh = useCallback(
    (tipo: TipoCatalogo) => refreshCatalogo(tipo),
    [refreshCatalogo]
  );

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* ═══ HEADER / TOOLBAR ════════════════════════════ */}
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        {/* Top bar */}
        <div className="px-4 py-4 md:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">Productos</h1>
              <p className="text-xs text-slate-400 font-medium">
                {meta.total} producto{meta.total !== 1 ? "s" : ""} registrado{meta.total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              title="Refrescar"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700
                text-white text-xs font-bold shadow-sm transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </div>

        {/* Search + filter toggle */}
        <div className="px-4 pb-3 md:px-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por nombre, SKU, principio activo..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
                focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 focus:bg-white
                placeholder:text-slate-400 transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition
              ${showFilters
                ? "bg-teal-50 border-teal-300 text-teal-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtros
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible filters */}
        {showFilters && (
          <div className="px-4 pb-4 md:px-6 border-t border-slate-100 pt-3 animate-fadeDown">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Filtro por laboratorio */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Laboratorio
                </label>
                <select
                  onChange={(e) => setFiltro("laboratorio_id", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition appearance-none"
                >
                  <option value="">Todos</option>
                  {catalogos["laboratorios"].map((l) => (
                    <option key={l.id} value={l.id}>{l.nombre}</option>
                  ))}
                </select>
              </div>
              {/* Filtro por categoría */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Categoría
                </label>
                <select
                  onChange={(e) => setFiltro("categoria_id", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition appearance-none"
                >
                  <option value="">Todas</option>
                  {catalogos["categorias"].map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              {/* Filtro por principio activo */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Principio Activo
                </label>
                <select
                  onChange={(e) => setFiltro("principio_activo_id", e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition appearance-none"
                >
                  <option value="">Todos</option>
                  {catalogos["principios-activos"].map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ERROR BANNER ════════════════════════════════ */}
      {error && (
        <div className="mx-4 mt-3 md:mx-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
          <button onClick={refetch} className="ml-auto text-rose-500 hover:text-rose-700 underline font-bold">
            Reintentar
          </button>
        </div>
      )}

      {/* ═══ TABLE ═══════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        <ProductoTable
          productos={productos}
          loading={loading}
          meta={meta}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPageChange={setPage}
        />
      </div>

      {/* ═══ FORM SLIDE-OVER ════════════════════════════ */}
      <ProductoForm
        open={formOpen}
        mode={formMode}
        producto={productoEditar}
        catalogos={catalogos}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        onCatalogoRefresh={handleCatalogoRefresh}
      />

      {/* ═══ DELETE CONFIRMATION MODAL ══════════════════ */}
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
              <h3 className="text-sm font-bold text-slate-800 mb-1">¿Eliminar Producto?</h3>
              <p className="text-xs text-slate-500 mb-1">
                Se eliminará <span className="font-bold text-slate-700">{deleteTarget.nombre_comercial}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{deleteTarget.sku}</p>
            </div>
            <div className="px-6 pb-5 flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200
                  rounded-xl hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700
                  disabled:bg-slate-200 disabled:text-slate-400 rounded-xl shadow-sm transition
                  active:scale-[0.98]"
              >
                {deleting ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeDown { animation: fadeDown 0.2s ease-out both; }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out both; }
      `}</style>
    </div>
  );
}
