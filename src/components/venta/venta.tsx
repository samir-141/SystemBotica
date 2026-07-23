import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Item, { type PresentacionOption } from "./elements/item";
import { api } from "../api/client";
import type { ProductoPOS, PaginatedResponse } from "../api/api.data";
import { useAuth } from "../../hooks/useAuth";
import MosProducto from "./elements/productos.muestra";
import { formatMoney } from "./utils";
import CartSummary from "./elements/CartSummary";
// Tipo para items en el carrito
interface ItemCarrito {
    id_carrito: string;
    producto_comercial_id: string;
    nombre_comercial: string;
    presentacion_nombre: string;
    precio_unitario: number;
    cantidad: number;
    unidades_base_por_pack: number;
    unidades_base_totales: number;
    lote_fefo_numero: string;
    lote_fefo_vencimiento: string;
}

type ModoPrecio = "CON_IGV" | "SIN_IGV";
type TipoPago = "CONTADO" | "ABONO" | "ANTICIPO";

// formatMoney imported from utils

export default function VentaPos() {
    const { sucursalActual } = useAuth();

    // --- Estados de Datos ---
    const [productosRaw, setProductosRaw] = useState<ProductoPOS[]>([]);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [, setError] = useState<string | null>(null);

    // --- Opciones Visuales / Configuración ---
    const [modoPrecio, setModoPrecio] = useState<ModoPrecio>("CON_IGV");
    const [tipoPago, setTipoPago] = useState<TipoPago>("CONTADO");
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [feedbackId, setFeedbackId] = useState<string | null>(null);
    // 1. Inicia con la primera opción por defecto (ej: Caja)

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Auto-focus en el campo de búsqueda
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    // --- 1. LECTURA CONTINUA POR CÓDIGO DE BARRAS (Scanner) ---
    useEffect(() => {
        let bufferBarcode = "";
        let lastKeyTime = Date.now();

        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();

            // Si la velocidad entre teclas es menor a 30ms, es una pistola lectora
            if (currentTime - lastKeyTime > 50) {
                bufferBarcode = "";
            }
            lastKeyTime = currentTime;

            if (e.key === "Enter" && bufferBarcode.length >= 3) {
                // Buscar y agregar de inmediato al carrito el producto escaneado
                const encontrado = productosRaw.find(
                    (p) => p.codigo_barras === bufferBarcode || p.sku === bufferBarcode
                );
                if (encontrado) {
                    agregarAlCarrito(encontrado, 1, encontrado.presentacion_nombre || "Unidad", encontrado.precio_actual);
                    bufferBarcode = "";
                }
            } else if (e.key.length === 1) {
                bufferBarcode += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [productosRaw]);

    // --- 2. CARGA DE PRODUCTOS DE LA SUCURSAL ACTUAL ---
    const fetchProductos = useCallback(async (termino: string) => {
        setCargando(true);
        setError(null);
        try {
            const { data } = await api.get<PaginatedResponse<ProductoPOS>>("/productos", {
                params: {
                    buscar: termino || undefined,
                    limit: 60,
                    orden: "nombre_asc",
                },
            });
            // Filtrar solo medicamentos que cuenten con stock > 0
            const soloConStock = (data.data || []).filter((p) => p.stock_total > 0);
            setProductosRaw(soloConStock);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al conectar con el inventario de la sucursal");
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProductos(busqueda);
        }, 250);
        return () => clearTimeout(timer);
    }, [busqueda, fetchProductos]);

    // --- 3. CONVERSIÓN DE UNIDADES Y CÁLCULO DE STOCK (Cajas + Unidades Sueltas) ---
    const productosAgrupados = useMemo(() => {
        const mapa = new Map<string, any>();

        productosRaw.forEach((prod) => {
            // Usamos el SKU o el ID comercial como clave de agrupación
            const key = prod.sku || prod.producto_comercial_id;

            if (!mapa.has(key)) {
                mapa.set(key, {
                    producto_comercial_id: prod.producto_comercial_id,
                    sku: prod.sku || "SIN SKU",
                    nombre_comercial: prod.nombre_comercial,
                    principio_activo: prod.principio_activo,
                    laboratorio: prod.laboratorio,
                    requiere_receta: prod.requiere_receta,
                    stock_total: prod.stock_total, // Stock en unidades base (comprimidos/pastillas)
                    unidad_base_nombre: prod.unidad_abreviatura || "unid",
                    presentaciones: [] as PresentacionOption[],
                });
            }

            const itemAgrupado = mapa.get(key);

            // Verificamos si la presentación (Caja, Blíster, Unidad) ya está agregada al array
            const presExistente = itemAgrupado.presentaciones.some(
                (p: PresentacionOption) => p.id === (prod.presentacion_id || prod.presentacion_nombre)
            );

            if (!presExistente) {
                itemAgrupado.presentaciones.push({
                    id: prod.presentacion_id || `${prod.producto_comercial_id}_${prod.presentacion_nombre}`,
                    nombre: prod.presentacion_nombre || "Unidad",
                    cantidad_unidad_base: prod.cantidad_unidad_base || 1, // Ej: 100 para Caja, 10 para Blíster, 1 para Unidad
                    precio: prod.precio_actual,
                });
            }
        });

        return Array.from(mapa.values());
    }, [productosRaw]);

    // --- 4. ACCIONES DEL CARRITO ---
    const triggerFeedback = (id: string) => {
        setFeedbackId(id);
        setTimeout(() => setFeedbackId(null), 400);
    };

    const agregarAlCarrito = (
        producto: any,
        equivBase = 1,
        presentacionNombre = "Unidad",
        precio = producto.precio_actual
    ) => {
        triggerFeedback(producto.producto_comercial_id);
        const idCarrito = `${producto.producto_comercial_id}_${presentacionNombre}`;

        setCarrito((prev) => {
            const unidadesAnteriores = prev
                .filter((i) => i.producto_comercial_id === producto.producto_comercial_id)
                .reduce((acc, i) => acc + i.unidades_base_totales, 0);

            if (unidadesAnteriores + equivBase > producto.stock_total) {
                alert(`Stock insuficiente. Disponible: ${producto.stock_total} ${producto.unidadBaseNombre || "unidades"}`);
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
    };

    const actualizarCantidad = (idCarrito: string, nuevaCantidad: number) => {
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
    };

    // --- 5. CÁLCULOS FINANCIEROS Y DESGLOSE DE IMPUESTOS ---
    const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    const montoBrutoFinal = carrito.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);

    // En Perú, los precios inc. IGV se desglosan dividiendo entre 1.18
    const baseImponible = montoBrutoFinal / 1.18;
    const igvCalculado = montoBrutoFinal - baseImponible;

    return (
        <div className="flex flex-col md:flex-row h-full bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
            {/* ═══════════════════════════════════════════════════════
          SECCIÓN IZQUIERDA — Catálogo de Productos y Filtros
      ═══════════════════════════════════════════════════════ */}

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
                modoPrecio={modoPrecio}
                setModoPrecio={setModoPrecio}
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