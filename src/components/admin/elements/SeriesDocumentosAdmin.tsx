// src/components/admin/elements/SeriesDocumentosAdmin.tsx
import { useState, useEffect, useCallback } from "react";
import { Hash, Plus, RefreshCw, X, Save, Loader2, Building2 } from "lucide-react";
import { ventasService } from "../../../services/ventas.service";
import { perfilesTributariosService, type PerfilTributario } from "../../../services/perfiles-tributarios.service";
import { useAuth } from "../../../hooks/useAuth";
import { toast } from "../../../utils/toast";

type Props = {
  sucursales?: any[];
};

type SerieDocumento = {
  id: string;
  tipo_documento: string;
  serie: string;
  correlativo_inicial: number;
  correlativo_actual: number;
  longitud_correlativo: number;
  sucursal_id?: string;
  perfil_tributario_id?: string;
  perfiles_tributarios?: {
    id: string;
    ruc: string;
    razon_social: string;
    regimen_tributario: string;
    es_principal: boolean;
  };
  activo: boolean;
};

const TIPOS_DOCUMENTO = ["BOLETA", "FACTURA", "NOTA_VENTA", "NOTA_CREDITO", "NOTA_DEBITO", "GUIA_REMISION"];

export default function SeriesDocumentosAdmin({ sucursales }: Props) {
  const { sucursalActual } = useAuth();
  const [series, setSeries] = useState<SerieDocumento[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilTributario[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SerieDocumento | null>(null);
  const [form, setForm] = useState({
    tipo_documento: "BOLETA",
    serie: "B001",
    correlativo_inicial: 1,
    correlativo_actual: 1,
    longitud_correlativo: 8,
    sucursal_id: "",
    perfil_tributario_id: "",
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, perfilesData] = await Promise.all([
        ventasService.getSeriesDocumentos(),
        perfilesTributariosService.listar(),
      ]);
      setSeries(data || []);
      setPerfiles(perfilesData || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar series");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleOpenCreate = () => {
    setEditItem(null);
    const principal = perfiles.find(p => p.es_principal) || perfiles[0];
    setForm({
      tipo_documento: "BOLETA",
      serie: "B001",
      correlativo_inicial: 1,
      correlativo_actual: 1,
      longitud_correlativo: 8,
      sucursal_id: sucursalActual?.id || "",
      perfil_tributario_id: principal ? principal.id : "",
      activo: true,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SerieDocumento) => {
    setEditItem(item);
    setForm({
      tipo_documento: item.tipo_documento,
      serie: item.serie,
      correlativo_inicial: item.correlativo_inicial,
      correlativo_actual: item.correlativo_actual,
      longitud_correlativo: item.longitud_correlativo,
      sucursal_id: item.sucursal_id || "",
      perfil_tributario_id: item.perfil_tributario_id || "",
      activo: item.activo,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.serie.trim()) {
      setError("La serie es obligatoria");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        sucursal_id: form.sucursal_id === "" ? undefined : form.sucursal_id,
        perfil_tributario_id: form.perfil_tributario_id === "" ? undefined : form.perfil_tributario_id,
      };

      if (editItem) {
        await ventasService.actualizarSerieDocumento(editItem.id, payload);
        toast.success("Serie actualizada", `Serie ${payload.serie} actualizada con éxito.`);
      } else {
        await ventasService.crearSerieDocumento(payload);
        toast.success("Serie creada", `Serie ${payload.serie} creada con éxito.`);
      }
      setModalOpen(false);
      cargar();
    } catch (err: any) {
      const msg = err.message || "Error al guardar";
      setError(msg);
      toast.error("Error al guardar serie", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta serie?")) return;
    setDeletingId(id);
    try {
      await ventasService.eliminarSerieDocumento(id);
      toast.success("Serie eliminada", "La serie fue eliminada del sistema.");
      cargar();
    } catch (err: any) {
      const msg = err.message || "Error al eliminar";
      setError(msg);
      toast.error("Error al eliminar serie", msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Series de Documentos</h2>
            <p className="text-[10px] text-slate-400 font-medium">Configura series y correlativos por emisor y tipo de comprobante</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer animate-fade-in"
        >
          <Plus className="w-4 h-4" /> Nueva Serie
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {error}
          <button onClick={cargar} className="ml-2 font-bold underline">Reintentar</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600" /> Cargando...
          </div>
        ) : series.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">Sin series configuradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Emisor (RUC)</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Sucursal / Sede</th>
                  <th className="py-3 px-4">Serie</th>
                  <th className="py-3 px-4">Correlativo Inicial</th>
                  <th className="py-3 px-4">Correlativo Actual</th>
                  <th className="py-3 px-4">Longitud</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {series.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {s.perfiles_tributarios ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[140px] font-bold">{s.perfiles_tributarios.razon_social}</span>
                          <span className="text-[10px] font-mono text-slate-400">({s.perfiles_tributarios.ruc})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Emisor Principal</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{s.tipo_documento}</td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {s.sucursal_id
                        ? (sucursales?.find(suc => suc.id === s.sucursal_id)?.nombre || "Cargando...")
                        : "Todas las sucursales (Global)"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 font-bold">{s.serie}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.correlativo_inicial}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.correlativo_actual}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.longitud_correlativo}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {s.activo ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenEdit(s)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer">
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 rounded-lg transition cursor-pointer"
                          title="Eliminar serie"
                        >
                          {deletingId === s.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
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

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={() => setModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-sm">{editItem ? "Editar" : "Nueva"} Serie</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">{error}</div>}

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Emisor Tributario (RUC)</label>
                <select
                  value={form.perfil_tributario_id}
                  onChange={(e) => setForm({ ...form, perfil_tributario_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-purple-400 cursor-pointer font-semibold"
                >
                  <option value="">Emisor Principal / Global</option>
                  {perfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.razon_social} (RUC: {p.ruc} - {p.regimen_tributario})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Tipo Documento</label>
                  <select value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-purple-400 cursor-pointer">
                    {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Serie *</label>
                  <input type="text" value={form.serie} onChange={(e) => setForm({ ...form, serie: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-400 font-bold" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Correlativo Inicial</label>
                  <input type="number" value={form.correlativo_inicial} onChange={(e) => setForm({ ...form, correlativo_inicial: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Correlativo Actual</label>
                  <input type="number" value={form.correlativo_actual} onChange={(e) => setForm({ ...form, correlativo_actual: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Longitud</label>
                  <input type="number" value={form.longitud_correlativo} onChange={(e) => setForm({ ...form, longitud_correlativo: parseInt(e.target.value) || 8 })} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Sucursal / Sede *</label>
                <select
                  value={form.sucursal_id}
                  onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="">Todas las sucursales (Global)</option>
                  {sucursales?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer">Cancelar</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

