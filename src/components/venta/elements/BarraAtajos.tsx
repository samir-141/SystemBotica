// src/components/venta/elements/BarraAtajos.tsx
import { useState } from "react";
import { Keyboard, ChevronDown, ChevronUp, Search, DollarSign, UserCheck, Smartphone } from "lucide-react";

interface Props {
  onAbrirCheckout: () => void;
  onEnfocarBusqueda: () => void;
  onAbrirCliente: () => void;
  onAbrirEscannerRemoto: () => void;
}

export default function BarraAtajos({
  onAbrirCheckout,
  onEnfocarBusqueda,
  onAbrirCliente,
  onAbrirEscannerRemoto,
}: Props) {
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 hidden md:flex flex-col items-center select-none pointer-events-auto">
      {/* Botón Minimizar / Desplegar */}
      <button
        type="button"
        onClick={() => setColapsado(!colapsado)}
        className="mb-1 px-2.5 py-0.5 bg-slate-900/90 text-slate-300 hover:text-white rounded-t-lg text-[10px] font-bold flex items-center gap-1 shadow-md border-t border-x border-slate-700 backdrop-blur-xs cursor-pointer"
        title={colapsado ? "Expandir barra de atajos" : "Minimizar barra de atajos"}
      >
        <Keyboard className="w-3 h-3 text-emerald-400" />
        <span>Atajos (F2 - F6)</span>
        {colapsado ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {!colapsado && (
        <div className="bg-slate-900/95 text-white px-3 py-1.5 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          {/* F2: Cobrar */}
          <button
            type="button"
            onClick={onAbrirCheckout}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px]">F2</span>
            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cobrar</span>
          </button>

          {/* F3 o /: Buscar */}
          <button
            type="button"
            onClick={onEnfocarBusqueda}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px]">F3</span>
            <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Buscar</span>
          </button>

          {/* F4: Cliente */}
          <button
            type="button"
            onClick={onAbrirCliente}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <span className="bg-slate-700 text-slate-200 font-bold px-1.5 py-0.5 rounded text-[10px]">F4</span>
            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> Cliente</span>
          </button>

          {/* F6: Celular Remoto */}
          <button
            type="button"
            onClick={onAbrirEscannerRemoto}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <span className="bg-slate-700 text-slate-200 font-bold px-1.5 py-0.5 rounded text-[10px]">F6</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Móvil</span>
          </button>
        </div>
      )}
    </div>
  );
}
