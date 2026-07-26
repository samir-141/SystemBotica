import { useState } from "react";
import { X, PackagePlus, Calendar, Hash, DollarSign, Check, HelpCircle } from "lucide-react";
import { posApi } from "../../api/api.data";

interface Props {
  open: boolean;
  onClose: () => void;
  producto?: {
    id: string;
    nombre_comercial: string;
    sku?: string;
  } | null;
  productosLista?: Array<{
    producto_comercial_id: string;
    nombre_comercial: string;
    sku?: string;
  }>;
  onSuccess?: () => void;
}

export default function ReabastecerModal({
  open,
  onClose,
  producto,
  productosLista = [],
  onSuccess,
}: Props) {
  const [selectedProdId, setSelectedProdId] = useState(producto?.id || "");
  const [stockAdicional, setStockAdicional] = useState(500);
  const [numeroLote, setNumeroLote] = useState(`LOTE-${Date.now().toString().slice(-6)}`);
  const [fechaVencimiento, setFechaVencimiento] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [precioCompraBase, setPrecioCompraBase] = useState(0.50);
  const [cargando, setCargando] = useState(false);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prodId = producto?.id || selectedProdId;
    if (!prodId) {
      alert("Por favor selecciona un producto para reabastecer.");
      return;
    }

    if (stockAdicional <= 0) {
      alert("La cantidad a reabastecer debe ser mayor a 0.");
      return;
    }

    setCargando(true);
    try {
      const res = await posApi.reabastecerStock({
        producto_comercial_id: prodId,
        numero_lote: numeroLote,
        fecha_vencimiento: fechaVencimiento,
        stock_adicional: Number(stockAdicional),
        precio_compra_base: Number(precioCompraBase),
      });

      alert(res.mensaje || "Stock reabastecido correctamente.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Error al reabastecer stock: ${err.message || "Error del servidor"}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <PackagePlus size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Reabastecer Stock / Ingreso de Lote</h2>
              <p className="text-xs text-slate-400">Añadir nuevas unidades al inventario FEFO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selección de Producto */}
          {producto ? (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl">
              <p className="text-[10px] text-teal-700 font-bold uppercase">Producto Seleccionado:</p>
              <h3 className="font-black text-slate-900 text-sm">{producto.nombre_comercial}</h3>
              {producto.sku && <p className="text-xs text-slate-500 font-mono">SKU: {producto.sku}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Seleccionar Producto Comercial:
              </label>
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">-- Seleccionar Medicina o Producto --</option>
                {productosLista.map((p) => (
                  <option key={p.producto_comercial_id} value={p.producto_comercial_id}>
                    {p.nombre_comercial} {p.sku ? `(${p.sku})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cantidad de Unidades a Añadir */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-extrabold text-slate-700">
                Cantidad de Nuevas Unidades Base (+500, +1000):
              </label>
              <button
                type="button"
                onClick={() => setMostrarAyuda(!mostrarAyuda)}
                className="text-teal-600 hover:text-teal-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle size={14} />
                <span>¿Cómo funciona?</span>
              </button>
            </div>

            {mostrarAyuda && (
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-2xl text-[11px] text-slate-700 space-y-1 my-2 animate-in fade-in duration-150">
                <p className="font-bold text-teal-800">💡 ¿Qué es la Unidad Base?</p>
                <p>
                  Es la unidad mínima indivisible del producto (ej. 1 Tableta, 1 Frasco, 1 Ampolla). Si compras una caja de 500 tabletas, ingresa <span className="font-bold">500</span> unidades. El sistema descontará automáticamente el stock exacto según la presentación que venda el cajero (Caja, Blíster o Pastilla).
                </p>
              </div>
            )}

            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={stockAdicional}
                onChange={(e) => setStockAdicional(Number(e.target.value))}
                className="w-full pl-4 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-teal-500"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md">
                Unidades
              </span>
            </div>
          </div>

          {/* N° Lote y Fecha Vencimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Hash size={13} className="text-slate-400" />
                <span>Número de Lote:</span>
              </label>
              <input
                type="text"
                value={numeroLote}
                onChange={(e) => setNumeroLote(e.target.value)}
                placeholder="ej. LOTE-2026-A1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-slate-400" />
                <span>Fecha Vencimiento:</span>
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Precio de Compra Unitario Base */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
              <DollarSign size={13} className="text-slate-400" />
              <span>Precio de Compra Unitario Base (S/):</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precioCompraBase}
              onChange={(e) => setPrecioCompraBase(Number(e.target.value))}
              placeholder="ej. 0.50"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Botones Acciones */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5"
            >
              {cargando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
              <span>{cargando ? "Guardando..." : "Ingresar Stock"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
