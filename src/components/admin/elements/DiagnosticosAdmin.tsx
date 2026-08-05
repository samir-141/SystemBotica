// src/components/admin/elements/DiagnosticosAdmin.tsx
import { useState, useEffect } from "react";
import { Stethoscope, RefreshCw, Route } from "lucide-react";
import { diagnosticosService } from "../../../services/diagnosticos.service";

type Props = {};

type RutaInfo = {
  controller: string;
  metodo: string;
  ruta: string;
  funcion: string;
};

type ModulosInfo = {
  totalModulos: number;
  totalProviders: number;
  totalControllers: number;
};

export default function DiagnosticosAdmin(_props: Props) {
  const [rutas, setRutas] = useState<RutaInfo[]>([]);
  const [modulos, setModulos] = useState<ModulosInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [rutasRes, modulosRes] = await Promise.all([
        diagnosticosService.getDiagnosticoRutas(),
        diagnosticosService.getDiagnosticoModulos(),
      ]);
      setRutas(rutasRes.rutas || []);
      setModulos(modulosRes);
    } catch (err: any) {
      console.error("Error al cargar diagnósticos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const metodoColor = (metodo: string) => {
    switch (metodo) {
      case "GET": return "bg-emerald-50 text-emerald-700";
      case "POST": return "bg-blue-50 text-blue-700";
      case "PATCH": return "bg-amber-50 text-amber-700";
      case "DELETE": return "bg-rose-50 text-rose-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Diagnóstico del Sistema</h2>
            <p className="text-[10px] text-slate-400 font-medium">Rutas registradas y módulos cargados</p>
          </div>
        </div>
        <button onClick={cargar} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
        </button>
      </div>

      {modulos && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Módulos</div>
            <div className="text-lg font-black text-slate-900">{modulos.totalModulos}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Providers</div>
            <div className="text-lg font-black text-slate-900">{modulos.totalProviders}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Controllers</div>
            <div className="text-lg font-black text-slate-900">{modulos.totalControllers}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Route className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Rutas registradas ({rutas.length})</span>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2 px-3">Método</th>
                <th className="py-2 px-3">Ruta</th>
                <th className="py-2 px-3">Controlador</th>
                <th className="py-2 px-3">Función</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rutas.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${metodoColor(r.metodo)}`}>
                      {r.metodo}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-700 font-bold">{r.ruta}</td>
                  <td className="py-2 px-3 text-slate-600">{r.controller}</td>
                  <td className="py-2 px-3 text-slate-500">{r.funcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
