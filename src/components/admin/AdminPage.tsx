import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings, Users, Shield, Store, Sparkles, Package, FileText, Stethoscope, Hash } from "lucide-react";
import { useAdmin } from "./hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import UsuariosAdmin from "./elements/UsuariosAdmin";
import RolesAdmin from "./elements/RolesAdmin";
import SucursalesAdmin from "./elements/SucursalesAdmin";
import CatalogosAdmin from "./elements/CatalogosAdmin";
import FacturacionAdmin from "./elements/FacturacionAdmin";
import DiagnosticosAdmin from "./elements/DiagnosticosAdmin";
import SeriesDocumentosAdmin from "./elements/SeriesDocumentosAdmin";

type AdminTab = "usuarios" | "roles" | "sucursales" | "catalogos" | "facturacion" | "diagnosticos" | "series-documentos";

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sucursalActual } = useAuth();

  const getInitialTab = (): AdminTab => {
    if (location.pathname.includes("roles")) return "roles";
    if (location.pathname.includes("sucursales")) return "sucursales";
    if (location.pathname.includes("catalogos")) return "catalogos";
    if (location.pathname.includes("facturacion")) return "facturacion";
    if (location.pathname.includes("diagnosticos")) return "diagnosticos";
    if (location.pathname.includes("series-documentos")) return "series-documentos";
    return "usuarios";
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialTab());

  const {
    usuarios,
    roles,
    sucursales,
    loading,
    error,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    crearSucursal,
    actualizarRolPermisos,
    refetch,
  } = useAdmin();

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    const paths: Record<AdminTab, string> = {
      usuarios: "/admin/usuarios",
      roles: "/admin/roles",
      sucursales: "/admin/sucursales",
      catalogos: "/admin/catalogos",
      facturacion: "/admin/facturacion",
      diagnosticos: "/admin/diagnosticos",
      "series-documentos": "/admin/series-documentos",
    };
    navigate(paths[tab]);
  };

  const handleSaveUser = async (data: Record<string, unknown>, isEdit: boolean, userId?: string) => {
    if (isEdit && userId) {
      await actualizarUsuario(userId, data);
    } else {
      await crearUsuario(data);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans text-slate-800 overflow-y-auto p-3 sm:p-6 space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20 shrink-0">
            <Settings className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Administración ERP</h1>
              <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-purple-200/60 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500" /> Seguridad & Cajas
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              Sede Activa: <span className="text-purple-700 font-bold">{sucursalActual?.nombre || "Matriz Centro"}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto flex-wrap gap-1">
          <button
            onClick={() => handleTabChange("usuarios")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "usuarios"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </button>
          <button
            onClick={() => handleTabChange("roles")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "roles"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Roles</span>
          </button>
          <button
            onClick={() => handleTabChange("sucursales")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "sucursales"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Sucursales</span>
          </button>
          <button
            onClick={() => handleTabChange("catalogos")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "catalogos"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Catálogos</span>
          </button>
          <button
            onClick={() => handleTabChange("facturacion")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "facturacion"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Facturación</span>
          </button>
          <button
            onClick={() => handleTabChange("diagnosticos")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "diagnosticos"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">Diagnóstico</span>
          </button>
          <button
            onClick={() => handleTabChange("series-documentos")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "series-documentos"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Hash className="w-4 h-4" />
            <span className="hidden sm:inline">Series</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center justify-between">
          <span>Error en administración: {error}</span>
          <button onClick={refetch} className="font-bold underline text-rose-800">Reintentar</button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "usuarios" && (
        <UsuariosAdmin
          usuarios={usuarios}
          roles={roles}
          sucursales={sucursales}
          loading={loading}
          onSaveUser={handleSaveUser}
          onDeleteUser={eliminarUsuario}
          onRefresh={refetch}
        />
      )}

      {activeTab === "roles" && (
        <RolesAdmin
          roles={roles}
          onUpdatePermisos={actualizarRolPermisos}
        />
      )}

      {activeTab === "sucursales" && (
        <SucursalesAdmin
          sucursales={sucursales}
          loading={loading}
          onSaveSucursal={crearSucursal}
          onRefresh={refetch}
        />
      )}

      {activeTab === "catalogos" && (
        <CatalogosAdmin />
      )}

      {activeTab === "facturacion" && (
        <FacturacionAdmin />
      )}

      {activeTab === "diagnosticos" && (
        <DiagnosticosAdmin />
      )}

      {activeTab === "series-documentos" && (
        <SeriesDocumentosAdmin />
      )}
    </div>
  );
}
