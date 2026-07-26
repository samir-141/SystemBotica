// src/components/venta/venta.tsx
import { useState, useEffect, useCallback } from "react";
import Item from "./elements/item";
import { useAuth } from "../../hooks/useAuth";
import MosProducto from "./elements/productos.muestra";
import CartSummary from "./elements/CartSummary";
import BarcodeCameraModal from "./elements/BarcodeCameraModal";
import RemoteScannerModal from "./elements/RemoteScannerModal";
import RecetaModal from "./elements/RecetaModal";
import BarraAtajos from "./elements/BarraAtajos";
import { useProductos } from "./hooks/useProductos";
import { usePerifericosStatus } from "./hooks/usePerifericosStatus";
import { useCamaraScanner } from "./hooks/useCamaraScanner";
import { useCart } from "./hooks/useCart";
import { useRemoteScannerSocket } from "../../hooks/useRemoteScannerSocket";
import type { ModoPrecio, TipoPago, ProductoAgrupado } from "./types";

export default function VentaPos() {
    const { sucursalActual } = useAuth();
    const {
        productosRaw,
        busqueda,
        setBusqueda,
        cargando,
        productosAgrupados
    } = useProductos();

    // --- Estado del Carrito con Persistencia IndexedDB y Sincronización Multi-pestaña ---
    const {
        carrito,
        setCarrito,
        agregarAlCarrito: agregarAlCarritoHook,
        actualizarCantidad,
        totalItems,
        montoBrutoFinal,
        baseImponible: baseImpCalculada,
        igvCalculado: igvCalcHook,
        formatMoney,
    } = useCart();

    // --- Opciones Visuales / Configuración ---
    const [modoPrecio, setModoPrecio] = useState<ModoPrecio>("CON_IGV");
    const [tipoPago, setTipoPago] = useState<TipoPago>("CONTADO");
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [feedbackId, setFeedbackId] = useState<string | null>(null);

    // --- Modal Escáner Celular Remoto ---
    const [showRemoteScannerModal, setShowRemoteScannerModal] = useState(false);
    const [ultimoCodigoRemoto, setUltimoCodigoRemoto] = useState<string | null>(null);

    // --- Modal de Verificación de Receta Médica ---
    const [recetaModalOpen, setRecetaModalOpen] = useState(false);
    const [productoParaReceta, setProductoParaReceta] = useState<{ producto: any; presentacionSel: any } | null>(null);

    // --- IGV dinámico ---
    const [incluyeIGV, setIncluyeIGV] = useState(true);

    // --- Periféricos ---
    const perifericosStatus = usePerifericosStatus();

    // --- Feedback de adición ---
    const triggerFeedback = useCallback((id: string) => {
        setFeedbackId(id);
        setTimeout(() => setFeedbackId(null), 400);
    }, []);

    // --- Abrir Modal de Receta Médica Obligatoria ---
    const handleSolicitarReceta = useCallback((producto: any, presentacionSel: any) => {
        setProductoParaReceta({ producto, presentacionSel });
        setRecetaModalOpen(true);
    }, []);

    const handleConfirmarReceta = (numeroReceta: string) => {
        if (productoParaReceta) {
            const { producto, presentacionSel } = productoParaReceta;
            triggerFeedback(producto.producto_comercial_id);
            agregarAlCarritoHook(
                producto,
                presentacionSel.cantidad_unidad_base,
                presentacionSel.nombre,
                presentacionSel.precio,
                numeroReceta
            );
        }
        setRecetaModalOpen(false);
        setProductoParaReceta(null);
    };

    // --- Agregar al Carrito ---
    const agregarAlCarrito = useCallback(
        (
            producto: ProductoAgrupado | any,
            equivBase = 1,
            presentacionNombre = "Unidad",
            precio = producto.precio_actual || 0,
            numeroReceta?: string
        ) => {
            if (producto.requiere_receta && !numeroReceta) {
                handleSolicitarReceta(producto, { id: "std", nombre: presentacionNombre, cantidad_unidad_base: equivBase, precio });
                return;
            }
            const prodId = producto.producto_comercial_id;
            triggerFeedback(prodId);
            agregarAlCarritoHook(producto, equivBase, presentacionNombre, precio, numeroReceta);
        },
        [agregarAlCarritoHook, triggerFeedback, handleSolicitarReceta]
    );

    // --- Agregar al Carrito por código (usado por lector USB, cámara y celular remoto) ---
    const agregarPorCodigo = useCallback((codigo: string) => {
        const encontrado = productosRaw.find(
            (p) => p.codigo_barras === codigo || p.sku === codigo
        );
        if (!encontrado) {
            setBusqueda(codigo);
            return;
        }
        const agrupado = productosAgrupados.find(
            (g) => g.producto_comercial_id === encontrado.producto_comercial_id
        );
        if (agrupado) {
            if (agrupado.requiere_receta) {
                handleSolicitarReceta(agrupado, {
                    id: "std",
                    nombre: encontrado.presentacion_nombre || "Unidad",
                    cantidad_unidad_base: encontrado.cantidad_unidad_base || 1,
                    precio: encontrado.precio_actual
                });
                return;
            }
            agregarAlCarrito(
                agrupado,
                encontrado.cantidad_unidad_base || 1,
                encontrado.presentacion_nombre || "Unidad",
                encontrado.precio_actual
            );
        }
    }, [productosRaw, productosAgrupados, agregarAlCarrito, setBusqueda, handleSolicitarReceta]);

    // --- Hook de Cámara para celulares ---
    const camaraScanner = useCamaraScanner(agregarPorCodigo);

    // --- Hook de Escáner Remoto por WebSockets ---
    const handleBarcodeFromSocket = useCallback((codigo: string) => {
        if (!codigo) return;
        setUltimoCodigoRemoto(codigo);
        agregarPorCodigo(codigo);
    }, [agregarPorCodigo]);

    const remoteSocket = useRemoteScannerSocket(handleBarcodeFromSocket);

    // --- Sincronizar lectura del escáner remoto ---
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "pos_remote_scanned_code" && e.newValue) {
                handleBarcodeFromSocket(e.newValue);
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [handleBarcodeFromSocket]);

    // --- Lectura de escáner USB (teclado HID) ---
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
                agregarPorCodigo(bufferBarcode);
                bufferBarcode = "";
            } else if (e.key.length === 1) {
                bufferBarcode += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [agregarPorCodigo]);

    // --- Teclas de Acceso Rápido (Shortcuts de Cajero: F2, F3, F4, F5, F6, ESC) ---
    useEffect(() => {
        const handleShortcuts = (e: KeyboardEvent) => {
            if (e.key === "F2") {
                e.preventDefault();
                document.getElementById("btn-procesar-venta")?.click();
            } else if (e.key === "F3") {
                e.preventDefault();
                document.getElementById("pos-busqueda-producto")?.focus();
            } else if (e.key === "F4") {
                e.preventDefault();
                // Enfocar o abrir cliente
            } else if (e.key === "F5") {
                e.preventDefault();
                document.getElementById("btn-abrir-camara-scanner")?.click();
            } else if (e.key === "F6") {
                e.preventDefault();
                setShowRemoteScannerModal(true);
            } else if (e.key === "Escape") {
                setShowRemoteScannerModal(false);
                setRecetaModalOpen(false);
            }
        };

        window.addEventListener("keydown", handleShortcuts);
        return () => window.removeEventListener("keydown", handleShortcuts);
    }, []);

    // --- Cálculos Financieros finales según IGV ---
    const baseImponible = incluyeIGV ? baseImpCalculada : montoBrutoFinal;
    const igvCalculado = incluyeIGV ? igvCalcHook : 0;

    return (
        <div className="relative flex flex-col md:flex-row h-full bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
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
                productosAgrupados={productosAgrupados}
                cargando={cargando}
                totalItems={totalItems}
                sucursalActual={sucursalActual}
                agregarAlCarrito={agregarAlCarrito}
                onSolicitarReceta={handleSolicitarReceta}
                perifericosStatus={perifericosStatus}
                onAbrirCamara={camaraScanner.abrirCamara}
                onAbrirEscannerRemoto={() => setShowRemoteScannerModal(true)}
            />
            <CartSummary
                carrito={carrito}
                totalItems={totalItems}
                montoBrutoFinal={montoBrutoFinal}
                baseImponible={baseImponible}
                igvCalculado={igvCalculado}
                formatMoney={formatMoney}
                tipoPago={tipoPago}
                setTipoPago={setTipoPago}
                showCartMobile={showCartMobile}
                setShowCartMobile={setShowCartMobile}
                actualizarCantidad={actualizarCantidad}
                setCarrito={setCarrito}
                incluyeIGV={incluyeIGV}
                setIncluyeIGV={setIncluyeIGV}
            />

            {/* Barra Flotante de Atajos Rápidos */}
            <BarraAtajos
                onAbrirCheckout={() => document.getElementById("btn-procesar-venta")?.click()}
                onEnfocarBusqueda={() => document.getElementById("pos-busqueda-producto")?.focus()}
                onAbrirCliente={() => {}}
                onAbrirCamara={camaraScanner.abrirCamara}
                onAbrirEscannerRemoto={() => setShowRemoteScannerModal(true)}
            />

            {/* Modal Verificación Receta Médica Obligatoria */}
            <RecetaModal
                open={recetaModalOpen}
                nombreProducto={productoParaReceta?.producto?.nombre_comercial || "Medicamento Regulado"}
                onClose={() => {
                    setRecetaModalOpen(false);
                    setProductoParaReceta(null);
                }}
                onConfirm={handleConfirmarReceta}
            />

            {/* Modal Lector Cámara para Celulares */}
            <BarcodeCameraModal
                scanner={camaraScanner}
                onClose={camaraScanner.cerrarCamara}
            />

            {/* Modal Escáner Celular Remoto (Puente WebSocket) */}
            <RemoteScannerModal
                open={showRemoteScannerModal}
                onClose={() => setShowRemoteScannerModal(false)}
                sessionCode={remoteSocket.sessionCode}
                connected={remoteSocket.connected}
                remoteDeviceConnected={remoteSocket.remoteDeviceConnected}
                remoteDeviceName={remoteSocket.remoteDeviceName}
                pingMs={remoteSocket.pingMs}
                ultimoCodigoRemoto={ultimoCodigoRemoto}
                onChangeSessionCode={remoteSocket.changeSessionCode}
            />
        </div>
    );
}