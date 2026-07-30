// src/components/venta/venta.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Toast } from "primereact/toast";
import Item from "./elements/item";
import { useAuth } from "../../hooks/useAuth";
import MosProducto from "./elements/productos.muestra";
import CartSummary from "./elements/CartSummary";
import RemoteScannerModal from "./elements/RemoteScannerModal";
import RecetaModal from "./elements/RecetaModal";
import BarraAtajos from "./elements/BarraAtajos";
import ClienteSelectorModal from "./elements/ClienteSelectorModal";
import { useProductos } from "./hooks/useProductos";
import { usePerifericosStatus } from "./hooks/usePerifericosStatus";
import { useCart } from "./hooks/useCart";
import { useRemoteScannerSocket } from "../../hooks/useRemoteScannerSocket";
import { useSocketInvalidation } from "../../hooks/useSocketInvalidation";
import type { TipoPago, ProductoAgrupado } from "./types";
import type { Cliente } from "../clientes/types";
import { SHORTCUTS, DOM_IDS } from "../../utils/constants";
import { useCaja } from "../caja/hooks/useCaja";
import AperturaCajaModal from "../caja/elements/AperturaCajaModal";
import CierreCajaModal from "../caja/elements/CierreCajaModal";
import { Lock } from "lucide-react";

export default function VentaPos() {
    const toast = useRef<Toast>(null);
    const { sucursalActual } = useAuth();
    const {
        productosRaw,
        busqueda,
        setBusqueda,
        cargando,
        productosAgrupados
    } = useProductos();

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
    } = useCart((msg: string) => {
        toast.current?.show({ severity: "warn", summary: "Stock", detail: msg, life: 3000 });
    });

    const [tipoPago, setTipoPago] = useState<TipoPago>("CONTADO");
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [feedbackId, setFeedbackId] = useState<string | null>(null);
    const [incluyeIGV, setIncluyeIGV] = useState(true);
    const [showRemoteScannerModal, setShowRemoteScannerModal] = useState(false);
    const [showClienteModal, setShowClienteModal] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

    // Módulo de Cajas
    const { estadoCaja, aperturarCaja, cerrarCaja } = useCaja();
    const [showAperturaModal, setShowAperturaModal] = useState(false);
    const [showCierreModal, setShowCierreModal] = useState(false);

    const [recetaModalOpen, setRecetaModalOpen] = useState(false);
    const [productoParaReceta, setProductoParaReceta] = useState<{ producto: any; presentacionSel: any } | null>(null);
    const [ultimoCodigoRemoto, setUltimoCodigoRemoto] = useState<string | null>(null);

    const perifericosStatus = usePerifericosStatus();

    const triggerFeedback = useCallback((id: string) => {
        setFeedbackId(id);
        setTimeout(() => setFeedbackId(null), 400);
    }, []);

    useSocketInvalidation();

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

    const handleBarcodeFromSocket = useCallback((codigo: string) => {
        if (!codigo) return;
        setUltimoCodigoRemoto(codigo);
        agregarPorCodigo(codigo);
    }, [agregarPorCodigo]);

    const remoteSocket = useRemoteScannerSocket(
        handleBarcodeFromSocket,
        null,
        "pc",
        true
    );

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "pos_remote_scanned_code" && e.newValue) {
                handleBarcodeFromSocket(e.newValue);
            }
        };

        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [handleBarcodeFromSocket]);

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

    useEffect(() => {
        const handleShortcuts = (e: KeyboardEvent) => {
            if (e.key === SHORTCUTS.F2) {
                e.preventDefault();
                document.getElementById(DOM_IDS.BTN_PROCESAR_VENTA)?.click();
            } else if (e.key === SHORTCUTS.F3) {
                e.preventDefault();
                document.getElementById(DOM_IDS.POS_BUSQUEDA_PRODUCTO)?.focus();
            } else if (e.key === SHORTCUTS.F4) {
                e.preventDefault();
                setShowClienteModal(true);
            } else if (e.key === SHORTCUTS.F6) {
                e.preventDefault();
                setShowRemoteScannerModal(true);
            } else if (e.key === SHORTCUTS.ESCAPE) {
                setShowRemoteScannerModal(false);
                setRecetaModalOpen(false);
                setShowClienteModal(false);
            }
        };

        window.addEventListener("keydown", handleShortcuts);
        return () => window.removeEventListener("keydown", handleShortcuts);
    }, []);

    const baseImponible = incluyeIGV ? baseImpCalculada : montoBrutoFinal;
    const igvCalculado = incluyeIGV ? igvCalcHook : 0;

    return (
        <div className="relative flex flex-col h-full bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
            {/* Banner Alerta de Caja Cerrada */}
            {estadoCaja?.estado === "CERRADA" && (
                <div className="bg-amber-500 text-slate-950 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md border-b border-amber-600 font-bold text-xs shrink-0 z-10 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <Lock size={18} className="shrink-0 text-slate-950" />
                        <span>⚠️ La Caja de esta sucursal está CERRADA. Debes aperturar turno con el sencillo inicial para procesar cobros de ventas.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAperturaModal(true)}
                        className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 rounded-xl text-xs font-black shadow-sm transition cursor-pointer self-end sm:self-auto shrink-0"
                    >
                        Aperturar Caja Ahora
                    </button>
                </div>
            )}

            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                <MosProducto
                    Item={Item}
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
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
                    onAbrirEscannerRemoto={() => setShowRemoteScannerModal(true)}
                    estadoCaja={estadoCaja}
                    onAbrirAperturaModal={() => setShowAperturaModal(true)}
                    onAbrirCierreModal={() => setShowCierreModal(true)}
                    carrito={carrito}
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
                clienteSeleccionado={clienteSeleccionado}
                onAbrirClienteModal={() => setShowClienteModal(true)}
            />

            </div>

            <AperturaCajaModal
                open={showAperturaModal}
                onClose={() => setShowAperturaModal(false)}
                onConfirm={async (monto, obs) => {
                    await aperturarCaja(monto, obs);
                    toast.current?.show({ severity: "success", summary: "Caja Aperturada", detail: `Turno iniciado con S/ ${monto.toFixed(2)}`, life: 3000 });
                }}
            />

            <CierreCajaModal
                open={showCierreModal}
                onClose={() => setShowCierreModal(false)}
                estadoCaja={estadoCaja}
                onConfirm={async (efectivoContado, obs) => {
                    const res = await cerrarCaja(efectivoContado, obs);
                    toast.current?.show({ severity: "info", summary: "Cierre Z Realizado", detail: "Turno cerrado exitosamente", life: 3000 });
                    return res;
                }}
            />

            <BarraAtajos
                onAbrirCheckout={() => document.getElementById(DOM_IDS.BTN_PROCESAR_VENTA)?.click()}
                onEnfocarBusqueda={() => document.getElementById(DOM_IDS.POS_BUSQUEDA_PRODUCTO)?.focus()}
                onAbrirCliente={() => setShowClienteModal(true)}
                onAbrirEscannerRemoto={() => setShowRemoteScannerModal(true)}
            />

            <RecetaModal
                open={recetaModalOpen}
                nombreProducto={productoParaReceta?.producto?.nombre_comercial || "Medicamento Regulado"}
                onClose={() => {
                    setRecetaModalOpen(false);
                    setProductoParaReceta(null);
                }}
                onConfirm={handleConfirmarReceta}
            />

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

            <Toast ref={toast} />
            <ClienteSelectorModal
                open={showClienteModal}
                onClose={() => setShowClienteModal(false)}
                onSelect={(cliente) => setClienteSeleccionado(cliente as any)}
            />
        </div>
    );
}
