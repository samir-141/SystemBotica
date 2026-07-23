// src/components/venta/hooks/useBarcodeScanner.ts
import { useEffect, useRef } from "react";
import type { ProductoPOS } from "../../api/api.data";


export const useBarcodeScanner = (
  productosRaw: ProductoPOS[],
  agregarAlCarrito: (
    producto: any,
    equivBase?: number,
    presentacionNombre?: string,
    precio?: number
  ) => void
) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let bufferBarcode = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 50) {
        bufferBarcode = "";
      }
      lastKeyTime = currentTime;

      if (e.key === "Enter" && bufferBarcode.length >= 3) {
        const encontrado = productosRaw.find(
          p => p.codigo_barras === bufferBarcode || p.sku === bufferBarcode
        );
        if (encontrado) {
          agregarAlCarrito(
            encontrado,
            1,
            encontrado.presentacion_nombre || "Unidad",
            encontrado.precio_actual
          );
          bufferBarcode = "";
        }
      } else if (e.key.length === 1) {
        bufferBarcode += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [productosRaw, agregarAlCarrito]);

  // Auto‑focus on mount (mirrors original behavior)
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return { searchInputRef };
};
