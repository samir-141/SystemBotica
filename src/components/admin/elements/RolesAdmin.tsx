import { useState } from "react";
import { Shield, KeyRound, Loader2 } from "lucide-react";
import type { RolItem } from "../hooks/useAdmin";
import { useAuth } from "../../../hooks/useAuth";

type Props = {
  roles: RolItem[];
  loading?: boolean;
  onUpdatePermisos?: (rolId: string, permisosIds: string[]) => Promise<void>;
};

const MODULOS_SISTEMA = [
  { codigo: "ventas", nombre: "Ventas (POS)", desc: "Apertura de caja, emisión de boletas/facturas y cobro" },
  { codigo: "inventario", nombre: "Inventario & Productos", desc: "Gestión de catálogo, lotes FEFO y precios" },
  { codigo: "clientes", nombre: "Clientes", desc: "Registro, búsqueda DNI/RUC e historial de compras" },
  { codigo: "reportes", nombre: "Reportes & Analítica", desc: "Reporte de ventas, finanzas e inventario por fecha" },
  { codigo: "admin", nombre: "Administración & ERP", desc: "Gestión de usuarios, roles, permisos y sucursales" },
];

export default function RolesAdmin({ roles, onUpdatePermisos }: Props) {
  const { user } = useAuth();
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // Check if current user is admin
  const esUsuarioAdmin = String(user?.rol || "").toUpperCase().includes("ADMIN");

  // Collect all unique permissions from the roles data to get their IDs
  const todosLosPermisos = Array.from(
    new Map(
      roles
        .flatMap((r) => r.rol_permisos || [])
        .map((rp) => rp.permisos)
        .filter((p): p is { id: string; codigo: string; descripcion: string } => !!p)
        .map((p) => [p.codigo, p])
    ).values()
  );

  const handleToggle = async (rolId: string, codigo: string, checked: boolean) => {
    if (!onUpdatePermisos || !esUsuarioAdmin) return;

    const rol = roles.find((r) => r.id === rolId);
    if (!rol) return;

    // Get current permission IDs for this role
    const currentIds = (rol.rol_permisos || [])
      .map((rp) => rp.permisos?.id)
      .filter((id): id is string => !!id);

    // Find the permission object for the clicked code
    const permisoObj = todosLosPermisos.find((p) => p.codigo === codigo);
    if (!permisoObj) return;

    let nuevosIds: string[];
    if (checked) {
      nuevosIds = [...currentIds, permisoObj.id];
    } else {
      nuevosIds = currentIds.filter((id) => id !== permisoObj.id);
    }

    try {
      setUpdatingRoleId(rolId);
      await onUpdatePermisos(rolId, nuevosIds);
    } catch (err) {
      console.error("Error al actualizar permisos:", err);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Roles Cards Grid - stacked on mobile, grid on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => (
          <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:shadow-md transition-all">
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
                {r.rol_permisos?.length || 0} permiso(s) asignado(s)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Matriz de Permisos */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Matriz de Control de Acceso por Rol</h2>
              <p className="text-xs text-slate-400">Nivel de autorización por módulo del ERP</p>
            </div>
          </div>
          <div className="self-start sm:self-auto">
            {esUsuarioAdmin ? (
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/60 flex items-center gap-1">
                Modo Edición (Administrador)
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                Solo Lectura (No Admin)
              </span>
            )}
          </div>
        </div>

        {/* Scrollable table container for mobile friendliness */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle p-4 sm:p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 tracking-wider text-[11px]">
                  <th className="py-3 px-4 min-w-[200px]">Módulo ERP / Sistema</th>
                  {roles.map((r) => (
                    <th key={r.id} className="py-3 px-4 text-center whitespace-nowrap min-w-[120px]">
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
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{m.desc}</p>
                    </td>
                    {roles.map((r) => {
                      const tienePermiso = r.rol_permisos?.some((rp) => rp.permisos?.codigo === m.codigo) || false;
                      const isUpdating = updatingRoleId === r.id;

                      return (
                        <td key={r.id} className="py-3 px-4 text-center align-middle">
                          <div className="flex justify-center items-center min-h-[44px]">
                            {isUpdating ? (
                              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                            ) : (
                              <label className={`relative inline-flex items-center ${esUsuarioAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                                <input
                                  type="checkbox"
                                  checked={tienePermiso}
                                  disabled={!esUsuarioAdmin || isUpdating}
                                  onChange={(e) => handleToggle(r.id, m.codigo, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                              </label>
                            )}
                          </div>
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
    </div>
  );
}
