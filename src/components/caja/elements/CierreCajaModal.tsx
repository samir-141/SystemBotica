import React, { useState } from "react";
import { Lock, Check, X, AlertCircle, Printer, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import type { EstadoCaja } from "../hooks/useCaja";

interface Props {
  open: boolean;
  onClose: () => void;
  estadoCaja: EstadoCaja | null;
  onConfirm: (efectivoContado: number, observacion?: string) => Promise<any>;
}

export default function CierreCajaModal({ open, onClose, estadoCaja, onConfirm }: Props) {
  const [efectivoContado, setEfectivoContado] = useState<number>(estadoCaja?.efectivo_esperado || 0);
  const [observacion, setObservacion] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [resumenCierreFinal, setResumenCierreFinal] = useState<any | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  if (!open || !estadoCaja) return null;

  const efectivoEsperado = estadoCaja.efectivo_esperado || 0;
  const diferencia = (Number(efectivoContado) || 0) - efectivoEsperado;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (efectivoContado < 0) {
      setErrorForm("El efectivo contado no puede ser negativo.");
      return;
    }

    setCargando(true);
    setErrorForm(null);
    try {
      const res = await onConfirm(Number(efectivoContado), observacion.trim() || undefined);
      setResumenCierreFinal(res.resumen_cierre);
    } catch (err: any) {
      setErrorForm(err.message || "Error al realizar el cierre de caja");
    } finally {
      setCargando(false);
    }
  };

  const handlePrintCierreZ = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Vista si ya se procesó el cierre Z con éxito */}
        {resumenCierreFinal ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <Check size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900">¡Cierre Z de Caja Completado!</h2>
              <p className="text-xs text-slate-500 font-medium">Turno cerrado correctamente en el sistema</p>
            </div>

            {/* Resumen impreso Z */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 font-mono text-xs text-slate-800 break-inside-avoid">
              <div className="flex justify-between border-b border-slate-200 pb-2 font-extrabold text-slate-900">
                <span>REPORTE CORTE Z - CAJA</span>
                <span>{new Date(resumenCierreFinal.fecha_cierre).toLocaleDateString("es-PE")}</span>
              </div>
              <div className="flex justify-between">
                <span>EFECTIVO ESPERADO:</span>
                <span>S/ {resumenCierreFinal.efectivo_esperado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>EFECTIVO CONTADO:</span>
                <span className="font-bold">S/ {resumenCierreFinal.efectivo_contado.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <span>DIFERENCIA ({resumenCierreFinal.tipo_diferencia}):</span>
                <span className={resumenCierreFinal.diferencia < 0 ? "text-rose-600" : "text-emerald-700"}>
                  S/ {resumenCierreFinal.diferencia.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrintCierreZ}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Printer size={16} />
                <span>Imprimir Comprobante Corte Z</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                Finalizar
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Arqueo y Cierre */
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 p-6 text-white relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-400/30">
                  <Lock size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">Arqueo y Cierre Z de Caja</h2>
                  <p className="text-xs text-rose-200 font-medium mt-0.5">Ingresa el efectivo contado para finalizar el turno</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {errorForm && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorForm}</span>
                </div>
              )}

              {/* Resumen del Sistema */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cálculo del Sistema (Esperado)</h3>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Monto Inicial (Sencillo)</span>
                    <span className="font-bold text-slate-800 text-sm">S/ {estadoCaja.monto_inicial.toFixed(2)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Ventas en Efectivo</span>
                    <span className="font-bold text-emerald-700 text-sm">S/ {estadoCaja.ventas_efectivo.toFixed(2)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Ventas Digitales (Yape/Tarjetas)</span>
                    <span className="font-bold text-blue-700 text-sm">S/ {estadoCaja.ventas_digitales.toFixed(2)}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Efectivo Esperado en Cesta</span>
                    <span className="font-black text-slate-900 text-sm">S/ {efectivoEsperado.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Campo para ingresar efectivo contado */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Efectivo Real Contado en Cesta (S/) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    S/
                  </div>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={efectivoContado}
                    onChange={(e) => setEfectivoContado(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Badge de diferencia */}
                <div className="flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all">
                  <span className="text-slate-600">Diferencia de Arqueo:</span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                    diferencia === 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : diferencia > 0
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {diferencia === 0 ? (
                      <>
                        <Check size={14} /> EXACTO (S/ 0.00)
                      </>
                    ) : diferencia > 0 ? (
                      <>
                        <ArrowUpRight size={14} /> SOBRANTE: S/ {diferencia.toFixed(2)}
                      </>
                    ) : (
                      <>
                        <ArrowDownRight size={14} /> FALTANTE: S/ {Math.abs(diferencia).toFixed(2)}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Observación */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Observaciones de Cierre (Opcional)
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Ej. Sencillo dejado para el turno noche..."
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
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cargando ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  <span>{cargando ? "Cerrando..." : "Confirmar Cierre Z"}</span>
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
