// src/components/venta/ui/CartItem.tsx
import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
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
    <div className="pt-2 first:pt-0 flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">
          {item.nombre_comercial}
        </p>
        <p className="text-[10px] text-teal-600 font-bold">
          [{item.presentacion_nombre}] — {formatMoney(item.precio_unitario)} c/u
        </p>
      </div>

      <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => onUpdateQuantity(item.id_carrito, item.cantidad - 1)}
          className="p-1 text-slate-600 hover:bg-slate-100"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-6 text-center text-xs font-bold text-slate-800">
          {item.cantidad}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id_carrito, item.cantidad + 1)}
          className="p-1 text-slate-600 hover:bg-slate-100"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="text-right min-w-[50px]">
        <span className="text-xs font-extrabold text-slate-900">
          {formatMoney(item.precio_unitario * item.cantidad)}
        </span>
      </div>

      <button
        onClick={() => onRemove(item.id_carrito)}
        className="p-1 text-slate-400 hover:text-rose-600"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
