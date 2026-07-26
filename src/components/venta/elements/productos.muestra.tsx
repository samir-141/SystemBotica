// src/components/venta/elements/productos.muestra.tsx
import {
  Search,
  ShoppingCart,
  X,
  Printer,
  Camera,
  ScanLine,
  Usb,
  Smartphone,
  CheckCircle2,
  AlertCircle,
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
  perifericosStatus,
  onAbrirCamara,
  onAbrirEscannerRemoto,
  searchInputRef,
}: Props) {
  const { scannerConectado, impresoraDisponible, esCelular } =
    perifericosStatus;

  return (
    <section className="flex-1 flex flex-col h-full min-w-0 overflow-hidden p-2.5 sm:p-4">
      {/* ══ Topbar: Búsqueda + Modo Precio + Carrito Mobile ══ */}
      <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Campo de Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            id="pos-busqueda-producto"
            placeholder="Buscar por Nombre, SKU, Barcode o Laboratorio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-sm"
            autoComplete="off"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                  ? "bg-white text-teal-700 shadow-sm font-bold"
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
                  ? "bg-white text-teal-700 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Sin IGV
            </button>
          </div>

          {/* Botón Escanear Cámara — Habilitado siempre para Celular y PC */}
          {onAbrirCamara && (
            <button
              type="button"
              id="btn-abrir-camara-scanner"
              onClick={onAbrirCamara}
              title="Escanear código de barras con la cámara"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-sm active:scale-95 ${
                esCelular
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                  : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20"
              }`}
            >
              <Camera size={16} />
              <span>Escanear Cámara</span>
            </button>
          )}

          {/* Botón Celular Escáner Remoto (Puente Wireless) */}
          {onAbrirEscannerRemoto && (
            <button
              type="button"
              onClick={onAbrirEscannerRemoto}
              title="Usar smartphone como escáner inalámbrico de código de barras"
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Smartphone size={15} className="text-indigo-600" />
              <span className="hidden sm:inline">Escáner Celular</span>
            </button>
          )}

          {/* Mobile Cart Toggle */}
          <button
            type="button"
            onClick={() => setShowCartMobile(true)}
            className="md:hidden relative p-2.5 bg-teal-600 text-white rounded-xl shadow shrink-0 cursor-pointer"
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

      {/* ══ Barra de Estado de Periféricos & Detección Hardware ══ */}
      <div className="mb-2.5 flex items-center justify-between gap-2 flex-wrap bg-white/60 p-2 rounded-xl border border-slate-200/60 backdrop-blur-xs">
        {/* Sucursal */}
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Sucursal:</span>
          <span className="text-teal-700 font-extrabold">{sucursalActual?.nombre || "Matriz Principal"}</span>
        </span>

        {/* Indicadores de periféricos */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* DETECCIÓN DE ESCÁNER DE BARRAS FÍSICO */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all border ${
              scannerConectado
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                : "bg-amber-50 text-amber-800 border-amber-300"
            }`}
            title={
              scannerConectado
                ? "Lector de código de barras USB/HID detectado y activo"
                : "No se detectó un lector físico conectado. Puedes usar la búsqueda o conectar un lector USB/Bluetooth."
            }
          >
            {scannerConectado ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-600" />
                <Usb size={13} className="text-emerald-700" />
                <span>ESCÁNER CONECTADO</span>
              </>
            ) : (
              <>
                <AlertCircle size={13} className="text-amber-600" />
                <Usb size={13} className="text-amber-600" />
                <span>SIN LECTOR FÍSICO</span>
              </>
            )}
          </div>

          {/* Línea de escaneo teclado activa */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <ScanLine size={13} className="text-blue-600" />
            <span className="hidden sm:inline">Lectura Activa</span>
          </div>

          {/* Impresora */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              impresoraDisponible
                ? "bg-violet-50 text-violet-800 border-violet-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
            title="Disponibilidad de servicio de impresión"
          >
            <Printer size={13} className={impresoraDisponible ? "text-violet-600" : ""} />
            <span className="hidden sm:inline">
              {impresoraDisponible ? "Impresora Lista" : "Sin Impresora"}
            </span>
          </div>
        </div>
      </div>

      {/* ══ Listado de Productos (CARD LARGO HORIZONTAL MOBILE-FIRST) ══ */}
      <div className="flex-1 overflow-y-auto pr-1">
        {cargando ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-bold">
            Cargando catálogo de productos...
          </div>
        ) : productosAgrupados.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}