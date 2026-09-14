// PosFrontend/src/components/productos/elements/BibliotecaBanner.tsx
import React from 'react';
import { Sparkles, Building2, FlaskConical, Layers, ArrowRight, Loader2, Check } from 'lucide-react';
import type { ProductoBibliotecaMaestro } from '../../../services/biblioteca.service';

interface Props {
  producto: ProductoBibliotecaMaestro;
  cargando: boolean;
  aplicado: boolean;
  onAplicar: () => void;
}

export const BibliotecaBanner: React.FC<Props> = ({
  producto,
  cargando,
  aplicado,
  onAplicar,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50/30 p-4 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                Biblioteca Maestra
              </span>
              <span className="text-xs text-slate-500 font-mono">
                EAN: {producto.codigo_barras}
              </span>
            </div>
            <h4 className="mt-0.5 text-sm font-black text-slate-900">
              {producto.nombre_comercial}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              {producto.laboratorio && (
                <span className="inline-flex items-center gap-1 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                  {producto.laboratorio}
                </span>
              )}
              {producto.principio_activo && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                  <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
                  {producto.principio_activo} {producto.concentracion ? `(${producto.concentracion}${producto.unidad_concentracion || 'mg'})` : ''}
                </span>
              )}
              {producto.unidad_presentacion && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  {producto.unidad_presentacion} {producto.cantidad_unidad_base > 1 ? `x ${producto.cantidad_unidad_base}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end pt-2 sm:pt-0">
          <button
            type="button"
            onClick={onAplicar}
            disabled={cargando || aplicado}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black shadow-sm transition-all active:scale-95 ${
              aplicado
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-600/20'
            }`}
          >
            {cargando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando datos...</span>
              </>
            ) : aplicado ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Datos precargados</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Autocompletar ficha</span>
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
