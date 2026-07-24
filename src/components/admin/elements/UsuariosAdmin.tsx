import { useState } from "react";
import { Plus, Edit2, Trash2, Shield, CheckCircle2, XCircle, Search, RefreshCw, X, Save, Loader2 } from "lucide-react";
import type { UsuarioItem, RolItem } from "../hooks/useAdmin";


type Props = {
  usuarios: UsuarioItem[];
  roles: RolItem[];
  loading: boolean;
  onSaveUser: (data: Record<string, unknown>, isEdit: boolean, userId?: string) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onRefresh: () => void;
};

export default function UsuariosAdmin({
  usuarios,
  roles,
  loading,
  onSaveUser,
  onDeleteUser,
  onRefresh,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [userEdit, setUserEdit] = useState<UsuarioItem | null>(null);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState("");
  const [estado, setEstado] = useState("ACTIVO");

  const [saving, setSaving] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UsuarioItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreate = () => {
    setUserEdit(null);
    setNombre("");
    setCorreo("");
    setPassword("");
    setRolId(roles[0]?.id || "");
    setEstado("ACTIVO");
    setErrorForm(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (u: UsuarioItem) => {
    setUserEdit(u);
    setNombre(u.nombre);
    setCorreo(u.correo);
    setPassword("");
    setRolId(u.rol_id);
    setEstado(u.estado);
    setErrorForm(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm(null);

    if (!nombre.trim() || !correo.trim() || !rolId) {
      setErrorForm("Por favor completa los campos requeridos (*)");
      return;
    }
    if (!userEdit && (!password || password.length < 6)) {
      setErrorForm("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        rol_id: rolId,
        estado,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      await onSaveUser(payload, !!userEdit, userEdit?.id);
      setModalOpen(false);
    } catch (err: any) {
      setErrorForm(err.message || "Error al guardar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteUser(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || "Error al eliminar el usuario");
    } finally {
      setDeleting(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol_nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por Nombre, Correo o Rol..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-purple-600" : ""}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Tabla / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading && usuarios.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
            <span>Cargando usuarios del sistema...</span>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No se encontraron usuarios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.nombre}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.correo}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Shield className="w-3 h-3 text-purple-500" /> {u.rol_nombre}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.estado === "ACTIVO" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> INACTIVO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Usuario */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="font-bold text-sm">{userEdit ? "Editar Usuario" : "Nuevo Usuario"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {errorForm && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
                  {errorForm}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-600 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Pedro Gonzales"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@farmacia.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">
                  Contraseña {userEdit ? "(Dejar en blanco para no cambiar)" : "*"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Rol de Usuario *</label>
                <select
                  value={rolId}
                  onChange={(e) => setRolId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400 bg-white"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{userEdit ? "Guardar" : "Crear Usuario"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="font-bold text-slate-900 text-sm mb-1">¿Eliminar Usuario?</h3>
            <p className="text-xs text-slate-500 mb-4">Se desactivará el acceso de <strong>{deleteTarget.nombre}</strong></p>
            <div className="flex justify-center gap-2 text-xs font-bold">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-slate-200 rounded-xl">Cancelar</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-4 py-2 bg-rose-600 text-white rounded-xl">
                {deleting ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
