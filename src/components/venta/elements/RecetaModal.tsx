// src/components/venta/elements/RecetaModal.tsx
import React, { useState, useEffect } from "react";
import { FileText, ShieldAlert, X, CheckCircle2, Stethoscope } from "lucide-react";

interface Props {
  open: boolean;
  nombreProducto: string;
  onClose: () => void;
  onConfirm: (numeroReceta: string) => void;
}

export default function RecetaModal({ open, nombreProducto, onClose, onConfirm }: Props) {
  const [numeroReceta, setNumeroReceta] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setNumeroReceta("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = numeroReceta.trim();
    if (!trimmed) {
      setError("El número de receta médica o CMP es obligatorio.");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
        {/* Header de Alerta Farmacéutica */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Receta Médica Obligatoria</h3>
              <p className="text-xs text-red-100 font-medium">Control de medicamentos regulados</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 font-medium">
              El producto <strong className="font-bold text-red-950">{nombreProducto}</strong> exige verificación física de receta médica antes de ser agregado a la venta.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" /> Número de Receta / N° Colegiatura (CMP)
            </label>
            <input
              type="text"
              value={numeroReceta}
              onChange={(e) => {
                setNumeroReceta(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej. REC-2026-84920 o CMP-4821"
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {error && <p className="mt-1.5 text-xs text-red-600 font-bold">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirmar y Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
