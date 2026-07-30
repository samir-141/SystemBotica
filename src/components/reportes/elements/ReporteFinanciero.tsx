import { WalletCards, Package, ReceiptText, TrendingDown } from "lucide-react";

type Props = {
  reporte: any;
  loading: boolean;
  sucursalId: string;
  sucursales: Array<{ id: string; nombre: string }>;
  onSucursalChange: (id: string) => void;
  onRefresh: () => void;
};

const dinero = (valor: number) => `S/ ${Number(valor || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

export default function ReporteFinanciero({ reporte, loading, sucursalId, sucursales, onSucursalChange, onRefresh }: Props) {
  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-sm font-bold text-slate-400">Calculando posición financiera…</div>;
  const r = reporte?.resumen;
  if (!r) return <div className="rounded-2xl bg-rose-50 p-6 text-sm text-rose-700">No se pudo cargar el reporte financiero.</div>;
  const cards = [
    ["Ventas cobradas", r.ventas_cobradas, WalletCards, "text-emerald-700", "Cobros registrados en el período"],
    ["Costo de mercadería vendida", r.costo_ventas, ReceiptText, "text-amber-700", "Costo real de los lotes vendidos"],
    ["Gastos operativos", r.gastos_operativos, TrendingDown, "text-rose-700", "Alquiler, servicios y otros egresos"],
    ["Capital en stock", r.capital_inmovilizado_stock, Package, "text-indigo-700", "Mercadería vigente valorizada a costo"],
  ] as const;
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div><h2 className="text-lg font-black text-slate-900">Posición financiera</h2><p className="text-xs text-slate-500">Ubicación del dinero: ventas, costo vendido, gastos y capital inmovilizado.</p></div>
        <div className="flex flex-wrap gap-2"><select value={sucursalId} onChange={(e) => onSucursalChange(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"><option value="">Global — todas las sucursales</option>{sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select><button onClick={onRefresh} className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-bold text-white">Actualizar</button></div>
      </div>
      <div className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white"><span className="text-slate-400">Alcance: </span><b>{reporte.alcance}</b><span className="mx-2 text-slate-600">•</span><span className="text-slate-400">Resultado operativo: </span><b className={r.resultado_operativo < 0 ? "text-rose-300" : "text-emerald-300"}>{dinero(r.resultado_operativo)}</b></div>
    </section>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([titulo, valor, Icon, color, nota]) => <div key={titulo} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex justify-between"><span className="text-[10px] font-black uppercase tracking-wide text-slate-400">{titulo}</span><Icon size={18} className={color}/></div><p className={`mt-3 text-2xl font-black ${color}`}>{dinero(valor)}</p><p className="mt-1 text-[10px] text-slate-400">{nota}</p></div>)}</section>
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-black text-slate-800">Resultado del período</h3><div className="mt-3 space-y-2 text-xs"><p className="flex justify-between"><span>Margen bruto</span><b>{dinero(r.margen_bruto)}</b></p><p className="flex justify-between"><span>Inversiones registradas</span><b>{dinero(r.inversiones)}</b></p><p className="flex justify-between border-t pt-2"><span>Compras formalizadas</span><b>{dinero(r.compras_registradas)}</b></p></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-black text-slate-800">Dinero en riesgo</h3><p className="mt-3 text-2xl font-black text-rose-700">{dinero(r.capital_en_lotes_vencidos)}</p><p className="mt-1 text-[10px] text-slate-400">Costo inmovilizado en lotes vencidos. No se considera como stock vendible.</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-black text-slate-800">Cobros por método</h3><div className="mt-3 space-y-2">{(reporte.cobros_por_metodo || []).map((p: any) => <p key={p.metodo} className="flex justify-between text-xs"><span>{p.metodo}</span><b>{dinero(p.monto)}</b></p>) || <p className="text-xs text-slate-400">Sin cobros.</p>}</div></div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h3 className="font-black text-slate-800">Detalle de gastos e inversiones</h3><p className="text-xs text-slate-400">Trazabilidad de los egresos que explican dónde se destinó el dinero.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="p-3">Fecha</th><th className="p-3">Sucursal</th><th className="p-3">Tipo / categoría</th><th className="p-3">Descripción</th><th className="p-3 text-right">Monto</th></tr></thead><tbody>{(reporte.gastos_detalle || []).map((g: any) => <tr key={g.id} className="border-t border-slate-100"><td className="p-3">{new Date(g.fecha).toLocaleDateString("es-PE")}</td><td className="p-3">{g.sucursal}</td><td className="p-3"><b>{g.tipo}</b><br/><span className="text-slate-400">{g.categoria}</span></td><td className="p-3 text-slate-600">{g.descripcion || "Sin descripción"}</td><td className="p-3 text-right font-black">{dinero(g.monto)}</td></tr>)}{reporte.gastos_detalle?.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No hay gastos ni inversiones en el período.</td></tr>}</tbody></table></div></section>
  </div>;
}
