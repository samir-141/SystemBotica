// src/components/compras/SelectMedicamento.tsx
// Combobox con buscador integrado para elegir el medicamento en una línea de compra.
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import type { ProductoPOS } from "../../types/api.types";

export interface MedicamentoAgrupado {
  producto: ProductoPOS;
  presentaciones: ProductoPOS[];
}

interface Props {
  value: string;
  medicamentos: MedicamentoAgrupado[];
  onChange: (productoId: string) => void;
  inputClass: string;
}

export default function SelectMedicamento({
  value,
  medicamentos,
  onChange,
  inputClass,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const seleccionado = medicamentos.find(
    (m) => m.producto.producto_comercial_id === value,
  );

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return medicamentos;
    return medicamentos.filter((m) =>
      [
        m.producto.nombre_comercial,
        m.producto.laboratorio,
        m.producto.principio_activo,
        m.producto.sku,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [medicamentos, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  const selectMedicamento = (productoId: string) => {
    onChange(productoId);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (filtrados.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filtrados.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = filtrados[highlighted];
      if (item) selectMedicamento(item.producto.producto_comercial_id);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} mt-1 flex items-center justify-between gap-2 text-left`}
      >
        <span className={`truncate ${seleccionado ? "" : "text-slate-400"}`}>
          {seleccionado
            ? `${seleccionado.producto.nombre_comercial}${
                seleccionado.producto.laboratorio
                  ? ` · ${seleccionado.producto.laboratorio}`
                  : ""
              }`
            : "— Buscar medicamento —"}
        </span>
        {seleccionado ? (
          <span
            role="button"
            aria-label="Quitar medicamento"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              selectMedicamento("");
            }}
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="shrink-0 text-slate-400">▾</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="relative border-b border-slate-100">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nombre, P. activo, lab..."
              className="w-full py-2.5 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtrados.length === 0 && (
              <li className="px-3 py-3 text-xs text-slate-400">
                Sin resultados para “{query}”.
              </li>
            )}
            {filtrados.map((m, index) => {
              const activo = index === highlighted;
              const selected = m.producto.producto_comercial_id === value;
              return (
                <li key={m.producto.producto_comercial_id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlighted(index)}
                    onClick={() =>
                      selectMedicamento(m.producto.producto_comercial_id)
                    }
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm ${
                      activo ? "bg-emerald-50" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-800">
                        {m.producto.nombre_comercial}
                      </span>
                      <span className="block truncate text-[11px] text-slate-400">
                        {m.producto.laboratorio}
                        {m.presentaciones.length > 0
                          ? ` · ${m.presentaciones.length} presentac.`
                          : ""}
                      </span>
                    </span>
                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
