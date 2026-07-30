// src/components/admin/elements/CatalogosAdmin.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  X,
  Save,
  Loader2,
  Pill,
  FlaskConical,
  Factory,
  FolderOpen,
  Ruler,
} from "lucide-react";
import { posApi } from "../../api/api.data";
import type { TipoCatalogo, ItemCatalogo } from "../../api/api.data";

type Props = {};

const TIPOS_CATALOGO: { tipo: TipoCatalogo; label: string; icon: typeof Package }[] = [
  { tipo: "principios-activos", label: "Principios Activos", icon: Pill },
  { tipo: "formas-farmaceuticas", label: "Formas Farmacéuticas", icon: FlaskConical },
  { tipo: "laboratorios", label: "Laboratorios", icon: Factory },
  { tipo: "categorias", label: "Categorías", icon: FolderOpen },
  { tipo: "unidades-presentacion", label: "Unidades de Presentación", icon: Ruler },
];

export default function CatalogosAdmin(_props: Props) {
  const [tipoActivo, setTipoActivo] = useState<TipoCatalogo>("principios-activos");
  const [items, setItems] = useState<ItemCatalogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ItemCatalogo | null>(null);
  const [form, setForm] = useState({ nombre: "", abreviatura: "", descripcion: "", pais: "", telefono: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await posApi.getCatalogo(tipoActivo, { buscar: busqueda || undefined, page: 1, limit: 50 });
      setItems(res.data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar catálogo");
    } finally {
      setLoading(false);
    }
  }, [tipoActivo, busqueda]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleOpenCreate = () => {
    setEditItem(null);
    setForm({ nombre: "", abreviatura: "", descripcion: "", pais: "", telefono: "", email: "" });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ItemCatalogo) => {
    setEditItem(item);
    setForm({
      nombre: item.nombre || "",
      abreviatura: item.abreviatura || "",
      descripcion: item.descripcion || "",
      pais: item.pais || "",
      telefono: item.telefono || "",
      email: item.email || "",
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      if (editItem) {
        await posApi.actualizarItemCatalogo(tipoActivo, editItem.id, form);
      } else {
        await posApi.crearItemCatalogo(tipoActivo, form);
      }
      setModalOpen(false);
      cargar();
    } catch (err: any) {
      setError(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    try {
      await posApi.eliminarItemCatalogo(tipoActivo, id);
      cargar();
    } catch (err: any) {
      setError(err.message || "Error al eliminar");
    }
  };

  const tipoInfo = TIPOS_CATALOGO.find(t => t.tipo === tipoActivo);
  const Icon = tipoInfo?.icon || Package;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Gestión de Catálogos</h2>
              <p className="text-[10px] text-slate-400 font-medium">Administra laboratorios, categorías, principios activos y más</p>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold mb-4 overflow-x-auto">
          {TIPOS_CATALOGO.map((t) => {
            const TIcon = t.icon;
            return (
              <button
                key={t.tipo}
                onClick={() => { setTipoActivo(t.tipo); setBusqueda(""); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${tipoActivo === t.tipo ? "bg-white text-purple-700 shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
              >
                <TIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={`Buscar en ${tipoInfo?.label || "catálogo"}...`}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium mb-3">
            {error}
            <button onClick={cargar} className="ml-2 font-bold underline">Reintentar</button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-600" /> Cargando...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Sin registros</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Abreviatura</th>
                    <th className="py-3 px-4">Descripción</th>
                    <th className="py-3 px-4">País</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{item.nombre}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.abreviatura || "-"}</td>
                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{item.descripcion || "-"}</td>
                      <td className="py-3 px-4 text-slate-600">{item.pais || "-"}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.telefono || "-"}</td>
                      <td className="py-3 px-4 text-slate-600">{item.email || "-"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-sm">{editItem ? "Editar" : "Nuevo"} {tipoInfo?.label}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{error}</div>}
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Nombre *</label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-400" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Abreviatura</label>
                <input type="text" value={form.abreviatura} onChange={(e) => setForm({ ...form, abreviatura: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-400" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">País</label>
                  <input type="text" value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Teléfono</label>
                  <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-400" />
              </div>
              <div className="flex gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 rounded-xl transition cursor-pointer">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
