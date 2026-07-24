import { useState, useEffect } from "react";
import { X, Save, Loader2, User, Hash, MapPin, Phone, Mail } from "lucide-react";
import type { Cliente, ClienteFormData, FormMode, TipoDocumento } from "../types";

type Props = {
  open: boolean;
  mode: FormMode;
  cliente: Cliente | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>, mode: FormMode) => Promise<void>;
};

const EMPTY_FORM: ClienteFormData = {
  tipo_documento: "DNI",
  numero_documento: "",
  nombre: "",
  direccion: "",
  telefono: "",
  email: "",
};

export default function ClienteForm({
  open,
  mode,
  cliente,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<ClienteFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultandoPadron, setConsultandoPadron] = useState(false);
  const [origenBadge, setOrigenBadge] = useState<string | null>(null);

  const isEdit = mode === "editar";

  useEffect(() => {
    if (!open) return;
    setError(null);
    setOrigenBadge(null);

    if (isEdit && cliente) {
      setForm({
        tipo_documento: cliente.tipo_documento || "DNI",
        numero_documento: cliente.numero_documento || "",
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        telefono: cliente.telefono || "",
        email: cliente.email || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, isEdit, cliente]);

  const handleConsultarPadron = async (numeroDoc: string, tipoDocOverride?: TipoDocumento) => {
    const tipoDoc = tipoDocOverride || form.tipo_documento;
    const esValido = (tipoDoc === "DNI" && numeroDoc.length === 8) || (tipoDoc === "RUC" && numeroDoc.length === 11);
    if (!numeroDoc || !esValido) {
      return;
    }


    setConsultandoPadron(true);
    setOrigenBadge(null);

    try {
      const { posApi } = await import("../../api/api.data");
      const res = await posApi.consultarDocumentoPadron(tipoDoc, numeroDoc);
      if (res.encontrado && res.nombre) {
        setForm((prev) => ({
          ...prev,
          tipo_documento: tipoDoc,
          numero_documento: numeroDoc,
          nombre: res.nombre,
          direccion: res.direccion || prev.direccion,
          telefono: res.telefono || prev.telefono,
          email: res.email || prev.email,
        }));
        setOrigenBadge(res.origen);
      }
    } catch (err) {
      console.error("Error al consultar padrón en cliente form:", err);
    } finally {
      setConsultandoPadron(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.numero_documento.trim()) {
      setError("El número de documento es obligatorio.");
      return;
    }
    if (form.tipo_documento === "DNI" && form.numero_documento.length !== 8) {
      setError("El DNI debe contener exactamente 8 dígitos.");
      return;
    }
    if (form.tipo_documento === "RUC" && form.numero_documento.length !== 11) {
      setError("El RUC debe contener exactamente 11 dígitos.");
      return;
    }
    if (!form.nombre.trim()) {
      setError("El nombre o razón social es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form as any, mode);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al guardar los datos del cliente");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm">
                {isEdit ? "Editar Cliente" : "Nuevo Cliente POS"}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {isEdit ? `Modificando ID: ${cliente?.id.slice(0, 8)}...` : "Registro rápido de cliente"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Tipo Documento */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Tipo de Documento
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(["DNI", "RUC", "CE", "PASAPORTE"] as TipoDocumento[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo_documento: t, numero_documento: "" }))}
                  className={`py-1.5 rounded-lg transition ${form.tipo_documento === t ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Número Documento */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                Número de Documento *
              </label>
              {origenBadge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fadeIn">
                  ✓ {origenBadge}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                maxLength={form.tipo_documento === "DNI" ? 8 : form.tipo_documento === "RUC" ? 11 : 20}
                value={form.numero_documento}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setForm((f) => ({ ...f, numero_documento: v }));
                  setOrigenBadge(null);
                  const targetLen = form.tipo_documento === "DNI" ? 8 : form.tipo_documento === "RUC" ? 11 : -1;
                  if (v.length === targetLen) {
                    handleConsultarPadron(v);
                  }
                }}
                placeholder={form.tipo_documento === "DNI" ? "Ej: 72456189" : "Ej: 20123456789"}
                className="w-full pl-10 pr-24 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 font-mono tracking-wider transition"
              />
              <button
                type="button"
                disabled={consultandoPadron || !form.numero_documento}
                onClick={() => handleConsultarPadron(form.numero_documento)}
                className="absolute right-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-lg transition active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                {consultandoPadron ? (
                  <span className="animate-spin text-white">🌀</span>
                ) : (
                  <span>Buscar</span>
                )}
              </button>
            </div>
          </div>


          {/* Nombre / Razón Social */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Nombre / Razón Social *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder={form.tipo_documento === "RUC" ? "BOTICA FARMASALUD S.A.C." : "Juan Carlos Pérez"}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Dirección Fiscal / Domicilio
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.direccion}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                placeholder="Av. Las Flores 123, Urb. San José"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Teléfono / Celular
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                placeholder="987654321"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="cliente@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
              />
            </div>
          </div>

          <div className="pt-4 shrink-0">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "Guardar Cambios" : "Registrar Cliente"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slideLeft { animation: slideLeft 0.2s ease-out both; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out both; }
      `}</style>
    </div>
  );
}
