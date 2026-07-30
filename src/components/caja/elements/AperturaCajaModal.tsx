import React, { useState } from "react";
import { Wallet, Check, X, Info, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (montoInicial: number, observacion?: string) => Promise<void>;
}

export default function AperturaCajaModal({ open, onClose, onConfirm }: Props) {
  const [montoInicial, setMontoInicial] = useState<number>(100);
  const [observacion, setObservacion] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (montoInicial < 0) {
      setErrorForm("El monto inicial no puede ser negativo.");
      return;
    }

    setCargando(true);
    setErrorForm(null);
    try {
      await onConfirm(Number(montoInicial), observacion.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorForm(err.message || "Error al aperturar caja");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Banner de Encabezado */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20">
              <Wallet size={26} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">Apertura de Caja de Turno</h2>
              <p className="text-xs text-emerald-200 font-medium mt-0.5">Ingresa el sencillo/fondo inicial para comenzar a vender</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorForm && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <Info size={16} className="shrink-0" />
              <span>{errorForm}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Monto Inicial de Sencillo (S/) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                S/
              </div>
              <input
                type="number"
                step="0.10"
                min="0"
                value={montoInicial}
                onChange={(e) => setMontoInicial(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                placeholder="100.00"
                required
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Efectivo en billetes y monedas dejado en cesta para dar vueltos.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Observaciones (Opcional)
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              placeholder="Ej. Sencillo recibido de turno mañana..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cargando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              <span>{cargando ? "Aperturando..." : "Confirmar Apertura"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
