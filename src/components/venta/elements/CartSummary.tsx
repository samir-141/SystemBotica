// src/components/venta/elements/CartSummary.tsx
import {
  ShoppingCart,
  X,
  Minus,
  Plus,
  CreditCard,
  ArrowRight,
  Banknote,
  Receipt,
  PiggyBank,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { type ItemCarrito } from "../types";
import { useState, type Dispatch, type SetStateAction } from "react";
import CheckoutModal from "./CheckoutModal";

type Props = {
  carrito: ItemCarrito[];
  actualizarCantidad: (idCarrito: string, nuevaCantidad: number) => void;
  totalItems: number;
  tipoPago: "CONTADO" | "ABONO" | "ANTICIPO";
  setTipoPago: (t: "CONTADO" | "ABONO" | "ANTICIPO") => void;
  showCartMobile: boolean;
  setShowCartMobile: (b: boolean) => void;
  montoBrutoFinal: number;
  baseImponible: number;
  igvCalculado: number;
  formatMoney: (amount: number, simbolo?: string) => string;
  setCarrito: Dispatch<SetStateAction<ItemCarrito[]>>;
  /** Si los precios incluyen IGV o no */
  incluyeIGV: boolean;
  setIncluyeIGV: (v: boolean) => void;
};

export default function CartSummary({
  carrito,
  actualizarCantidad,
  totalItems,
  tipoPago,
  setTipoPago,
  showCartMobile,
  setShowCartMobile,
  montoBrutoFinal,
  baseImponible,
  igvCalculado,
  formatMoney,
  setCarrito,
  incluyeIGV,
  setIncluyeIGV,
}: Props) {
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <>
      <aside
        className={`
        fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-200
        md:static md:translate-x-0 md:w-80 lg:w-96 md:border-l md:border-slate-200
        ${showCartMobile ? "translate-x-0" : "translate-x-full"}
      `}
      >
        {/* ══ Topbar ══ */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-teal-400" />
            <h2 className="font-bold text-sm">Venta Actual</h2>
            <span className="bg-teal-500/20 text-teal-300 text-xs px-2 py-0.5 rounded-full font-bold">
              {totalItems}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCartMobile(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ══ Toggle IGV ══ */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
          <button
            type="button"
            id="toggle-incluye-igv"
            onClick={() => setIncluyeIGV(!incluyeIGV)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer
              ${incluyeIGV
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              }`}
            title="Alterna entre operación gravada (con IGV 18%) y exonerada/inafecta (sin IGV)"
          >
            <div className="flex items-center gap-2">
              {incluyeIGV
                ? <ToggleRight size={18} className="text-emerald-600 shrink-0" />
                : <ToggleLeft size={18} className="text-slate-500 shrink-0" />
              }
              <div className="text-left">
                <span className="block leading-tight">
                  {incluyeIGV ? "Op. Gravada — Con IGV (18%)" : "Op. Exonerada — Sin IGV"}
                </span>
                <span className="block text-[10px] font-normal opacity-70 leading-tight mt-0.5">
                  {incluyeIGV
                    ? "El precio incluye el IGV. Se desglosará en comprobante."
                    : "Exonerado/Inafecto. Sin carga de IGV."}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${incluyeIGV ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
              {incluyeIGV ? "IGV ON" : "IGV OFF"}
            </span>
          </button>
        </div>

        {/* ══ Lista de Items ══ */}
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
                    type="button"
                    onClick={() => actualizarCantidad(item.id_carrito, item.cantidad - 1)}
                    className="p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    aria-label="Reducir cantidad"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.id_carrito, item.cantidad + 1)}
                    className="p-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-right min-w-[52px]">
                  <span className="text-xs font-extrabold text-slate-900">
                    {formatMoney(item.precio_unitario * item.cantidad)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCarrito((prev) => prev.filter((i) => i.id_carrito !== item.id_carrito))}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  aria-label={`Eliminar ${item.nombre_comercial}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ══ Resumen + Acciones ══ */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-2 shrink-0">
          {/* Tipo de pago */}
          <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
            Modalidad de Pago / Cobro
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl text-[11px] font-bold">
            <button type="button" id="tipo-pago-contado" onClick={() => setTipoPago("CONTADO")} className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${tipoPago === "CONTADO" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"}`}>
              <Banknote size={12} /> Contado
            </button>
            <button type="button" id="tipo-pago-abono" onClick={() => setTipoPago("ABONO")} className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${tipoPago === "ABONO" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"}`}>
              <Receipt size={12} /> Abono
            </button>
            <button type="button" id="tipo-pago-anticipo" onClick={() => setTipoPago("ANTICIPO")} className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${tipoPago === "ANTICIPO" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600"}`}>
              <PiggyBank size={12} /> Anticipo
            </button>
          </div>

          {/* Desglose financiero */}
          <div className="pt-1 space-y-1 text-xs text-slate-500">
            {incluyeIGV ? (
              <>
                <div className="flex justify-between">
                  <span>Op. Gravada (Base)</span>
                  <span>{formatMoney(baseImponible)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%)</span>
                  <span className="text-emerald-600 font-semibold">{formatMoney(igvCalculado)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg text-[11px] font-semibold">
                <span>Operación Exonerada</span>
                <span>IGV: S/ 0.00</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>TOTAL</span>
              <span className="text-xl font-black text-teal-700">{formatMoney(montoBrutoFinal)}</span>
            </div>
          </div>

          {/* Botón Procesar */}
          <button
            type="button"
            id="btn-procesar-venta"
            disabled={carrito.length === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full mt-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm active:scale-[0.99] cursor-pointer"
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

      <CheckoutModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        carrito={carrito}
        montoBrutoFinal={montoBrutoFinal}
        baseImponible={baseImponible}
        igvCalculado={igvCalculado}
        tipoPago={tipoPago}
        incluyeIGV={incluyeIGV}
        onVentaExitosa={() => {
          setCarrito([]);
          setShowCartMobile(false);
        }}
      />
    </>
  );
}
