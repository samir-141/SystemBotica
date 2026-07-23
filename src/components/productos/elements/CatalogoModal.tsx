// src/components/productos/elements/CatalogoModal.tsx
import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { posApi } from "../../api/api.data";
import type { TipoCatalogo, ItemCatalogo } from "../types";
import { CATALOGO_LABELS } from "../types";

type Props = {
  open: boolean;
  tipo: TipoCatalogo;
  onClose: () => void;
  onCreated: (item: ItemCatalogo) => void;
};

/**
 * Modal ligero para crear un ítem de catálogo maestro.
 * Se abre desde CatalogoSelect cuando el usuario elige "＋ Crear nuevo...".
 */
export default function CatalogoModal({ open, tipo, onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  /* Campos extra para laboratorios */
  const [pais, setPais] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  /* Campos extra para unidades-presentacion */
  const [abreviatura, setAbreviatura] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = CATALOGO_LABELS[tipo];
  const isLaboratorio = tipo === "laboratorios";
  const isPresentacion = tipo === "unidades-presentacion";

  const handleSubmit = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, string> = { nombre: nombre.trim() };
      if (descripcion.trim()) payload.descripcion = descripcion.trim();
      if (isLaboratorio) {
        if (pais.trim()) payload.pais = pais.trim();
        if (telefono.trim()) payload.telefono = telefono.trim();
        if (email.trim()) payload.email = email.trim();
      }
      if (isPresentacion && abreviatura.trim()) {
        payload.abreviatura = abreviatura.trim();
      }

      const created = await posApi.crearItemCatalogo(tipo, payload);
      onCreated(created);
      resetForm();
    } catch (err: any) {
      setError(err.message ?? "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setPais("");
    setTelefono("");
    setEmail("");
    setAbreviatura("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm">Nuevo {label}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Nombre (siempre requerido) */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Nombre *
            </label>
            <input
              autoFocus
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={`Ej: ${tipo === "laboratorios" ? "Pfizer" : tipo === "categorias" ? "Analgésicos" : "Nombre"}`}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                placeholder:text-slate-300 transition"
            />
          </div>

          {/* Descripción (opcional, siempre) */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Opcional"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                placeholder:text-slate-300 transition"
            />
          </div>

          {/* Extra: Laboratorio */}
          {isLaboratorio && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  País
                </label>
                <input
                  type="text"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  placeholder="Ej: Perú"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                    placeholder:text-slate-300 transition"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="01-2345678"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                    placeholder:text-slate-300 transition"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@lab.com"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                    placeholder:text-slate-300 transition"
                />
              </div>
            </div>
          )}

          {/* Extra: Presentación */}
          {isPresentacion && (
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Abreviatura
              </label>
              <input
                type="text"
                value={abreviatura}
                onChange={(e) => setAbreviatura(e.target.value)}
                placeholder="Ej: UND, CJA, BLI"
                maxLength={5}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                  focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                  placeholder:text-slate-300 transition font-mono uppercase"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200
              rounded-xl hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!nombre.trim() || saving}
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700
              disabled:bg-slate-200 disabled:text-slate-400 rounded-xl shadow-sm transition
              flex items-center gap-1.5 active:scale-[0.98]"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Crear {label}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out both; }
      `}</style>
    </div>
  );
}
