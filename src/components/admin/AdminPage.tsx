import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings, Users, Shield, Store, Sparkles } from "lucide-react";
import { useAdmin } from "./hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import UsuariosAdmin from "./elements/UsuariosAdmin";
import RolesAdmin from "./elements/RolesAdmin";
import SucursalesAdmin from "./elements/SucursalesAdmin";

type AdminTab = "usuarios" | "roles" | "sucursales";

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sucursalActual } = useAuth();

  const getInitialTab = (): AdminTab => {
    if (location.pathname.includes("roles")) return "roles";
    if (location.pathname.includes("sucursales")) return "sucursales";
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
    refetch,
  } = useAdmin();

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    if (tab === "roles") navigate("/admin/roles");
    else if (tab === "sucursales") navigate("/admin/sucursales");
    else navigate("/admin/usuarios");
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
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleTabChange("usuarios")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "usuarios"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios ({usuarios.length})</span>
          </button>
          <button
            onClick={() => handleTabChange("roles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "roles"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permisos</span>
          </button>
          <button
            onClick={() => handleTabChange("sucursales")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === "sucursales"
                ? "bg-white text-purple-700 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Store className="w-4 h-4" />
            <span>Sucursales ({sucursales.length})</span>
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
          loading={loading}
          onSaveUser={handleSaveUser}
          onDeleteUser={eliminarUsuario}
          onRefresh={refetch}
        />
      )}

      {activeTab === "roles" && (
        <RolesAdmin
          roles={roles}
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
    </div>
  );
}
