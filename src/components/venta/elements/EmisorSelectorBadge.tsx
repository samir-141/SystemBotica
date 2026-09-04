// src/components/venta/elements/EmisorSelectorBadge.tsx
import React, { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useEmisorActivo } from "../../../hooks/useEmisorActivo";

export const EmisorSelectorBadge: React.FC = () => {
  const {
    emisorActivo,
    perfiles,
    cambiarEmisor,
    puedeCambiarEmisor,
    esNuevoRus,
  } = useEmisorActivo();

  const [abierto, setAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!emisorActivo && perfiles.length === 0) {
    return null;
  }

  const tieneMultiples = perfiles.length > 1;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={!tieneMultiples || !puedeCambiarEmisor}
        onClick={() => setAbierto((prev) => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
          esNuevoRus
            ? "bg-amber-50/80 border-amber-300/80 text-amber-900"
            : "bg-blue-50/80 border-blue-300/80 text-blue-900"
        } ${
          tieneMultiples && puedeCambiarEmisor
            ? "cursor-pointer hover:shadow-xs active:scale-95"
            : "cursor-default opacity-90"
        }`}
        title={
          tieneMultiples && puedeCambiarEmisor
            ? "Clic para cambiar el RUC / Emisor tributario activo"
            : "Emisor tributario activo configurado"
        }
      >
        <Building2
          size={13}
          className={esNuevoRus ? "text-amber-600" : "text-blue-600"}
        />
        <div className="flex items-center gap-1">
          <span className="font-bold truncate max-w-[120px] sm:max-w-[160px]">
            {emisorActivo?.razon_social || emisorActivo?.nombre_comercial || "Emisor"}
          </span>
          <span className="text-[10px] font-mono px-1 py-0.2 bg-white/80 rounded border border-current opacity-80">
            RUC {emisorActivo?.ruc}
          </span>
          <span
            className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
              esNuevoRus
                ? "bg-amber-200 text-amber-900"
                : "bg-blue-200 text-blue-900"
            }`}
          >
            {emisorActivo?.regimen_tributario || "GENERAL"}
          </span>
        </div>
        {tieneMultiples && puedeCambiarEmisor && (
          <ChevronDown size={12} className="text-slate-500 ml-0.5" />
        )}
      </button>

      {/* Dropdown de Selección de Emisor */}
      {abierto && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Seleccionar Emisor Tributario
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
              {perfiles.length} RUCs
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
            {perfiles.map((p) => {
              const seleccionado = p.id === emisorActivo?.id;
              const pEsRus =
                p.regimen_tributario === "NRUS" ||
                p.regimen_tributario === "NUEVO_RUS";

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    cambiarEmisor(p.id);
                    setAbierto(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-start justify-between gap-2 cursor-pointer ${
                    seleccionado
                      ? "bg-emerald-50/80 border border-emerald-300 text-emerald-950 font-semibold"
                      : "hover:bg-slate-50 text-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold truncate text-slate-900">
                        {p.razon_social}
                      </span>
                      {p.es_principal && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 rounded font-bold">
                          Principal
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                      <span>RUC: {p.ruc}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          pEsRus ? "text-amber-700" : "text-blue-700"
                        }`}
                      >
                        {p.regimen_tributario}
                      </span>
                    </div>
                    {pEsRus && (
                      <p className="text-[10px] text-amber-700 mt-0.5 font-normal">
                        Solo emite Boletas y Tickets (No Factura)
                      </p>
                    )}
                  </div>
                  {seleccionado && (
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500">
            Los comprobantes emitidos usarán las series y datos del emisor activo.
          </div>
        </div>
      )}
    </div>
  );
};
