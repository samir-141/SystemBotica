import { useState } from "react";
import { Store, Plus, MapPin, Phone, CreditCard, RefreshCw, X, Save, Loader2 } from "lucide-react";
import type { SucursalAdminItem } from "../hooks/useAdmin";

type Props = {
  sucursales: SucursalAdminItem[];
  loading: boolean;
  onSaveSucursal: (data: { nombre: string; direccion: string; telefono?: string }) => Promise<void>;
  onRefresh: () => void;
};

export default function SucursalesAdmin({
  sucursales,
  loading,
  onSaveSucursal,
  onRefresh,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    if (!nombre.trim() || !direccion.trim()) {
      setErrorForm("El nombre y la dirección son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      await onSaveSucursal({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim() || undefined,
      });
      setModalOpen(false);
      setNombre("");
      setDireccion("");
      setTelefono("");
    } catch (err: any) {
      setErrorForm(err.message || "Error al registrar la sucursal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Sedes y Cajas de Venta</h2>
          <p className="text-xs text-slate-400">Sucursales habilitadas para facturación y control de inventario</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nueva Sucursal
          </button>
        </div>
      </div>

      {/* Grid Sucursales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && sucursales.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            Cargando sucursales...
          </div>
        ) : (
          sucursales.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.nombre}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    OPERATIVA
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.direccion}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <span>{s.telefono}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" /> {s.total_cajas} caja(s) de cobro
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nueva Sucursal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-sm">Registrar Nueva Sucursal</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {errorForm && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
                  {errorForm}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-600 block mb-1">Nombre de la Sucursal / Sede *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Sucursal San Martín"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Dirección Fiscal *</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. San Martín 456, Lima"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="01 234 5678"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Sucursal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
