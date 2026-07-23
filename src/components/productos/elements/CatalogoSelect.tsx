// src/components/productos/elements/CatalogoSelect.tsx
import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import type { TipoCatalogo, ItemCatalogo } from "../types";
import { CATALOGO_LABELS } from "../types";
import CatalogoModal from "./CatalogoModal";

type Props = {
  tipo: TipoCatalogo;
  items: ItemCatalogo[];
  value: string;
  onChange: (id: string) => void;
  onItemCreated: (tipo: TipoCatalogo) => void;
  disabled?: boolean;
  required?: boolean;
};

/**
 * Select reutilizable para catálogos maestros.
 * Incluye una opción final "＋ Crear nuevo..." que abre CatalogoModal.
 */
export default function CatalogoSelect({
  tipo,
  items,
  value,
  onChange,
  onItemCreated,
  disabled = false,
  required = false,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const label = CATALOGO_LABELS[tipo];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__CREAR_NUEVO__") {
      setShowModal(true);
      return;
    }
    onChange(val);
  };

  const handleCreated = (item: ItemCatalogo) => {
    setShowModal(false);
    onItemCreated(tipo); // refresca el catálogo en el parent
    onChange(item.id);    // selecciona el nuevo ítem
  };

  return (
    <>
      <div>
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-white appearance-none
              pr-9 transition cursor-pointer
              ${disabled
                ? "border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                : "border-slate-200 text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400"
              }`}
          >
            <option value="">— Seleccionar {label.toLowerCase()} —</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
                {item.abreviatura ? ` (${item.abreviatura})` : ""}
              </option>
            ))}
            {!disabled && (
              <option value="__CREAR_NUEVO__" className="font-bold text-teal-700">
                <Plus className="w-4 h-4 mr-2" /> Crear nuevo {label.toLowerCase()}...
              </option>
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <CatalogoModal
        open={showModal}
        tipo={tipo}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
