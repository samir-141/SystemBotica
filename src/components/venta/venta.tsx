import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    Search,
    ShoppingCart,
    Trash2,
    CreditCard,
    Package,
    X,
    Minus,
    Plus,
    ArrowRight,
    RefreshCw,
    Barcode,

    Banknote,
    Receipt,
    PiggyBank
} from "lucide-react";
import Item, { type PresentacionOption } from "./elements/item";
import { api } from "../api/client";
import type { ProductoPOS, PaginatedResponse } from "../api/api.data";
import { useAuth } from "../../hooks/useAuth";

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

const formatMoney = (amount: number, simbolo = "S/") => `${simbolo} ${amount.toFixed(2)}`;

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
            <section className="flex-1 flex flex-col h-full min-w-0 overflow-hidden p-2.5 sm:p-4">

                {/* Topbar: Búsqueda y Selector de Impuestos */}
                <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

                    {/* Campo de Búsqueda (Nombre, SKU, Laboratorio) */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar por Nombre, SKU, Barcode o Laboratorio..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
                        />
                        {busqueda && (
                            <button
                                onClick={() => setBusqueda("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Opciones de Visualización: Precio inc. IGV / Desglosado */}
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold shrink-0">
                            <button
                                onClick={() => setModoPrecio("CON_IGV")}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${modoPrecio === "CON_IGV" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
                                    }`}
                            >
                                Precios Inc. IGV
                            </button>
                            <button
                                onClick={() => setModoPrecio("SIN_IGV")}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${modoPrecio === "SIN_IGV" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
                                    }`}
                            >
                                Sin IGV
                            </button>
                        </div>

                        {/* Mobile Cart Toggle */}
                        <button
                            onClick={() => setShowCartMobile(true)}
                            className="md:hidden relative p-2.5 bg-teal-600 text-white rounded-xl shadow shrink-0"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Info Sucursal Activa */}
                <div className="mb-2.5 flex items-center justify-between text-xs text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold text-slate-700">
                        Sucursal: <span className="text-teal-700">{sucursalActual?.nombre || "Matriz Centro"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" /> Lectura continua de barras activa
                    </span>
                </div>

                {/* Grilla / Lista de Productos */}
                {/* Render de Cards de Productos */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
                    {cargando ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                            <p className="text-xs font-medium">Buscando productos en el inventario...</p>
                        </div>
                    ) : productosAgrupados.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Package className="w-10 h-10 stroke-1" />
                            <p className="text-xs font-medium">No se encontraron medicamentos coincidentes</p>
                        </div>
                    ) : (
                        productosAgrupados.map((prod) => (
                            <Item
                                key={prod.sku || prod.producto_comercial_id}
                                item={prod}
                                monedas={[{ simbolo: "S/", nombre: "Soles" }]}
                                monedaActivaIdx={0}
                                feedbackActive={feedbackId === prod.producto_comercial_id}
                                onAgregar={(presentacionSeleccionada) =>
                                    agregarAlCarrito(
                                        prod,
                                        presentacionSeleccionada.cantidad_unidad_base,
                                        presentacionSeleccionada.nombre,
                                        presentacionSeleccionada.precio
                                    )
                                }
                            />
                        ))
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
          SECCIÓN DERECHA — Ticket y Cobro (Pagos, Abonos, Anticipos)
      ═══════════════════════════════════════════════════════ */}
            <aside
                className={`
          fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-200
          md:static md:translate-x-0 md:w-80 lg:w-96 md:border-l md:border-slate-200
          ${showCartMobile ? "translate-x-0" : "translate-x-full"}
        `}
            >
                {/* Topbar Ticket */}
                <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-teal-400" />
                        <h2 className="font-bold text-sm">Venta Actual</h2>
                        <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full font-bold">
                            {totalItems}
                        </span>
                    </div>

                    <button onClick={() => setShowCartMobile(false)} className="md:hidden text-slate-400 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Lista de Items Seleccionados */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50 divide-y divide-slate-100">
                    {carrito.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1 py-12">
                            <ShoppingCart className="w-8 h-8 stroke-1 text-slate-300 mb-1" />
                            <p className="font-semibold text-slate-500">Carrito vacío</p>
                            <p className="text-[11px] text-slate-400">Escanea o selecciona productos</p>
                        </div>
                    ) : (
                        carrito.map((item) => (
                            <div key={item.id_carrito} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{item.nombre_comercial}</p>
                                    <p className="text-[10px] text-teal-600 font-bold">
                                        [{item.presentacion_nombre}] — {formatMoney(item.precio_unitario)} c/u
                                    </p>
                                </div>

                                <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => actualizarCantidad(item.id_carrito, item.cantidad - 1)}
                                        className="p-1 text-slate-600 hover:bg-slate-100"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold text-slate-800">{item.cantidad}</span>
                                    <button
                                        onClick={() => actualizarCantidad(item.id_carrito, item.cantidad + 1)}
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
                                    onClick={() => setCarrito((prev) => prev.filter((i) => i.id_carrito !== item.id_carrito))}
                                    className="p-1 text-slate-400 hover:text-rose-600"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Pestañas de Tipo de Operación de Cobro */}
                <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-2 shrink-0">
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                        Modalidad de Pago / Cobro
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl text-[11px] font-bold">
                        <button
                            type="button"
                            onClick={() => setTipoPago("CONTADO")}
                            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${tipoPago === "CONTADO" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
                                }`}
                        >
                            <Banknote size={12} /> Contado
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipoPago("ABONO")}
                            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${tipoPago === "ABONO" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
                                }`}
                        >
                            <Receipt size={12} /> Abono
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipoPago("ANTICIPO")}
                            className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition ${tipoPago === "ANTICIPO" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"
                                }`}
                        >
                            <PiggyBank size={12} /> Anticipo
                        </button>
                    </div>

                    {/* Resumen de Desglose de Tributos */}
                    <div className="pt-2 space-y-1 text-xs text-slate-500">
                        <div className="flex justify-between">
                            <span>Op. Grabada (Base)</span>
                            <span>{formatMoney(baseImponible)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>IGV (18%)</span>
                            <span>{formatMoney(igvCalculado)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                            <span>TOTAL</span>
                            <span className="text-xl font-black text-teal-700">{formatMoney(montoBrutoFinal)}</span>
                        </div>
                    </div>

                    {/* Botón de Procesar Operación */}
                    <button
                        disabled={carrito.length === 0}
                        className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm active:scale-[0.99] cursor-pointer"
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>
                            {tipoPago === "CONTADO" && "PROCESAR VENTA (F2)"}
                            {tipoPago === "ABONO" && "REGISTRAR ABONO"}
                            {tipoPago === "ANTICIPO" && "USAR ANTICIPO"}
                        </span>
                        <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
                    </button>
                </div>

            </aside>

        </div>
    );
}