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
import { Lock, Camera, Trash2, Plus, Minus, CreditCard, ArrowLeft, ShoppingBag } from "lucide-react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";


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
    const [localCameraOpen, setLocalCameraOpen] = useState(false);
    const videoLocalRef = useRef<HTMLVideoElement | null>(null);
    const cooldownRef = useRef(false);

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
                presentacionSel.id,
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
            productoPresentacionId = producto.presentacion_id,
            numeroReceta?: string
        ) => {
            if (producto.requiere_receta && !numeroReceta) {
                handleSolicitarReceta(producto, { id: productoPresentacionId, nombre: presentacionNombre, cantidad_unidad_base: equivBase, precio });
                return;
            }
            const prodId = producto.producto_comercial_id;
            triggerFeedback(prodId);
            agregarAlCarritoHook(producto, equivBase, presentacionNombre, precio, productoPresentacionId, numeroReceta);
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
                    id: encontrado.presentacion_id,
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
                encontrado.precio_actual,
                encontrado.presentacion_id
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

    // Efecto para controlar el escáner de la cámara local (celular)
    useEffect(() => {
        if (!localCameraOpen || !videoLocalRef.current) return;
        const reader = new BrowserMultiFormatReader();

        const constraints = {
            video: {
                facingMode: { ideal: "environment" },
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
        };

        reader.decodeFromConstraints(constraints, videoLocalRef.current, (result, error) => {
            if (result && !cooldownRef.current) {
                cooldownRef.current = true;
                const codigo = result.getText();
                
                // Vibración táctil si el navegador lo soporta
                if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    navigator.vibrate(100);
                }

                agregarPorCodigo(codigo);

                toast.current?.show({
                    severity: "success",
                    summary: "Escaneado",
                    detail: `Código ${codigo} agregado al carrito`,
                    life: 1500,
                });

                // Cooldown para evitar escaneos duplicados en ráfaga
                setTimeout(() => {
                    cooldownRef.current = false;
                }, 1500);
            }
            if (error && !(error instanceof NotFoundException)) {
                console.warn("[LocalScanner]", error);
            }
        }).catch((err) => {
            console.error("[LocalScanner] Error al abrir cámara:", err);
            toast.current?.show({
                severity: "error",
                summary: "Error de Cámara",
                detail: "No se pudo acceder a la cámara. Asegúrate de otorgar los permisos necesarios.",
                life: 3500,
            });
            setLocalCameraOpen(false);
        });

        return () => {
            reader.reset();
        };
    }, [localCameraOpen, agregarPorCodigo]);


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
                {localCameraOpen ? (
                    <div className="flex-1 flex flex-col h-full bg-slate-900 text-white overflow-hidden p-3.5 sm:p-4 space-y-3">
                        {/* Header de Escáner */}
                        <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between shrink-0 shadow-md">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setLocalCameraOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-850 hover:bg-slate-850 cursor-pointer active:scale-95 transition border border-slate-800"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <h1 className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5 text-emerald-400">
                                        <Camera size={16} />
                                        <span>Cámara POS de Venta</span>
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    </h1>
                                    <p className="text-[10px] text-slate-400">Apunta al código de barras para agregar</p>
                                </div>
                            </div>
                            <span className="bg-slate-800 text-teal-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                                {carrito.length} items
                            </span>
                        </div>

                        {/* Video Viewport (Compacto para ahorrar pantalla) */}
                        <div className="shrink-0 flex justify-center bg-slate-950/40 p-2 border border-slate-800 rounded-2xl">
                            <div className="relative w-full max-w-md aspect-[16/9] sm:aspect-[21/9] bg-black rounded-2xl overflow-hidden border border-emerald-500/20 shadow-lg flex items-center justify-center">
                                <video
                                    ref={videoLocalRef}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    muted
                                />
                                {/* Target Reticle overlay */}
                                <div className="absolute inset-0 border-[20px] sm:border-[30px] border-black/50 pointer-events-none flex items-center justify-center">
                                    <div className="w-full h-16 sm:h-20 border border-emerald-400 rounded-lg relative animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-300 flex items-center gap-1 border border-emerald-500/20">
                                    <Camera size={10} />
                                    <span>Lector Activo</span>
                                </div>
                            </div>
                        </div>

                        {/* Campo de búsqueda manual integrado debajo de la cámara */}
                        <div className="bg-slate-950/40 border border-slate-800/80 p-2.5 rounded-2xl shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="¿No escanea? Escribe código y presiona Enter..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && busqueda.trim()) {
                                            agregarPorCodigo(busqueda.trim());
                                            setBusqueda("");
                                        }
                                    }}
                                    className="w-full pl-3 pr-16 py-2 bg-slate-800/90 border border-slate-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                {busqueda.trim() && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            agregarPorCodigo(busqueda.trim());
                                            setBusqueda("");
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[9px] uppercase cursor-pointer transition-all"
                                    >
                                        Agregar
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Lista de productos agregados (Carrito) */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-950/20 border border-slate-800/80 rounded-2xl">
                            {carrito.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                                    <ShoppingBag className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
                                    <p className="font-bold text-xs text-slate-400">Carrito vacío</p>
                                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                                        Usa la cámara de arriba para escanear productos y verlos aquí.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {carrito.map((item) => (
                                        <div
                                            key={item.id_carrito}
                                            className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-xs"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xs font-bold text-slate-100 truncate">{item.nombre_comercial}</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-slate-850 text-slate-400 rounded">
                                                        {item.presentacion_nombre}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                                                        S/ {item.precio_unitario.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Controles de cantidad */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => actualizarCantidad(item.id_carrito, item.cantidad - 1)}
                                                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-bold font-mono text-white">
                                                        {item.cantidad}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => actualizarCantidad(item.id_carrito, item.cantidad + 1)}
                                                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition cursor-pointer"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setCarrito((prev) => prev.filter((i) => i.id_carrito !== item.id_carrito))}
                                                    className="p-1.5 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 rounded-lg transition cursor-pointer"
                                                    aria-label="Eliminar item"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botón de Pago en la parte inferior */}
                        {carrito.length > 0 && (
                            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5 shrink-0 shadow-lg">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">TOTAL VENTA</span>
                                    <span className="text-base font-black text-emerald-400 font-mono">
                                        {formatMoney(montoBrutoFinal)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById(DOM_IDS.BTN_PROCESAR_VENTA)?.click()}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
                                >
                                    <CreditCard size={14} />
                                    <span>COBRAR S/ {montoBrutoFinal.toFixed(2)}</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
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
                        onToggleLocalCamera={() => setLocalCameraOpen(true)}
                    />
                )}
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
                onToggleLocalCamera={() => setLocalCameraOpen(true)}
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
                expiresAt={remoteSocket.expiresAt}
                expired={remoteSocket.expired}
                error={remoteSocket.error}
                onRenewSession={remoteSocket.renewSession}
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
