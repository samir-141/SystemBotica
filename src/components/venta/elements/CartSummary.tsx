// src/components/venta/elements/CartSummary.tsx
import {
  ShoppingCart,
  X,
  CreditCard,
  ArrowRight,
  Banknote,
  Receipt,
  PiggyBank,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import type { ItemCarrito } from "../types";
import { useState, type Dispatch, type SetStateAction } from "react";
import CheckoutModal from "./CheckoutModal";
import { CartItem } from "../ui/CartItem";
import { DOM_IDS } from "../../../utils/constants";
import { limpiarCarritoStorage } from "../utils/cartStorage";

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
  clienteSeleccionado?: { nombre: string; tipo_documento: string; numero_documento: string } | null;
  onAbrirClienteModal?: () => void;
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
  clienteSeleccionado,
  onAbrirClienteModal,
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
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-sm tracking-tight">Venta Actual</h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-black">
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

        <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Cliente (F4)</span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {clienteSeleccionado ? clienteSeleccionado.nombre : "Cliente Genérico (Boleta)"}
              </span>
              {clienteSeleccionado && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {clienteSeleccionado.tipo_documento}: {clienteSeleccionado.numero_documento}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onAbrirClienteModal}
            className="px-2 py-1 text-[11px] font-bold bg-white text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            Cambiar
          </button>
        </div>

        <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 shrink-0">
            <button
              type="button"
              id={DOM_IDS.TOGGLE_INCLUYE_IGV}
              onClick={() => setIncluyeIGV(!incluyeIGV)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer
              ${incluyeIGV
                ? "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100"
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
              </div>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${incluyeIGV ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"}`}>
              {incluyeIGV ? "IGV ON" : "IGV OFF"}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/40">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
                <ShoppingCart className="w-6 h-6 stroke-[1.75]" />
              </div>
              <p className="font-bold text-sm text-slate-800">Carrito vacío</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Escanea un código o presiona <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold">F3</kbd> o <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono font-bold">/</kbd> para buscar.
              </p>

               <div className="mt-6 w-full pt-4 border-t border-slate-200/80">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 mb-2">
                  <Sparkles size={12} className="text-emerald-500" />
                  <span>Sugerencias rápidas</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <span className="p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 text-[11px] flex items-center gap-1 justify-center shadow-2xs">
                    <Zap size={11} className="text-amber-500" /> Paracetamol
                  </span>
                  <span className="p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 text-[11px] flex items-center gap-1 justify-center shadow-2xs">
                    <Zap size={11} className="text-amber-500" /> Alcohol Gel
                  </span>
                  <span className="p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 text-[11px] flex items-center gap-1 justify-center shadow-2xs">
                    <Zap size={11} className="text-amber-500" /> Mascarilla
                  </span>
                  <span className="p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 text-[11px] flex items-center gap-1 justify-center shadow-2xs">
                    <Zap size={11} className="text-amber-500" /> Ibuprofeno
                  </span>
                </div>
              </div>
            </div>
          ) : (
            carrito.map((item) => (
              <CartItem
                key={item.id_carrito}
                item={item}
                onUpdateQuantity={actualizarCantidad}
                onRemove={(id) => setCarrito((prev) => prev.filter((i) => i.id_carrito !== id))}
              />
            ))
          )}
        </div>

        <div className="p-3 bg-slate-100 border-t border-slate-200 space-y-2 shrink-0">
          <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
            Modalidad de Pago
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-200 p-1 rounded-xl text-[11px] font-bold">
            <button type="button" id={DOM_IDS.TIPO_PAGO_CONTADO} onClick={() => setTipoPago("CONTADO")} className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${tipoPago === "CONTADO" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600"}`}>
              <Banknote size={12} /> Contado
            </button>
            <button type="button" id={DOM_IDS.TIPO_PAGO_ABONO} onClick={() => setTipoPago("ABONO")} className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${tipoPago === "ABONO" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600"}`}>
              <Receipt size={12} /> Abono
            </button>
            <button type="button" id={DOM_IDS.TIPO_PAGO_ANTICIPO} onClick={() => setTipoPago("ANTICIPO")} className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${tipoPago === "ANTICIPO" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-600"}`}>
              <PiggyBank size={12} /> Anticipo
            </button>
          </div>

          <div className="pt-1 space-y-1 text-xs text-slate-500">
            {incluyeIGV ? (
              <>
                <div className="flex justify-between">
                  <span>Subtotal (Base Imponible)</span>
                  <span className="font-semibold text-slate-700">{formatMoney(baseImponible)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%)</span>
                  <span className="text-emerald-700 font-semibold">{formatMoney(igvCalculado)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-amber-800 bg-amber-50 px-2 py-1 rounded-lg text-[11px] font-semibold border border-amber-200/60">
                <span>Operación Exonerada</span>
                <span>IGV: S/ 0.00</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>TOTAL A PAGAR</span>
              <span className="text-xl font-black text-emerald-700">{formatMoney(montoBrutoFinal)}</span>
            </div>
          </div>

          <button
            type="button"
            id={DOM_IDS.BTN_PROCESAR_VENTA}
            disabled={carrito.length === 0}
            onClick={() => setShowCheckout(true)}
            className={`
              w-full mt-1 py-3.5 px-4 font-black rounded-xl text-base shadow-md transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]
              ${carrito.length > 0
                ? "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 shadow-emerald-500/30 scale-[1.01]"
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-950" />
              <span>
                {carrito.length > 0
                  ? `COBRAR ${formatMoney(montoBrutoFinal)} (F2)`
                  : "PROCESAR VENTA (F2)"}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 opacity-80" />
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
        clientePreseleccionado={clienteSeleccionado}
        onVentaExitosa={async () => {
          setCarrito([]);
          setShowCartMobile(false);
          await limpiarCarritoStorage();
        }}
      />
    </>
  );
}
