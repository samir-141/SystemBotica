// src/components/venta/elements/ClienteSelectorModal.tsx
import { useState, useEffect, useCallback } from "react";
import { X, Search, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { clientesService } from "../../../services/clientes.service";

export interface Cliente {
  id: string;
  tipo_documento: string;
  numero_documento: string;
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (cliente: Cliente) => void;
};

export default function ClienteSelectorModal({ open, onClose, onSelect }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [crearOpen, setCrearOpen] = useState(false);
  const [creando, setCreando] = useState(false);

  const [nuevoTipoDoc, setNuevoTipoDoc] = useState("DNI");
  const [nuevoNumero, setNuevoNumero] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");

  const buscarClientes = useCallback(async () => {
    if (!busqueda.trim()) {
      setClientes([]);
      return;
    }
    setLoading(true);
    try {
      const res = await clientesService.getClientes({ buscar: busqueda.trim(), limit: 10 });
      setClientes(res.data || []);
    } catch (err) {
      console.error("Error al buscar clientes:", err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [busqueda]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(buscarClientes, 300);
    return () => clearTimeout(timer);
  }, [open, busqueda, buscarClientes]);

  const handleSelect = (cliente: Cliente) => {
    onSelect(cliente);
    onClose();
  };

  const handleConsultarPadronRapido = async () => {
    if (!nuevoNumero.trim()) return;
    const esValido = (nuevoTipoDoc === "DNI" && nuevoNumero.length === 8) || (nuevoTipoDoc === "RUC" && nuevoNumero.length === 11);
    if (!esValido) return;

    try {
      const res = await clientesService.consultarDocumentoPadron(nuevoTipoDoc, nuevoNumero);
      if (res.encontrado && res.nombre) {
        setNuevoNombre(res.nombre);
      }
    } catch (err) {
      console.error("Error en consulta de padrón rápido:", err);
    }
  };

  const handleCrear = async () => {
    if (!nuevoNumero.trim() || !nuevoNombre.trim()) return;
    setCreando(true);
    try {
      const payload: any = {
        tipo_documento: nuevoTipoDoc,
        numero_documento: nuevoNumero.trim(),
        nombre: nuevoNombre.trim(),
        tipo_cliente: nuevoTipoDoc === "RUC" ? "JURIDICO" : "NATURAL",
      };
      await clientesService.crearCliente(payload);
      setCrearOpen(false);
      setNuevoNumero("");
      setNuevoNombre("");
      await buscarClientes();
    } catch (err: any) {
      console.error("Error al crear cliente:", err);
    } finally {
      setCreando(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn"
      >
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <h2 className="font-bold text-sm">Seleccionar Cliente</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, DNI o RUC..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white
                focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400
                placeholder:text-slate-300 transition"
            />
          </div>

          {crearOpen ? (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nuevo Cliente</h3>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={nuevoTipoDoc}
                  onChange={(e) => setNuevoTipoDoc(e.target.value)}
                  className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carnet Extranjería</option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
                <input
                  type="text"
                  value={nuevoNumero}
                  onChange={(e) => setNuevoNumero(e.target.value.replace(/\D/g, ""))}
                  onBlur={handleConsultarPadronRapido}
                  placeholder="Número de documento"
                  maxLength={11}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
                />
              </div>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nombre o Razón Social"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCrearOpen(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCrear}
                  disabled={creando || !nuevoNumero.trim() || !nuevoNombre.trim()}
                  className="flex-1 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  {creando ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "Guardar"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCrearOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-teal-400 hover:text-teal-700 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-xs font-bold">Crear Cliente</span>
              </button>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {loading && (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> Buscando...
                  </div>
                )}
                {!loading && clientes.length === 0 && busqueda.trim() && (
                  <p className="py-4 text-center text-xs text-slate-400">Sin resultados</p>
                )}
                {!loading && clientes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-800">{c.nombre}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {c.tipo_documento}: {c.numero_documento}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
