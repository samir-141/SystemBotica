import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { gastosService } from '../../services/gastos.service';
import { fechaCivil } from '../../utils/localDate';
import { useAuth } from '../../hooks/useAuth';

type Tipo = 'OPERATIVO' | 'INVERSION';
type Gasto = { id: string; tipo: Tipo; categoria: string; descripcion?: string | null; monto: number | string; fecha: string };
const fechaHoy = () => fechaCivil();

export default function GastosPage() {
  const { sucursalActual } = useAuth();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ tipo: 'OPERATIVO' as Tipo, categoria: '', monto: '', descripcion: '', fecha: fechaHoy() });

  const cargar = useCallback(async () => {
    try { setGastos(await gastosService.getGastos({ sucursal_id: sucursalActual?.id })); }
    catch (e: any) { setError(e?.message || 'No se pudieron cargar los gastos.'); }
  }, [sucursalActual?.id]);
  useEffect(() => { void cargar(); }, [cargar]);

  const guardar = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (!form.categoria.trim() || Number(form.monto) <= 0) { setError('Indica categoría y monto válido.'); return; }
    try {
      await gastosService.crearGasto({ ...form, monto: Number(form.monto), sucursal_id: sucursalActual?.id });
      setForm({ tipo: 'OPERATIVO', categoria: '', monto: '', descripcion: '', fecha: fechaHoy() });
      await cargar();
    } catch (e: any) { setError(e?.message || 'No se pudo registrar el gasto.'); }
  };
  const total = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);

  return <section className="p-5 max-w-5xl mx-auto space-y-5">
    <header><h1 className="text-2xl font-black text-slate-900">Gastos e inversiones</h1><p className="text-sm text-slate-500">Alquiler, servicios, equipos y aportes de capital. Las compras de productos se registran como compras de inventario.</p></header>
    <div className="grid md:grid-cols-[340px_1fr] gap-5">
      <form onSubmit={guardar} className="bg-white border rounded-xl p-5 space-y-3">
        <h2 className="font-bold">Nuevo registro</h2>
        <label className="block text-sm">Tipo<select className="mt-1 w-full border rounded p-2" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as Tipo })}><option value="OPERATIVO">Gasto operativo</option><option value="INVERSION">Inversión</option></select></label>
        <label className="block text-sm">Categoría<input required className="mt-1 w-full border rounded p-2" placeholder="Alquiler, luz, equipo..." value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} /></label>
        <label className="block text-sm">Monto S/<input required type="number" min="0.01" step="0.01" className="mt-1 w-full border rounded p-2" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} /></label>
        <label className="block text-sm">Fecha<input type="date" className="mt-1 w-full border rounded p-2" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></label>
        <label className="block text-sm">Descripción<textarea className="mt-1 w-full border rounded p-2" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></label>
        {error && <p className="text-sm text-rose-600">{error}</p>}<button className="w-full bg-teal-600 text-white rounded p-2 font-bold">Registrar</button>
      </form>
      <div className="bg-white border rounded-xl overflow-hidden"><div className="p-4 border-b flex justify-between"><h2 className="font-bold">Registros</h2><b>S/ {total.toFixed(2)}</b></div>{gastos.length === 0 ? <p className="p-4 text-slate-500">Sin registros.</p> : gastos.map(g => <div className="p-4 border-b flex justify-between gap-3" key={g.id}><div><b>{g.categoria}</b><p className="text-sm text-slate-500">{g.tipo} · {g.descripcion || new Date(g.fecha).toLocaleDateString('es-PE')}</p></div><b>S/ {Number(g.monto).toFixed(2)}</b></div>)}</div>
    </div>
  </section>;
}
