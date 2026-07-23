// src/components/venta/hooks/useCart.ts
import { useState, useCallback } from "react";
import { formatMoney } from "../utils"; // optional utility, we'll create if missing
import type { ItemCarrito, PresentacionOption } from "../types";

export const useCart = () => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const triggerFeedback = (id: string) => {
    // Placeholder for feedback logic; can be integrated with UI later
    // For now we simply expose the setter via a callback
    // The original component used setFeedbackId; we keep it external
  };

  const agregarAlCarrito = useCallback(
    (
      producto: any,
      equivBase = 1,
      presentacionNombre = "Unidad",
      precio = producto.precio_actual
    ) => {
      const idCarrito = `${producto.producto_comercial_id}_${presentacionNombre}`;
      setCarrito(prev => {
        const unidadesAnteriores = prev
          .filter(i => i.producto_comercial_id === producto.producto_comercial_id)
          .reduce((acc, i) => acc + i.unidades_base_totales, 0);
        if (unidadesAnteriores + equivBase > producto.stock_total) {
          alert(`Stock insuficiente. Disponible: ${producto.stock_total}`);
          return prev;
        }
        const existe = prev.find(i => i.id_carrito === idCarrito);
        if (existe) {
          return prev.map(i =>
            i.id_carrito === idCarrito
              ? {
                ...i,
                cantidad: i.cantidad + 1,
                unidades_base_totales: (i.cantidad + 1) * equivBase,
              }
              : i
          );
        }
        return [
          ...prev,
          {
            id_carrito: idCarrito,
            producto_comercial_id: producto.producto_comercial_id,
            nombre_comercial: producto.nombre_comercial,
            presentacion_nombre: presentacionNombre,
            precio_unitario: precio,
            cantidad: 1,
            unidades_base_por_pack: equivBase,
            unidades_base_totales: equivBase,
            lote_fefo_numero: producto.lote_fefo_numero || "LOTE-STD",
            lote_fefo_vencimiento: producto.lote_fefo_vencimiento || "",
          },
        ];
      });
    },
    []
  );

  const actualizarCantidad = useCallback(
    (idCarrito: string, nuevaCantidad: number) => {
      if (nuevaCantidad <= 0) {
        setCarrito(prev => prev.filter(i => i.id_carrito !== idCarrito));
        return;
      }
      setCarrito(prev =>
        prev.map(i =>
          i.id_carrito === idCarrito
            ? {
              ...i,
              cantidad: nuevaCantidad,
              unidades_base_totales: nuevaCantidad * i.unidades_base_por_pack,
            }
            : i
        )
      );
    },
    []
  );

  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  const montoBrutoFinal = carrito.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);
  const baseImponible = montoBrutoFinal / 1.18;
  const igvCalculado = montoBrutoFinal - baseImponible;

  return {
    carrito,
    setCarrito,
    agregarAlCarrito,
    actualizarCantidad,
    totalItems,
    montoBrutoFinal,
    baseImponible,
    igvCalculado,
    formatMoney,
  };
};
