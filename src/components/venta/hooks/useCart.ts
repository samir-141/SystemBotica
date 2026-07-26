// src/components/venta/hooks/useCart.ts
import { useState, useEffect, useCallback, useRef } from "react";
import type { ItemCarrito } from "../types";
import { calcularTotales, formatMoney } from "../utils/calculosVenta";
import {
  cargarCarritoStorage,
  guardarCarritoStorage,
  limpiarCarritoStorage,
  suscribirCambiosCarrito,
} from "../utils/cartStorage";

export const useCart = () => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [isCargado, setIsCargado] = useState(false);
  const isBroadcastingRef = useRef(false);

  // Cargar carrito persistido en IndexedDB al montar
  useEffect(() => {
    let cancelado = false;
    cargarCarritoStorage().then(cargado => {
      if (!cancelado) {
        setCarrito(cargado);
        setIsCargado(true);
      }
    });

    // Suscribirse a actualizaciones de otras pestañas en tiempo real
    const desuscribir = suscribirCambiosCarrito(nuevoCarrito => {
      isBroadcastingRef.current = true;
      setCarrito(nuevoCarrito);
    });

    return () => {
      cancelado = true;
      desuscribir();
    };
  }, []);

  // Persistir cambios del carrito en IndexedDB y notificar a otras pestañas
  useEffect(() => {
    if (!isCargado) return;

    if (isBroadcastingRef.current) {
      isBroadcastingRef.current = false;
      return;
    }

    guardarCarritoStorage(carrito);
  }, [carrito, isCargado]);

  const agregarAlCarrito = useCallback(
    (
      producto: any,
      equivBase = 1,
      presentacionNombre = "Unidad",
      precio = producto.precio_actual,
      numeroReceta?: string
    ) => {
      const idCarrito = `${producto.producto_comercial_id}_${presentacionNombre}`;
      setCarrito(prev => {
        const unidadesAnteriores = prev
          .filter(i => i.producto_comercial_id === producto.producto_comercial_id)
          .reduce((acc, i) => acc + i.unidades_base_totales, 0);
        if (unidadesAnteriores + equivBase > producto.stock_total) {
          if (typeof alert !== "undefined") {
            alert(`Stock insuficiente. Disponible: ${producto.stock_total}`);
          }
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
                numero_receta: numeroReceta || i.numero_receta,
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
            requiere_receta: Boolean(producto.requiere_receta),
            numero_receta: numeroReceta || "",
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

  const limpiarCarrito = useCallback(async () => {
    setCarrito([]);
    await limpiarCarritoStorage();
  }, []);

  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  const totales = calcularTotales(carrito);

  return {
    carrito,
    setCarrito,
    agregarAlCarrito,
    actualizarCantidad,
    limpiarCarrito,
    isCargado,
    totalItems,
    montoBrutoFinal: totales.montoNetoFinal,
    baseImponible: totales.baseImponible,
    igvCalculado: totales.igvCalculado,
    formatMoney,
  };
};
