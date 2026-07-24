import { useState, useEffect, useRef, useCallback } from "react";
import Item from "./elements/item";
import { useAuth } from "../../hooks/useAuth";
import MosProducto from "./elements/productos.muestra";
import { formatMoney } from "./utils";
import CartSummary from "./elements/CartSummary";
import { useProductos } from "./hooks/useProductos";
import type { ItemCarrito, ModoPrecio, TipoPago, ProductoAgrupado } from "./types";

export default function VentaPos() {
    const { sucursalActual } = useAuth();
    const {
        productosRaw,
        busqueda,
        setBusqueda,
        cargando,
        productosAgrupados
    } = useProductos();

    // --- Estados de Datos ---
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

    // --- Opciones Visuales / Configuración ---
    const [modoPrecio, setModoPrecio] = useState<ModoPrecio>("CON_IGV");
    const [tipoPago, setTipoPago] = useState<TipoPago>("CONTADO");
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [feedbackId, setFeedbackId] = useState<string | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus en el campo de búsqueda
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // --- Feedback de adición ---
    const triggerFeedback = useCallback((id: string) => {
        setFeedbackId(id);
        setTimeout(() => setFeedbackId(null), 400);
    }, []);

    // --- Agregar al Carrito ---
    const agregarAlCarrito = useCallback((
        producto: ProductoAgrupado | any,
        equivBase = 1,
        presentacionNombre = "Unidad",
        precio = producto.precio_actual || 0
    ) => {
        const prodId = producto.producto_comercial_id;
        triggerFeedback(prodId);
        const idCarrito = `${prodId}_${presentacionNombre}`;

        setCarrito((prev) => {
            const unidadesAnteriores = prev
                .filter((i) => i.producto_comercial_id === prodId)
                .reduce((acc, i) => acc + i.unidades_base_totales, 0);

            if (unidadesAnteriores + equivBase > producto.stock_total) {
                alert(
                    `Stock insuficiente. Disponible: ${producto.stock_total} ${producto.unidad_base_nombre || "unidades"}`
                );
                return prev;
            }

            const existe = prev.find((i) => i.id_carrito === idCarrito);
            if (existe) {
                return prev.map((i) =>
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
                    producto_comercial_id: prodId,
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
    }, [triggerFeedback]);

    // --- 1. LECTURA CONTINUA POR CÓDIGO DE BARRAS (Scanner) ---
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
                    (p) => p.codigo_barras === bufferBarcode || p.sku === bufferBarcode
                );
                if (encontrado) {
                    const agrupado = productosAgrupados.find(
                        (g) => g.producto_comercial_id === encontrado.producto_comercial_id
                    );
                    if (agrupado) {
                        agregarAlCarrito(
                            agrupado,
                            encontrado.cantidad_unidad_base || 1,
                            encontrado.presentacion_nombre || "Unidad",
                            encontrado.precio_actual
                        );
                    }
                }
                bufferBarcode = "";
            } else if (e.key.length === 1) {
                bufferBarcode += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [productosRaw, productosAgrupados, agregarAlCarrito]);

    const actualizarCantidad = useCallback((idCarrito: string, nuevaCantidad: number) => {
        if (nuevaCantidad <= 0) {
            setCarrito((prev) => prev.filter((i) => i.id_carrito !== idCarrito));
            return;
        }
        setCarrito((prev) =>
            prev.map((i) =>
                i.id_carrito === idCarrito
                    ? {
                        ...i,
                        cantidad: nuevaCantidad,
                        unidades_base_totales: nuevaCantidad * i.unidades_base_por_pack,
                    }
                    : i
            )
        );
    }, []);

    // --- 5. CÁLCULOS FINANCIEROS ---
    const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    const montoBrutoFinal = carrito.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);
    const baseImponible = montoBrutoFinal / 1.18;
    const igvCalculado = montoBrutoFinal - baseImponible;

    return (
        <div className="flex flex-col md:flex-row h-full bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
            <MosProducto
                Item={Item}
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                modoPrecio={modoPrecio}
                setModoPrecio={setModoPrecio}
                showCartMobile={showCartMobile}
                setShowCartMobile={setShowCartMobile}
                feedbackId={feedbackId}
                setFeedbackId={setFeedbackId}
                searchInputRef={searchInputRef}
                productosAgrupados={productosAgrupados}
                cargando={cargando}
                totalItems={totalItems}
                sucursalActual={sucursalActual}
                agregarAlCarrito={agregarAlCarrito}
            />
            <CartSummary
                carrito={carrito}
                actualizarCantidad={actualizarCantidad}
                totalItems={totalItems}
                tipoPago={tipoPago}
                setTipoPago={setTipoPago}
                showCartMobile={showCartMobile}
                setShowCartMobile={setShowCartMobile}
                setCarrito={setCarrito}
                montoBrutoFinal={montoBrutoFinal}
                baseImponible={baseImponible}
                igvCalculado={igvCalculado}
                formatMoney={formatMoney}
            />
        </div>
    );
}