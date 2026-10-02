import React, { useEffect } from 'react';
import {
  Globe,
  ShieldCheck,
  Layers,
  UserCheck,
  ShoppingCart,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  useEmisionProgresoStore,
  ETAPAS_EMISION_SOL,
} from '../../store/useEmisionProgresoStore';
import { useSocket } from '../../contexts/socket-context';

export const EmisionProgresoModal: React.FC = () => {
  const {
    isOpen,
    modo,
    tipoComprobante,
    pasoActual,
    titulo,
    descripcion,
    porcentaje,
    estado,
    mensajeError,
    numeroComprobante,
    detalles,
    actualizarProgreso,
    cerrar,
  } = useEmisionProgresoStore();

  const { socket } = useSocket();

  // 1. Escuchar eventos de progreso en tiempo real desde el backend por WebSockets
  useEffect(() => {
    if (!socket || !isOpen) return;

    interface ProgresoPayload {
      paso?: number;
      totalPasos?: number;
      titulo?: string;
      descripcion?: string;
      porcentaje?: number;
      etapa?: string;
    }

    const handleProgreso = (data: ProgresoPayload) => {
      if (data && typeof data.paso === 'number') {
        actualizarProgreso({
          paso: data.paso,
          totalPasos: data.totalPasos,
          titulo: data.titulo,
          descripcion: data.descripcion,
          porcentaje: data.porcentaje,
          etapa: data.etapa,
        });
      }
    };

    socket.on('facturacion.progreso', handleProgreso);

    return () => {
      socket.off('facturacion.progreso', handleProgreso);
    };
  }, [socket, isOpen, actualizarProgreso]);

  // 2. Prevenir tecla Escape para no cancelar el bloqueo mientras procesa
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && estado === 'PROCESANDO') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, estado]);

  if (!isOpen) return null;

  // Icono dinámico según el paso
  const renderPasoIcon = () => {
    if (estado === 'EXITO') {
      return <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />;
    }
    if (estado === 'ERROR') {
      return <AlertCircle className="w-12 h-12 text-rose-400 animate-pulse" />;
    }

    switch (pasoActual) {
      case 1:
        return <Globe className="w-10 h-10 text-emerald-400 animate-pulse" />;
      case 2:
        return <ShieldCheck className="w-10 h-10 text-teal-400 animate-pulse" />;
      case 3:
        return <Layers className="w-10 h-10 text-cyan-400 animate-pulse" />;
      case 4:
        return <UserCheck className="w-10 h-10 text-emerald-400 animate-pulse" />;
      case 5:
        return <ShoppingCart className="w-10 h-10 text-amber-400 animate-pulse" />;
      case 6:
        return <FileCheck2 className="w-10 h-10 text-emerald-400 animate-pulse" />;
      case 7:
        return <CheckCircle2 className="w-10 h-10 text-emerald-300 animate-pulse" />;
      default:
        return <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />;
    }
  };

  // Cálculo del offset SVG para el círculo de progreso
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (porcentaje / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none transition-all duration-300"
      style={{ pointerEvents: 'all' }}
    >
      {/* Contenedor con brillo ambiental */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 p-6 md:p-8 text-white">
        {/* Halo decorativo de fondo */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado: Badges de Estado */}
        <div className="relative flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {estado === 'PROCESANDO' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  estado === 'EXITO'
                    ? 'bg-emerald-400'
                    : estado === 'ERROR'
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                }`}
              />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {estado === 'PROCESANDO'
                ? 'Automatización en Curso'
                : estado === 'EXITO'
                  ? 'Emisión Completada'
                  : 'Atención Requerida'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            {modo === 'CREACION' ? (
              <>
                <Sparkles size={12} className="text-emerald-400" />
                <span>NUEVA {tipoComprobante}</span>
              </>
            ) : (
              <>
                <RefreshCw size={12} className="text-amber-400" />
                <span className="text-amber-300">REINTENTO SUNAT</span>
              </>
            )}
          </div>
        </div>

        {/* Loader Circular Central con Animación */}
        <div className="relative flex flex-col items-center justify-center my-4">
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Círculo de fondo */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              {/* Círculo dinámico de progreso */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`transition-all duration-700 ease-out ${
                  estado === 'ERROR'
                    ? 'stroke-rose-500'
                    : 'stroke-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Icono central animado */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {renderPasoIcon()}
              {estado === 'PROCESANDO' && (
                <span className="text-xs font-mono font-bold text-emerald-300 mt-1">
                  {porcentaje}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Título y Descripción de la Etapa */}
        <div className="relative text-center mb-6 px-2 min-h-[70px]">
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-white mb-1.5 transition-all duration-300">
            {estado === 'ERROR' ? 'Observación en la Emisión' : titulo}
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            {estado === 'ERROR' ? mensajeError : descripcion}
          </p>

          {/* Información complementaria de la venta si existe */}
          {detalles?.total && estado === 'PROCESANDO' && (
            <div className="mt-2 text-xs font-medium text-emerald-400/90">
              Total venta: S/ {detalles.total.toFixed(2)}
              {detalles.cliente && ` • ${detalles.cliente}`}
            </div>
          )}

          {/* Número de comprobante si finalizó con éxito */}
          {estado === 'EXITO' && numeroComprobante && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-base shadow-inner">
              <span>{numeroComprobante}</span>
            </div>
          )}
        </div>

        {/* Stepper de 7 Pasos (Mini-indicadores interactivos) */}
        {estado === 'PROCESANDO' && (
          <div className="relative mb-6">
            <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
              {ETAPAS_EMISION_SOL.map((etapa) => {
                const completado = etapa.paso < pasoActual;
                const activo = etapa.paso === pasoActual;

                return (
                  <div
                    key={etapa.paso}
                    className="flex flex-col items-center flex-1 group"
                    title={`${etapa.paso}. ${etapa.titulo}`}
                  >
                    <div
                      className={`relative flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold transition-all duration-500 ${
                        completado
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                          : activo
                            ? 'bg-emerald-400 text-slate-950 font-black ring-4 ring-emerald-500/30 scale-110'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {completado ? '✓' : etapa.paso}
                    </div>
                    <span
                      className={`text-[9px] mt-1.5 truncate max-w-[48px] text-center transition-colors duration-300 ${
                        activo
                          ? 'text-emerald-300 font-bold'
                          : completado
                            ? 'text-slate-300'
                            : 'text-slate-500'
                      }`}
                    >
                      {etapa.nombreCorto}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Barra de Progreso Inferior */}
        {estado === 'PROCESANDO' && (
          <div className="relative w-full bg-slate-800/80 rounded-full h-2 mb-4 overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 rounded-full shadow-lg shadow-emerald-500/50"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        )}

        {/* Pie de modal: Aviso de seguridad o Botón de acción */}
        <div className="relative flex items-center justify-center pt-2">
          {estado === 'PROCESANDO' ? (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 text-center">
              <Lock size={12} className="text-emerald-400 shrink-0" />
              <span>
                Por favor, no recargue ni cierre la ventana mientras se procesa en SUNAT.
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={cerrar}
              className={`w-full py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                estado === 'EXITO'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <span>{estado === 'EXITO' ? 'Continuar' : 'Entendido, Cerrar'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
