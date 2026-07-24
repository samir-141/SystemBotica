import { Search, ShoppingCart, Barcode, X, RefreshCw, Package } from "lucide-react";
import { type PresentacionOption } from "./item";
import type { ProductoAgrupado, ModoPrecio } from "../types";

interface Props {
    Item: any;
    busqueda: string;
    setBusqueda: (busqueda: string) => void;
    modoPrecio: ModoPrecio;
    setModoPrecio: (modoPrecio: ModoPrecio) => void;
    showCartMobile: boolean;
    setShowCartMobile: (showCartMobile: boolean) => void;
    feedbackId: string | null;
    setFeedbackId: (feedbackId: string | null) => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
    productosAgrupados: ProductoAgrupado[];
    cargando: boolean;
    totalItems: number;
    sucursalActual: { nombre: string } | null;
    agregarAlCarrito: (producto: ProductoAgrupado, cantidad: number, presentacionNombre: string, precioUnitario: number) => void;
}

export default function MosProducto({
    Item,
    busqueda,
    setBusqueda,
    modoPrecio,
    setModoPrecio,
    searchInputRef,
    setShowCartMobile,
    feedbackId,
    productosAgrupados,
    cargando,
    totalItems,
    sucursalActual,
    agregarAlCarrito
}: Props) {
    return (
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
                    productosAgrupados.map((prod: ProductoAgrupado) => (
                        <Item
                            key={prod.sku || prod.producto_comercial_id}
                            item={prod}
                            monedas={[{ simbolo: "S/", nombre: "Soles" }]}
                            monedaActivaIdx={0}
                            feedbackActive={feedbackId === prod.producto_comercial_id}
                            onAgregar={(presentacionSeleccionada: PresentacionOption) =>
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
    );
}