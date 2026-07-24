import { Shield, Lock, CheckCircle2, KeyRound } from "lucide-react";
import type { RolItem } from "../hooks/useAdmin";

type Props = {
  roles: RolItem[];
  loading?: boolean;
};

const MODULOS_SISTEMA = [
  { nombre: "Ventas (POS)", desc: "Apertura de caja, emisión de boletas/facturas y cobro" },
  { nombre: "Inventario & Productos", desc: "Gestión de catálogo, lotes FEFO y precios" },
  { nombre: "Clientes", desc: "Registro, búsqueda DNI/RUC e historial de compras" },
  { nombre: "Reportes & Analítica", desc: "Reporte de ventas, finanzas e inventario por fecha" },
  { nombre: "Administración & ERP", desc: "Gestión de usuarios, roles, permisos y sucursales" },
];

export default function RolesAdmin({ roles }: Props) {
  return (
    <div className="space-y-6">
      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Rol del Sistema
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{r.nombre}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {r.rol_permisos?.length || 5} permiso(s) asignado(s)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Matriz de Permisos */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Matriz de Control de Acceso por Rol</h2>
              <p className="text-xs text-slate-400">Nivel de autorización por módulo del ERP</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 tracking-wider text-[11px]">
                <th className="py-3 px-4">Módulo ERP / Sistema</th>
                {roles.map((r) => (
                  <th key={r.id} className="py-3 px-4 text-center">
                    {r.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODULOS_SISTEMA.map((m) => (
                <tr key={m.nombre} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{m.nombre}</div>
                    <p className="text-[10px] text-slate-400">{m.desc}</p>
                  </td>
                  {roles.map((r) => {
                    const esAdmin = r.nombre.toLowerCase().includes("admin");
                    const esAdminOModulo = esAdmin || (!m.nombre.includes("Administración") && !m.nombre.includes("Reportes"));


                    return (
                      <td key={r.id} className="py-3 px-4 text-center">
                        {esAdminOModulo ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Permitido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" /> Restringido
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
