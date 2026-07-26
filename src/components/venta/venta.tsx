// src/components/venta/venta.tsx
import { useState, useEffect, useCallback } from "react";
import Item from "./elements/item";
import { useAuth } from "../../hooks/useAuth";
import MosProducto from "./elements/productos.muestra";
import CartSummary from "./elements/CartSummary";
import { formatMoney } from "./utils";
import BarcodeCameraModal from "./elements/BarcodeCameraModal";
import RemoteScannerModal from "./elements/RemoteScannerModal";
import { useProductos } from "./hooks/useProductos";
import { usePerifericosStatus } from "./hooks/usePerifericosStatus";
import { useCamaraScanner } from "./hooks/useCamaraScanner";
import { useRemoteScannerSocket } from "../../hooks/useRemoteScannerSocket";
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

    // --- Modal Escáner Celular Remoto (Puente) ---
    const [showRemoteScannerModal, setShowRemoteScannerModal] = useState(false);
    const [ultimoCodigoRemoto, setUltimoCodigoRemoto] = useState<string | null>(null);

    // --- IGV dinámico ---
    const [incluyeIGV, setIncluyeIGV] = useState(true);

    // --- Periféricos ---
    const perifericosStatus = usePerifericosStatus();

    // --- Feedback de adición ---
    const triggerFeedback = useCallback((id: string) => {
        setFeedbackId(id);
        setTimeout(() => setFeedbackId(null), 400);
    }, []);

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
            agregarAlCarrito(
                agrupado,
                encontrado.cantidad_unidad_base || 1,
                encontrado.presentacion_nombre || "Unidad",
                encontrado.precio_actual
            );
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productosRaw, productosAgrupados]);

    // --- Hook de Cámara para celulares ---
    const camaraScanner = useCamaraScanner(agregarPorCodigo);

    // --- Hook de Escáner Remoto por WebSockets (Latencia ultra-baja <10ms) ---
    const handleBarcodeFromSocket = useCallback((codigo: string) => {
        if (!codigo) return;
        setUltimoCodigoRemoto(codigo);
        agregarPorCodigo(codigo);
    }, [agregarPorCodigo]);

    const remoteSocket = useRemoteScannerSocket(handleBarcodeFromSocket, null, "pc");

    // --- Fallback secundario: Escuchar BroadcastChannel / LocalStorage ---
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "pos_remote_barcode_event" && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    if (parsed?.barcode) {
                        handleBarcodeFromSocket(parsed.barcode);
                    }
                } catch {
                    // ignore
                }
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [handleBarcodeFromSocket]);

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

    // --- Teclas de Acceso Rápido (Shortcuts de Cajero: F2, F4, F9, ESC) ---
    useEffect(() => {
        const handleShortcuts = (e: KeyboardEvent) => {
            if (e.key === "F2") {
                e.preventDefault();
                document.getElementById("pos-busqueda-producto")?.focus();
            } else if (e.key === "F4") {
                e.preventDefault();
                setShowRemoteScannerModal(true);
            } else if (e.key === "F9") {
                e.preventDefault();
                const btnCobrar = document.getElementById("btn-abrir-checkout-modal");
                if (btnCobrar) btnCobrar.click();
            } else if (e.key === "Escape") {
                setShowRemoteScannerModal(false);
            }
        };

        window.addEventListener("keydown", handleShortcuts);
        return () => window.removeEventListener("keydown", handleShortcuts);
    }, []);

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

    // --- Cálculos Financieros ---
    const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    const montoBrutoFinal = carrito.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);
    const baseImponible = incluyeIGV ? montoBrutoFinal / 1.18 : montoBrutoFinal;
    const igvCalculado = incluyeIGV ? montoBrutoFinal - baseImponible : 0;

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
                productosAgrupados={productosAgrupados}
                cargando={cargando}
                totalItems={totalItems}
                sucursalActual={sucursalActual}
                agregarAlCarrito={agregarAlCarrito}
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