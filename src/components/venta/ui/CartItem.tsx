// src/components/venta/ui/CartItem.tsx
import React from "react";
import { Minus, Plus, Trash2, ShieldAlert } from "lucide-react";
import { formatMoney } from "../utils";
import type { ItemCarrito } from "../types";

interface CartItemProps {
  item: ItemCarrito;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <div className="py-2 border-b border-slate-100 last:border-0 flex items-center justify-between gap-2 hover:bg-slate-50/60 px-1 rounded-xl transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">
          {item.nombre_comercial}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-[10px] text-teal-600 font-bold">
            [{item.presentacion_nombre}] — {formatMoney(item.precio_unitario)} c/u
          </p>
          {(item.requiere_receta || item.numero_receta) && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md" title={`Receta médica asociada: ${item.numero_receta || "Verificada"}`}>
              <ShieldAlert size={10} className="text-red-600" />
              <span>{item.numero_receta ? `Receta: ${item.numero_receta}` : "Con Receta"}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-xs overflow-hidden shrink-0">
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id_carrito, item.cantidad - 1)}
          className="p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
          title="Disminuir cantidad"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center text-xs font-bold text-slate-800">
          {item.cantidad}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.id_carrito, item.cantidad + 1)}
          className="p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
          title="Aumentar cantidad"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="text-right min-w-[55px] shrink-0">
        <span className="text-xs font-black text-slate-900">
          {formatMoney(item.precio_unitario * item.cantidad)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id_carrito)}
        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
        title="Quitar producto"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
