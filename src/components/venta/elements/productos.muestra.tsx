// src/components/venta/elements/productos.muestra.tsx
import { useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  X,
  Printer,
  Camera,
  Usb,
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { ProductoAgrupado, ModoPrecio } from "../types";
import type { EstadoPeriferico } from "../hooks/usePerifericosStatus";

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
  productosAgrupados: ProductoAgrupado[];
  cargando: boolean;
  totalItems: number;
  sucursalActual: { nombre: string } | null;
  agregarAlCarrito: (
    producto: ProductoAgrupado,
    cantidad: number,
    presentacionNombre: string,
    precioUnitario: number
  ) => void;
  onSolicitarReceta?: (producto: any, presentacionSel: any) => void;
  perifericosStatus: EstadoPeriferico;
  onAbrirCamara: () => void;
  onAbrirEscannerRemoto?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function MosProducto({
  Item,
  busqueda,
  setBusqueda,
  modoPrecio,
  setModoPrecio,
  setShowCartMobile,
  feedbackId,
  productosAgrupados,
  cargando,
  totalItems,
  sucursalActual,
  agregarAlCarrito,
  onSolicitarReceta,
  perifericosStatus,
  onAbrirCamara,
  onAbrirEscannerRemoto,
  searchInputRef,
}: Props) {
  const { scannerConectado, impresoraDisponible, esCelular } = perifericosStatus;
  const internalSearchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "k")) && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        const input = searchInputRef?.current || internalSearchRef.current;
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchInputRef]);

  return (
    <section className="flex-1 flex flex-col h-full min-w-0 overflow-hidden p-2.5 sm:p-4">
      {/* ══ Topbar: Búsqueda + Modo Precio + Carrito Mobile ══ */}
      <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Campo de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            ref={(node) => {
              internalSearchRef.current = node;
              if (searchInputRef) {
                (searchInputRef as any).current = node;
              }
            }}
            type="text"
            id="pos-busqueda-producto"
            placeholder="Buscar por Nombre, P.Activo, Barcode... (Presiona '/' o F3)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-14 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-2xs"
            autoComplete="off"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-block text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
            /
          </span>
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controles derechos */}
        <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0">
          {/* Toggle modo precio */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setModoPrecio("CON_IGV")}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                modoPrecio === "CON_IGV"
                  ? "bg-white text-emerald-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Inc. IGV
            </button>
            <button
              type="button"
              onClick={() => setModoPrecio("SIN_IGV")}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                modoPrecio === "SIN_IGV"
                  ? "bg-white text-emerald-800 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Sin IGV
            </button>
          </div>

          {/* Botón Escanear Cámara */}
          {onAbrirCamara && (
            <button
              type="button"
              id="btn-abrir-camara-scanner"
              onClick={onAbrirCamara}
              title="Escanear código de barras con la cámara"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-2xs active:scale-95 ${
                esCelular
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20"
              }`}
            >
              <Camera size={16} />
              <span>Cámara</span>
            </button>
          )}

          {/* Botón Celular Escáner Remoto */}
          {onAbrirEscannerRemoto && (
            <button
              type="button"
              onClick={onAbrirEscannerRemoto}
              title="Usar smartphone como escáner inalámbrico de código de barras"
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <Smartphone size={15} className="text-indigo-600" />
              <span className="hidden sm:inline">Móvil QR</span>
            </button>
          )}

          {/* Mobile Cart Toggle */}
          <button
            type="button"
            onClick={() => setShowCartMobile(true)}
            className="md:hidden relative p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shrink-0 cursor-pointer"
            aria-label={`Ver carrito (${totalItems} items)`}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══ Fila Discreta de Periféricos & Estado del Sistema ══ */}
      <div className="mb-2.5 flex items-center justify-between gap-2 flex-wrap bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Sucursal + Estado de Sincronización */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 font-medium">Sucursal:</span>
          <span className="text-emerald-800 font-black">{sucursalActual?.nombre || "Matriz Principal"}</span>
        </div>

        {/* Fila Discreta de Iconos Periféricos con Tooltips */}
        <div className="flex items-center gap-2">
          {/* Lector USB */}
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all border ${
              scannerConectado
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
            title={
              scannerConectado
                ? "Lector físico de código de barras USB/HID conectado y listo"
                : "Sin lector USB físico. El sistema opera normalmente mediante cámara web, móvil o búsqueda."
            }
          >
            <Usb size={13} className={scannerConectado ? "text-emerald-600" : "text-slate-400"} />
            <span className="hidden sm:inline">
              {scannerConectado ? "Escáner USB Activo" : "Escáner USB"}
            </span>
          </div>

          {/* Impresora */}
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold border ${
              impresoraDisponible
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-400 border-slate-200"
            }`}
            title={impresoraDisponible ? "Impresora térmica configurada y lista" : "Sin impresora"}
          >
            <Printer size={13} className={impresoraDisponible ? "text-emerald-600" : "text-slate-400"} />
            <span className="hidden sm:inline">
              {impresoraDisponible ? "Impresora Lista" : "Impresora"}
            </span>
          </div>
        </div>
      </div>

      {/* ══ Listado de Productos ══ */}
      <div className="flex-1 overflow-y-auto pr-1">
        {cargando ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-bold">
            Cargando catálogo de productos...
          </div>
        ) : productosAgrupados.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
            <Sparkles className="w-8 h-8 text-slate-300 mb-1" />
            <p className="font-bold text-slate-600">No se encontraron productos coincidentes.</p>
            <p className="text-slate-400">Prueba con otro término de búsqueda o escanea un código de barras.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2.5 sm:space-y-3">
            {productosAgrupados.map((producto) => (
              <Item
                key={producto.producto_comercial_id}
                producto={producto}
                modoPrecio={modoPrecio}
                feedbackId={feedbackId}
                agregarAlCarrito={agregarAlCarrito}
                onSolicitarReceta={onSolicitarReceta}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}