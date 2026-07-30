import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const moneda = (v: number) => `S/ ${Number(v || 0).toFixed(2)}`;

export default function ComprobantePublicoPage() {
  const { token } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch(`/api/comprobantes-publicos/${token}`)
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).message || 'No disponible'); return r.json(); })
      .then(setData).catch((e) => setError(e.message));
  }, [token]);
  if (error) return <main className="min-h-screen grid place-items-center bg-slate-100 p-4"><div className="max-w-md rounded-2xl bg-white p-6 text-center shadow"><h1 className="font-black text-rose-700">Comprobante no disponible</h1><p className="mt-2 text-sm text-slate-500">{error}</p></div></main>;
  if (!data) return <main className="min-h-screen grid place-items-center bg-slate-100 text-sm font-bold text-slate-500">Cargando comprobante…</main>;
  const s = data.snapshot;
  return <main className="min-h-screen bg-slate-100 p-3 sm:p-8"><article className="mx-auto max-w-[210mm] bg-white p-6 shadow-sm sm:p-10 print:shadow-none print:p-0"><header className="border-b-2 border-slate-900 pb-4"><h1 className="text-xl font-black">{s.emisor?.razon_social || s.emisor?.nombre}</h1><p className="text-sm">RUC: {s.emisor?.ruc || '—'}</p><p className="text-xs text-slate-500">{s.emisor?.direccion || ''}</p><h2 className="mt-4 text-right text-lg font-black">{s.tipo_comprobante}</h2><p className="text-right text-xs">Emisión: {new Date(s.emitido_at).toLocaleString('es-PE')}</p></header><section className="my-5 text-sm"><b>Cliente:</b> {s.cliente?.nombre}<br/><span className="text-slate-500">{s.cliente?.documento || ''}</span></section><table className="w-full border-collapse text-sm"><thead><tr className="border-y border-slate-300 text-left"><th className="py-2">Descripción</th><th className="py-2 text-right">Cant.</th><th className="py-2 text-right">P. unit.</th><th className="py-2 text-right">Subtotal</th></tr></thead><tbody>{s.items.map((i: any, n: number) => <tr key={n} className="border-b border-slate-100"><td className="py-2">{i.descripcion}<span className="block text-xs text-slate-500">{i.presentacion}</span></td><td className="py-2 text-right">{i.cantidad}</td><td className="py-2 text-right">{moneda(i.precio_unitario)}</td><td className="py-2 text-right">{moneda(i.subtotal)}</td></tr>)}</tbody></table><section className="ml-auto mt-5 w-56 text-sm"><p className="flex justify-between"><span>Subtotal</span><b>{moneda(s.totales.subtotal)}</b></p><p className="flex justify-between"><span>IGV</span><b>{moneda(s.totales.igv)}</b></p><p className="mt-2 flex justify-between border-t-2 border-slate-900 pt-2 text-lg"><span>Total</span><b>{moneda(s.totales.total)}</b></p></section><footer className="mt-10 text-center text-xs text-slate-500">Documento verificable · Diseño {data.plantilla_version}</footer></article><div className="mx-auto mt-4 flex max-w-[210mm] justify-center gap-2 print:hidden"><button onClick={() => window.print()} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">Imprimir / Guardar PDF</button></div></main>;
}
