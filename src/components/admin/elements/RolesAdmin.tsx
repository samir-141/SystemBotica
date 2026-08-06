import React, { useState } from "react";
import { Shield, KeyRound, Loader2, Plus, Pencil, Trash, Check, X } from "lucide-react";
import type { RolItem } from "../hooks/useAdmin";
import { useAuth } from "../../../hooks/useAuth";

type Props = {
  roles: RolItem[];
  loading?: boolean;
  onUpdatePermisos?: (rolId: string, permisosIds: string[]) => Promise<void>;
  onCrearRol?: (nombre: string) => Promise<void>;
  onActualizarRol?: (id: string, nombre: string) => Promise<void>;
  onEliminarRol?: (id: string) => Promise<void>;
};

const MODULOS_SISTEMA = [
  { codigo: "ventas.ver", nombre: "Ventas", desc: "Ver historial de ventas", grupo: "Ventas (POS)" },
  { codigo: "ventas.crear", nombre: "Ventas", desc: "Registrar nuevas ventas", grupo: "Ventas (POS)" },
  { codigo: "ventas.anular", nombre: "Ventas", desc: "Anular ventas existentes", grupo: "Ventas (POS)" },
  { codigo: "inventario.ver", nombre: "Inventario", desc: "Ver productos y stock", grupo: "Inventario & Productos" },
  { codigo: "inventario.crear", nombre: "Inventario", desc: "Crear nuevos productos", grupo: "Inventario & Productos" },
  { codigo: "inventario.editar", nombre: "Inventario", desc: "Editar productos existentes", grupo: "Inventario & Productos" },
  { codigo: "inventario.eliminar", nombre: "Inventario", desc: "Eliminar productos", grupo: "Inventario & Productos" },
  { codigo: "inventario.reabastecer", nombre: "Inventario", desc: "Reabastecer stock de productos", grupo: "Inventario & Productos" },
  { codigo: "inventario.presentaciones", nombre: "Inventario", desc: "Gestionar presentaciones de venta", grupo: "Inventario & Productos" },
  { codigo: "compras.ver", nombre: "Compras", desc: "Ver historial de compras", grupo: "Compras" },
  { codigo: "compras.crear", nombre: "Compras", desc: "Registrar nuevas compras", grupo: "Compras" },
  { codigo: "cajas.ver", nombre: "Cajas", desc: "Ver estado de cajas", grupo: "Cajas & Turnos" },
  { codigo: "cajas.abrir", nombre: "Cajas", desc: "Aperturar turno de caja", grupo: "Cajas & Turnos" },
  { codigo: "cajas.cerrar", nombre: "Cajas", desc: "Cerrar turno de caja (Cierre Z)", grupo: "Cajas & Turnos" },
  { codigo: "cajas.movimientos", nombre: "Cajas", desc: "Registrar movimientos de caja", grupo: "Cajas & Turnos" },
  { codigo: "clientes.ver", nombre: "Clientes", desc: "Ver listado de clientes", grupo: "Clientes" },
  { codigo: "clientes.crear", nombre: "Clientes", desc: "Registrar nuevos clientes", grupo: "Clientes" },
  { codigo: "clientes.editar", nombre: "Clientes", desc: "Editar información de clientes", grupo: "Clientes" },
  { codigo: "clientes.eliminar", nombre: "Clientes", desc: "Eliminar clientes", grupo: "Clientes" },
  { codigo: "usuarios.ver", nombre: "Usuarios", desc: "Ver listado de usuarios", grupo: "Usuarios & Administración" },
  { codigo: "usuarios.crear", nombre: "Usuarios", desc: "Registrar nuevos usuarios", grupo: "Usuarios & Administración" },
  { codigo: "usuarios.editar", nombre: "Usuarios", desc: "Editar información de usuarios", grupo: "Usuarios & Administración" },
  { codigo: "usuarios.eliminar", nombre: "Usuarios", desc: "Eliminar usuarios", grupo: "Usuarios & Administración" },
  { codigo: "roles.gestionar", nombre: "Roles", desc: "Crear, editar y eliminar roles", grupo: "Usuarios & Administración" },
  { codigo: "sucursales.ver", nombre: "Sucursales", desc: "Ver sucursales", grupo: "Usuarios & Administración" },
  { codigo: "sucursales.crear", nombre: "Sucursales", desc: "Crear nuevas sucursales", grupo: "Usuarios & Administración" },
  { codigo: "reportes.ventas", nombre: "Reportes", desc: "Reporte financiero de ventas", grupo: "Reportes & Analítica" },
  { codigo: "reportes.inventario", nombre: "Reportes", desc: "Reporte de valorización de inventario", grupo: "Reportes & Analítica" },
  { codigo: "reportes.financiero", nombre: "Reportes", desc: "Reporte administrativo financiero", grupo: "Reportes & Analítica" },
  { codigo: "reportes.ple", nombre: "Reportes", desc: "Generar archivo PLE (SUNAT)", grupo: "Reportes & Analítica" },
  { codigo: "facturacion.emitir", nombre: "Facturación", desc: "Emitir comprobantes electrónicos", grupo: "Facturación Electrónica" },
  { codigo: "facturacion.enviar", nombre: "Facturación", desc: "Enviar comprobantes a SUNAT", grupo: "Facturación Electrónica" },
  { codigo: "facturacion.ver", nombre: "Facturación", desc: "Ver historial de comprobantes", grupo: "Facturación Electrónica" },
  { codigo: "facturacion.config", nombre: "Facturación", desc: "Configuración tributaria y certificados", grupo: "Facturación Electrónica" },
  { codigo: "facturacion.resumenes", nombre: "Facturación", desc: "Gestionar resúmenes diarios SUNAT", grupo: "Facturación Electrónica" },
  { codigo: "posventa.devoluciones", nombre: "Posventa", desc: "Registrar devoluciones", grupo: "Posventa" },
  { codigo: "posventa.cambios", nombre: "Posventa", desc: "Registrar cambios de producto", grupo: "Posventa" },
  { codigo: "posventa.garantias", nombre: "Posventa", desc: "Registrar garantías", grupo: "Posventa" },
  { codigo: "posventa.reclamos", nombre: "Posventa", desc: "Registrar reclamos", grupo: "Posventa" },
  { codigo: "series.ver", nombre: "Series", desc: "Ver series de documentos", grupo: "Series de Documentos" },
  { codigo: "series.gestionar", nombre: "Series", desc: "Crear y editar series de documentos", grupo: "Series de Documentos" },
  { codigo: "proveedores.ver", nombre: "Proveedores", desc: "Ver listado de proveedores", grupo: "Proveedores" },
  { codigo: "proveedores.crear", nombre: "Proveedores", desc: "Registrar nuevos proveedores", grupo: "Proveedores" },
  { codigo: "proveedores.editar", nombre: "Proveedores", desc: "Editar información de proveedores", grupo: "Proveedores" },
  { codigo: "proveedores.eliminar", nombre: "Proveedores", desc: "Eliminar proveedores", grupo: "Proveedores" },
  { codigo: "catalogos.ver", nombre: "Catálogos", desc: "Ver catálogos maestros", grupo: "Catálogos" },
  { codigo: "catalogos.gestionar", nombre: "Catálogos", desc: "Crear, editar y eliminar catálogos", grupo: "Catálogos" },
  { codigo: "gastos.ver", nombre: "Gastos", desc: "Ver gastos operativos", grupo: "Gastos" },
  { codigo: "gastos.crear", nombre: "Gastos", desc: "Registrar gastos", grupo: "Gastos" },
  { codigo: "gastos.eliminar", nombre: "Gastos", desc: "Eliminar gastos", grupo: "Gastos" },
  { codigo: "dashboard.ver", nombre: "Dashboard", desc: "Ver métricas del dashboard", grupo: "Dashboard" },
  { codigo: "comprobantes.imprimir", nombre: "Impresión", desc: "Imprimir comprobantes", grupo: "Impresión" },
];

export default function RolesAdmin({
  roles,
  onUpdatePermisos,
  onCrearRol,
  onActualizarRol,
  onEliminarRol,
}: Props) {
  const { user } = useAuth();
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [selectedRolId, setSelectedRolId] = useState<string | null>(null);

  // States for Role CRUD Modals / Dialogs
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [roleName, setRoleName] = useState("");
  const [editingRol, setEditingRol] = useState<{ id: string; nombre: string } | null>(null);
  const [deletingRol, setDeletingRol] = useState<{ id: string; nombre: string } | null>(null);
  const [crudError, setCrudError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Check if current user is admin
  const esUsuarioAdmin = String(user?.rol || "").toUpperCase().includes("ADMIN");

  // Determine active selected role
  const activeRolId = selectedRolId || roles[0]?.id;

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

  const getModulePrefix = (codigo: string) => codigo.split(".")[0];

  const getModuleColorClasses = (codigo: string) => {
    switch (getModulePrefix(codigo)) {
      case "ventas":
        return "peer-checked:bg-emerald-600";
      case "inventario":
        return "peer-checked:bg-blue-600";
      case "clientes":
        return "peer-checked:bg-cyan-600";
      case "reportes":
        return "peer-checked:bg-amber-500";
      case "usuarios":
      case "roles":
      case "sucursales":
        return "peer-checked:bg-rose-600";
      case "facturacion":
        return "peer-checked:bg-indigo-600";
      case "posventa":
        return "peer-checked:bg-teal-600";
      case "compras":
        return "peer-checked:bg-orange-500";
      case "cajas":
        return "peer-checked:bg-violet-600";
      case "proveedores":
        return "peer-checked:bg-lime-600";
      case "catalogos":
        return "peer-checked:bg-fuchsia-600";
      case "gastos":
        return "peer-checked:bg-red-500";
      case "dashboard":
        return "peer-checked:bg-sky-600";
      case "series":
        return "peer-checked:bg-pink-500";
      case "comprobantes":
        return "peer-checked:bg-slate-600";
      default:
        return "peer-checked:bg-purple-600";
    }
  };

  const getModuleDotColor = (codigo: string) => {
    switch (getModulePrefix(codigo)) {
      case "ventas":
        return "bg-emerald-500";
      case "inventario":
        return "bg-blue-500";
      case "clientes":
        return "bg-cyan-500";
      case "reportes":
        return "bg-amber-500";
      case "usuarios":
      case "roles":
      case "sucursales":
        return "bg-rose-500";
      case "facturacion":
        return "bg-indigo-500";
      case "posventa":
        return "bg-teal-500";
      case "compras":
        return "bg-orange-500";
      case "cajas":
        return "bg-violet-500";
      case "proveedores":
        return "bg-lime-500";
      case "catalogos":
        return "bg-fuchsia-500";
      case "gastos":
        return "bg-red-500";
      case "dashboard":
        return "bg-sky-500";
      case "series":
        return "bg-pink-500";
      case "comprobantes":
        return "bg-slate-500";
      default:
        return "bg-purple-500";
    }
  };

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

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCrearRol || !roleName.trim()) return;
    try {
      setProcessing(true);
      setCrudError(null);
      await onCrearRol(roleName.trim());
      setShowCreateModal(false);
      setRoleName("");
    } catch (err: any) {
      setCrudError(err.message || "Error al crear el rol");
    } finally {
      setProcessing(false);
    }
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onActualizarRol || !editingRol || !roleName.trim()) return;
    try {
      setProcessing(true);
      setCrudError(null);
      await onActualizarRol(editingRol.id, roleName.trim());
      setShowEditModal(false);
      setRoleName("");
      setEditingRol(null);
    } catch (err: any) {
      setCrudError(err.message || "Error al actualizar el rol");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!onEliminarRol || !deletingRol) return;
    try {
      setProcessing(true);
      setCrudError(null);
      await onEliminarRol(deletingRol.id);
      setShowDeleteConfirm(false);
      setDeletingRol(null);
      if (selectedRolId === deletingRol.id) {
        setSelectedRolId(null);
      }
    } catch (err: any) {
      setCrudError(err.message || "Error al eliminar el rol");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Roles Cards Grid Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Roles del Sistema</h2>
          <p className="text-xs text-slate-400">Selecciona un rol para ver detalles y gestionar permisos</p>
        </div>
        {esUsuarioAdmin && onCrearRol && (
          <button
            type="button"
            onClick={() => {
              setRoleName("");
              setCrudError(null);
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer animate-duration-200"
          >
            <Plus className="w-4 h-4" />
            Crear Nuevo Rol
          </button>
        )}
      </div>

      {/* Roles Cards Grid - stacked on mobile, grid on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((r) => {
          const isSelected = r.id === activeRolId;
          const isCoreRole = r.nombre.toUpperCase() === "ADMINISTRADOR";
          
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRolId(r.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between min-h-[140px]
                ${isSelected
                  ? "bg-emerald-50/40 border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
            >
              {/* Check indicator for active role */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white select-none">
                  <Check className="w-3 h-3 stroke-[3px]" />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                    ${isSelected ? "bg-emerald-100 text-emerald-600" : "bg-purple-50 text-purple-600"}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  {!isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 select-none">
                      Rol del Sistema
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                    {r.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.rol_permisos?.length || 0} permiso(s) asignado(s)
                  </p>
                </div>
              </div>

              {/* CRUD controls for roles inside the cards on hover (or persistent if selected/mobile) */}
              {esUsuarioAdmin && !isCoreRole && (
                <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-100 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    title="Editar nombre del rol"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRol({ id: r.id, nombre: r.nombre });
                      setRoleName(r.nombre);
                      setCrudError(null);
                      setShowEditModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Eliminar rol"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingRol({ id: r.id, nombre: r.nombre });
                      setCrudError(null);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Matriz de Permisos */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Matriz de Control de Acceso por Rol</h2>
              <p className="text-xs text-slate-400">Nivel de autorización por módulo del ERP</p>
            </div>
          </div>
          <div className="self-start sm:self-auto">
            {esUsuarioAdmin ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
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
                  {roles.map((r) => {
                    const isSelected = r.id === activeRolId;
                    return (
                      <th
                        key={r.id}
                        className={`py-3 px-4 text-center whitespace-nowrap min-w-[120px] transition-colors
                          ${isSelected ? "bg-emerald-50/50 text-emerald-800 font-extrabold" : "text-slate-500"}`}
                      >
                        {r.nombre}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const grouped: Record<string, typeof MODULOS_SISTEMA> = {};
                  for (const m of MODULOS_SISTEMA) {
                    if (!grouped[m.grupo]) grouped[m.grupo] = [];
                    grouped[m.grupo].push(m);
                  }
                  return Object.entries(grouped).map(([grupo, items]) => (
                    <React.Fragment key={grupo}>
                      <tr>
                        <td
                          colSpan={roles.length + 1}
                          className="py-2 px-4 bg-slate-50/80 border-b border-slate-200"
                        >
                          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                            {grupo}
                          </span>
                        </td>
                      </tr>
                      {items.map((m) => (
                        <tr key={m.codigo} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2.5 px-4 pl-8">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${getModuleDotColor(m.codigo)}`}></span>
                              <div>
                                <span className="font-medium text-slate-800 text-xs">{m.nombre}</span>
                                <span className="text-[10px] text-slate-400 ml-2">{m.desc}</span>
                              </div>
                            </div>
                          </td>
                          {roles.map((r) => {
                            const tienePermiso = r.rol_permisos?.some((rp) => rp.permisos?.codigo === m.codigo) || false;
                            const isUpdating = updatingRoleId === r.id;
                            const isSelectedRoleColumn = r.id === activeRolId;

                            return (
                              <td
                                key={r.id}
                                className={`py-2.5 px-4 text-center align-middle transition-colors
                                  ${isSelectedRoleColumn ? "bg-emerald-50/15" : ""}`}
                              >
                                <div className="flex justify-center items-center min-h-[36px]">
                                  {isUpdating ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                  ) : (
                                    <label className={`relative inline-flex items-center ${esUsuarioAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}>
                                      <input
                                        type="checkbox"
                                        checked={tienePermiso}
                                        disabled={!esUsuarioAdmin || isUpdating}
                                        onChange={(e) => handleToggle(r.id, m.codigo, e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className={`w-8 h-4.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all ${getModuleColorClasses(m.codigo)}`}></div>
                                    </label>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE ROLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Crear Nuevo Rol</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoleSubmit} className="mt-4 space-y-4">
              {crudError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
                  {crudError}
                </div>
              )}
              <div>
                <label htmlFor="create-role-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Rol
                </label>
                <input
                  id="create-role-name"
                  type="text"
                  required
                  placeholder="Ej. Farmacéutico, Almacenero, Cajero..."
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processing || !roleName.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {processing ? "Creando..." : "Crear Rol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {showEditModal && editingRol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Editar Rol: {editingRol.nombre}</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditRoleSubmit} className="mt-4 space-y-4">
              {crudError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
                  {crudError}
                </div>
              )}
              <div>
                <label htmlFor="edit-role-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nuevo Nombre del Rol
                </label>
                <input
                  id="edit-role-name"
                  type="text"
                  required
                  placeholder="Ej. Farmacéutico, Almacenero, Cajero..."
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processing || !roleName.trim() || roleName.trim() === editingRol.nombre}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {processing ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE ROLE CONFIRMATION MODAL */}
      {showDeleteConfirm && deletingRol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Eliminar Rol?</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {crudError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
                  {crudError}
                </div>
              )}
              <p className="text-xs text-slate-600 leading-relaxed">
                ¿Estás seguro de que deseas eliminar el rol <strong className="text-slate-900">"{deletingRol.nombre}"</strong>?
                Solo se podrá eliminar si no tiene usuarios activos asignados.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRoleConfirm}
                  disabled={processing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {processing ? "Eliminando..." : "Eliminar Rol"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
