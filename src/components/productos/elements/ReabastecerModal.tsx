import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { X, PackagePlus, Calendar, Hash, DollarSign, Check, Layers, Search, ScanLine } from "lucide-react";
import { Toast } from "primereact/toast";
import { posApi } from "../../api/api.data";

type ProductoIngreso = {
  producto_comercial_id: string; nombre_comercial: string; sku?: string;
  codigo_barras?: string; presentacion_id?: string; presentacion_nombre?: string;
  cantidad_unidad_base?: number;
};
interface Props {
  open: boolean; onClose: () => void;
  producto?: { id: string; nombre_comercial: string; sku?: string } | null;
  productosLista?: ProductoIngreso[]; onSuccess?: () => void;
  modo?: "nuevo-lote" | "reabastecer";
}

export default function ReabastecerModal({ open, onClose, producto, productosLista = [], onSuccess, modo = "reabastecer" }: Props) {
  const toast = useRef<Toast>(null);
  const videoScannerRef = useRef<HTMLVideoElement>(null);
  const [selectedProdId, setSelectedProdId] = useState("");
  const [presentacionId, setPresentacionId] = useState("");
  const [buscarProducto, setBuscarProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [numeroLote, setNumeroLote] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [precioCompraPresentacion, setPrecioCompraPresentacion] = useState("");
  const [lotesExistentes, setLotesExistentes] = useState<Array<{ id: string; numero_lote: string; fecha_vencimiento: string; stock_actual: number }>>([]);
  const [presentacionesDetalle, setPresentacionesDetalle] = useState<ProductoIngreso[]>([]);
  const [buscarLote, setBuscarLote] = useState("");
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [scannerAbierto, setScannerAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedProdId(producto?.id || ""); setPresentacionId(""); setBuscarProducto("");
    setCantidad(""); setNumeroLote(""); setFechaVencimiento(""); setPrecioCompraPresentacion(""); setLotesExistentes([]); setPresentacionesDetalle([]); setBuscarLote(""); setMostrarProductos(false); setScannerAbierto(false);
  }, [open, producto]);

  const productosUnicos = useMemo(() => {
    const vistos = new Set<string>(); const texto = buscarProducto.trim().toLowerCase();
    return productosLista.filter((p) => !vistos.has(p.producto_comercial_id)
      && (vistos.add(p.producto_comercial_id), !texto || p.nombre_comercial.toLowerCase().includes(texto)));
  }, [productosLista, buscarProducto]);
  const prodId = producto?.id || selectedProdId;
  const esReabastecimientoDeLote = Boolean(producto) && modo === "reabastecer";
  const presentaciones = useMemo(() => {
    const disponibles = productosLista.filter(p => p.producto_comercial_id === prodId && p.presentacion_id);
    return disponibles.length ? disponibles : presentacionesDetalle;
  }, [productosLista, prodId, presentacionesDetalle]);
  const presentacion = presentaciones.find(p => p.presentacion_id === presentacionId);
  const equivalencia = Number(presentacion?.cantidad_unidad_base || 1);
  const unidadesBase = (Number(cantidad) || 0) * equivalencia;

  useEffect(() => {
    if (!open || !prodId) return;
    let activo = true;
    posApi.getProductoDetalle(prodId)
      .then((detalle) => {
        if (!activo) return;
        setLotesExistentes(detalle.lotes || []);
        setPresentacionesDetalle((detalle.presentaciones || []).map((pres: any) => ({
          producto_comercial_id: prodId,
          presentacion_id: pres.id,
          presentacion_nombre: pres.unidad_presentacion?.nombre || "Presentación",
          cantidad_unidad_base: Number(pres.cantidad_unidad_base || 1),
          codigo_barras: pres.codigo_barras || undefined,
        })));
      })
      .catch(() => activo && (setLotesExistentes([]), setPresentacionesDetalle([])));
    return () => { activo = false; };
  }, [open, prodId]);

  const seleccionarProducto = (item: ProductoIngreso) => {
    setSelectedProdId(item.producto_comercial_id);
    setPresentacionId("");
    setBuscarProducto(item.nombre_comercial);
    setMostrarProductos(false);
  };

  const seleccionarPorCodigo = async (codigo: string) => {
    const encontrado = productosLista.find((item) => item.codigo_barras === codigo || item.sku === codigo);
    if (encontrado) return seleccionarProducto(encontrado);
    try {
      const resultado = await posApi.buscarPorIdentificador(codigo);
      const item = productosLista.find((p) => p.producto_comercial_id === resultado?.producto_comercial_id);
      if (item) return seleccionarProducto(item);
    } catch { /* el aviso se muestra abajo */ }
    toast.current?.show({ severity: "warn", summary: "Producto no encontrado", detail: "El código no corresponde a un producto disponible para reabastecer.", life: 3500 });
  };

  useEffect(() => {
    if (!scannerAbierto || !videoScannerRef.current) return;
    const reader = new BrowserMultiFormatReader();
    reader.decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, videoScannerRef.current, (result, error) => {
      if (result) {
        void seleccionarPorCodigo(result.getText());
        setScannerAbierto(false);
      } else if (error && !(error instanceof NotFoundException)) console.warn("[ReabastecerScanner]", error);
    }).catch(() => toast.current?.show({ severity: "error", summary: "Cámara", detail: "No se pudo abrir la cámara.", life: 3500 }));
    return () => reader.reset();
  }, [scannerAbierto, productosLista]);

  const lotesConMismoVencimiento = fechaVencimiento
    ? lotesExistentes.filter((lote) => lote.fecha_vencimiento.slice(0, 10) === fechaVencimiento)
    : [];
  useEffect(() => {
    if (lotesConMismoVencimiento.length === 1) setNumeroLote(lotesConMismoVencimiento[0].numero_lote);
  }, [fechaVencimiento, lotesExistentes]);

  const seleccionarLoteExistente = (valor: string) => {
    setBuscarLote(valor);
    const lote = lotesExistentes.find((item) => item.numero_lote === valor);
    if (!lote) return;
    setNumeroLote(lote.numero_lote);
    setFechaVencimiento(lote.fecha_vencimiento.slice(0, 10));
  };

  if (!open) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodId || !presentacion || !cantidad || !numeroLote.trim() || !fechaVencimiento || !precioCompraPresentacion) {
      toast.current?.show({ severity: "warn", summary: "Datos incompletos", detail: "Selecciona producto y presentación, luego completa cantidad, lote, vencimiento y costo.", life: 3500 }); return;
    }
    if (unidadesBase <= 0) return;
    setCargando(true);
    try {
      const res = await posApi.reabastecerStock({ producto_comercial_id: prodId, numero_lote: numeroLote.trim(), fecha_vencimiento: fechaVencimiento, stock_adicional: unidadesBase, precio_compra_base: Number(precioCompraPresentacion) / equivalencia });
      toast.current?.show({ severity: "success", summary: "Stock ingresado", detail: res.mensaje || "Lote registrado correctamente.", life: 3000 }); onSuccess?.(); onClose();
    } catch (err: any) { toast.current?.show({ severity: "error", summary: "Error", detail: err.message || "No se pudo ingresar el lote.", life: 3500 }); }
    finally { setCargando(false); }
  };

  return <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"><div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 grid place-items-center"><PackagePlus size={22}/></div><div><h2 className="font-extrabold text-base">{esReabastecimientoDeLote ? "Reabastecer stock de lote" : "Ingreso de nuevo lote"}</h2><p className="text-xs text-slate-400">{esReabastecimientoDeLote ? "Selecciona un lote vigente para incrementar su stock" : "La cantidad se convierte automáticamente a unidad base"}</p></div></div><button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button></div>
    <form onSubmit={submit} className="p-6 space-y-4">
      <div>{!producto && <><label className="block text-xs font-extrabold text-slate-700 mb-1">Producto comercial</label><div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={buscarProducto} onFocus={() => setMostrarProductos(true)} onChange={e=>{setBuscarProducto(e.target.value);setMostrarProductos(true);setSelectedProdId("");setPresentacionId("");}} placeholder="Buscar por nombre o escanear código" className="w-full pl-9 pr-24 py-2.5 border border-slate-200 rounded-xl text-xs"/><button type="button" onClick={() => setScannerAbierto(true)} title="Escanear código de producto" className="absolute right-1.5 top-1.5 inline-flex h-8 items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100"><ScanLine size={15}/> Escanear</button>{mostrarProductos && buscarProducto.trim() && <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">{productosUnicos.length ? productosUnicos.map((item) => <button key={item.producto_comercial_id} type="button" onClick={() => seleccionarProducto(item)} className="block w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-800">{item.nombre_comercial}</button>) : <p className="px-3 py-2 text-xs text-slate-400">Sin resultados</p>}</div>}</div></>}{producto && <p className="p-2.5 bg-teal-50 rounded-xl text-xs font-bold text-teal-800">{producto.nombre_comercial}</p>}{scannerAbierto && <div className="mt-2 overflow-hidden rounded-xl border border-indigo-200 bg-black"><video ref={videoScannerRef} className="max-h-52 w-full object-cover" playsInline muted/><button type="button" onClick={() => setScannerAbierto(false)} className="w-full bg-slate-900 py-2 text-xs font-bold text-white">Cerrar cámara</button></div>}</div>
      <div><label className="block text-xs font-extrabold text-slate-700 mb-1 flex gap-1 items-center"><Layers size={13}/> Presentación que se está comprando</label><select value={presentacionId} onChange={e=>setPresentacionId(e.target.value)} disabled={!prodId} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" required><option value="">-- Unidad / Blíster / Caja --</option>{presentaciones.map(p=><option key={p.presentacion_id} value={p.presentacion_id}>{p.presentacion_nombre} (equivale a {p.cantidad_unidad_base} unidad(es) base)</option>)}</select></div>
      <div><label className="block text-xs font-extrabold text-slate-700 mb-1">Cantidad de {presentacion?.presentacion_nombre || "presentaciones"}</label><input type="number" min="1" step="1" value={cantidad} onChange={e=>setCantidad(e.target.value)} disabled={!presentacion} placeholder="Ej. 5" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" required/>{presentacion && <p className="mt-1 text-[11px] text-teal-700 font-bold">Se ingresarán {unidadesBase} unidades base al inventario.</p>}</div>
      {esReabastecimientoDeLote && <div><label className="block text-xs font-extrabold text-slate-700 mb-1">Buscar lote vigente</label><input list="lotes-vigentes" value={buscarLote} onChange={e=>seleccionarLoteExistente(e.target.value)} placeholder="Escribe número de lote o selecciónalo" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"/><datalist id="lotes-vigentes">{lotesExistentes.filter((lote) => lote.fecha_vencimiento.slice(0, 10) >= new Date().toISOString().slice(0, 10)).map((lote) => <option key={lote.id} value={lote.numero_lote}>{`Vence: ${new Date(lote.fecha_vencimiento).toLocaleDateString()} · Stock: ${lote.stock_actual}`}</option>)}</datalist><p className="mt-1 text-[10px] text-slate-400">Al elegirlo se completan automáticamente el número y la fecha de vencimiento.</p></div>}
      <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-extrabold text-slate-700 mb-1 flex gap-1"><Hash size={13}/> Lote</label><input value={numeroLote} onChange={e=>setNumeroLote(e.target.value)} placeholder="Ej. LOTE-2026-A1" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" required/></div><div><label className="block text-xs font-extrabold text-slate-700 mb-1 flex gap-1"><Calendar size={13}/> Vencimiento</label><input type="date" value={fechaVencimiento} onChange={e=>setFechaVencimiento(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" required/></div></div>
      {lotesConMismoVencimiento.length === 1 && <p className="-mt-2 text-[10px] font-bold text-teal-700">Se encontró el lote vigente {lotesConMismoVencimiento[0].numero_lote} con este vencimiento; se agregará allí.</p>}
      {lotesConMismoVencimiento.length > 1 && <p className="-mt-2 text-[10px] font-bold text-amber-700">Hay varios lotes con este vencimiento. Escribe el número de lote impreso para conservar la trazabilidad.</p>}
      <div><label className="block text-xs font-extrabold text-slate-700 mb-1 flex gap-1"><DollarSign size={13}/> Costo por {presentacion?.presentacion_nombre || "presentación"} (S/)</label><input type="number" min="0" step="0.01" value={precioCompraPresentacion} onChange={e=>setPrecioCompraPresentacion(e.target.value)} disabled={!presentacion} placeholder="0.00" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono" required/>{presentacion && precioCompraPresentacion && <p className="mt-1 text-[11px] text-slate-500">Costo unitario base: S/ {(Number(precioCompraPresentacion) / equivalencia).toFixed(4)}</p>}</div>
      <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 rounded-xl text-xs font-bold">Cancelar</button><button type="submit" disabled={cargando} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-extrabold flex justify-center gap-1">{cargando ? "Guardando..." : <><Check size={16}/> Ingresar stock</>}</button></div>
    </form></div><Toast ref={toast}/></div>;
}
