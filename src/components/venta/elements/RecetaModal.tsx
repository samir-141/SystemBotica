// src/components/venta/elements/RecetaModal.tsx
import React, { useState, useEffect } from "react";
import { FileText, ShieldAlert, X, CheckCircle2, Stethoscope, CheckSquare, Square } from "lucide-react";

interface Props {
  open: boolean;
  nombreProducto?: string | null;
  initialValue?: string | null;
  onClose: () => void;
  onConfirm: (numeroReceta: string, recordarParaVenta: boolean) => void;
}

export default function RecetaModal({
  open,
  nombreProducto,
  initialValue = "",
  onClose,
  onConfirm,
}: Props) {
  const [numeroReceta, setNumeroReceta] = useState(initialValue || "");
  const [recordarParaVenta, setRecordarParaVenta] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setNumeroReceta(initialValue || "");
      setRecordarParaVenta(true);
      setError("");
    }
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = numeroReceta.trim();
    if (!trimmed) {
      setError("El número de receta médica o CMP es obligatorio.");
      return;
    }
    onConfirm(trimmed, recordarParaVenta);
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
              <h3 className="font-bold text-base leading-tight">
                {nombreProducto ? "Receta Médica Obligatoria" : "Receta Médica de la Venta"}
              </h3>
              <p className="text-xs text-red-100 font-medium">Control de medicamentos regulados</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 font-medium">
              {nombreProducto ? (
                <>
                  El producto <strong className="font-bold text-red-950">{nombreProducto}</strong> exige verificación física de receta médica antes de ser dispensado.
                </>
              ) : (
                <>
                  Ingresa los datos de la receta médica. Se aplicará a todos los medicamentos regulados de esta atención.
                </>
              )}
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

          {/* Opción para aplicar a toda la venta */}
          <div
            onClick={() => setRecordarParaVenta(!recordarParaVenta)}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer select-none transition"
          >
            <button
              type="button"
              className="mt-0.5 text-teal-600 focus:outline-none cursor-pointer"
            >
              {recordarParaVenta ? (
                <CheckSquare className="w-4 h-4 text-teal-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <div className="text-xs">
              <p className="font-bold text-slate-800">Recordar para toda esta venta (Recomendado)</p>
              <p className="text-[11px] text-slate-500">
                Los siguientes medicamentos que requieran receta se agregarán automáticamente con este número.
              </p>
            </div>
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
              <CheckCircle2 className="w-4 h-4" /> Confirmar y Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
