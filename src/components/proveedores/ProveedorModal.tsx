import { useState, useEffect } from "react";
import { Building2, X, Loader2 } from "lucide-react";
import { proveedoresService } from "../../services/proveedores.service";
import { clientesService } from "../../services/clientes.service";
import type { ProveedorDto } from "../../types/api.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (proveedor: ProveedorDto) => void;
}

export default function ProveedorModal({ open, onClose, onCreated }: Props) {
  const [ruc, setRuc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [saving, setSaving] = useState(false);
  const [consultandoRuc, setConsultandoRuc] = useState(false);
  const [origenBadge, setOrigenBadge] = useState<string | null>(null);
  const [existeLocal, setExisteLocal] = useState(false);

  useEffect(() => {
    if (open) {
      setRuc("");
      setRazonSocial("");
      setDireccion("");
      setTelefono("");
      setEmail("");
      setError("");
      setWarning("");
      setOrigenBadge(null);
      setExisteLocal(false);
    }
  }, [open]);

  if (!open) return null;

  const handleConsultarRuc = async (numeroRuc: string) => {
    if (!numeroRuc || numeroRuc.length !== 11) return;

    setConsultandoRuc(true);
    setOrigenBadge(null);
    setExisteLocal(false);
    setError("");
    setWarning("");

    try {
      // 1. Verificar registro local primero
      const searchRes = await proveedoresService.getProveedores({
        page: 1,
        limit: 10,
        buscar: numeroRuc,
      });
      const localMatch = searchRes.data.find((p) => p.ruc === numeroRuc);

      if (localMatch) {
        setRazonSocial(localMatch.razon_social);
        setDireccion(localMatch.direccion || "");
        setTelefono(localMatch.telefono || "");
        setEmail(localMatch.email || "");
        setExisteLocal(true);
        setWarning("Este proveedor ya está registrado en el sistema.");
        return;
      }

      // 2. Si no existe local, consultar padrón SUNAT
      const res = await clientesService.consultarDocumentoPadron("RUC", numeroRuc);
      if (res.encontrado && res.nombre) {
        setRazonSocial(res.nombre);
        if (res.direccion) {
          setDireccion(res.direccion);
        }
        setOrigenBadge(res.origen);

        // Validar si el nombre ya existe registrado bajo otro RUC
        const nameSearch = await proveedoresService.getProveedores({
          page: 1,
          limit: 10,
          buscar: res.nombre,
        });
        const nameMatch = nameSearch.data.find(
          (p) => p.razon_social.toUpperCase() === res.nombre.toUpperCase()
        );
        if (nameMatch) {
          setWarning(
            `Aviso: Ya existe un proveedor registrado con la razón social "${res.nombre}" (RUC: ${nameMatch.ruc}).`
          );
        }
      } else {
        setError("No se encontraron datos para el RUC ingresado.");
      }
    } catch (err) {
      console.error("Error al consultar RUC:", err);
      setError("No se pudo obtener la información del RUC.");
    } finally {
      setConsultandoRuc(false);
    }
  };

  const handleBlurRazonSocial = async () => {
    if (!razonSocial.trim() || existeLocal) return;
    try {
      const nameSearch = await proveedoresService.getProveedores({
        page: 1,
        limit: 10,
        buscar: razonSocial.trim(),
      });
      const nameMatch = nameSearch.data.find(
        (p) =>
          p.razon_social.toUpperCase() === razonSocial.trim().toUpperCase() &&
          p.ruc !== ruc
      );
      if (nameMatch) {
        setWarning(
          `Aviso: Ya existe un proveedor registrado con la razón social "${razonSocial.trim()}" (RUC: ${nameMatch.ruc}).`
        );
      } else {
        setWarning("");
      }
    } catch (err) {
      console.error("Error al validar razón social:", err);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{11}$/.test(ruc) || !razonSocial.trim()) {
      setError("Ingrese un RUC de 11 dígitos y la razón social.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const creado = await proveedoresService.crearProveedor({
        ruc,
        razon_social: razonSocial.trim(),
        direccion: direccion.trim() || undefined,
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
      });
      onCreated(creado);
      onClose();
    } catch (cause) {
      setError(
        (cause as { message?: string })?.message ||
          "No se pudo crear el proveedor.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="proveedor-title"
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between bg-emerald-950 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <Building2 className="text-amber-300" />
            <div>
              <h2 id="proveedor-title" className="font-black">
                Nuevo proveedor
              </h2>
              <p className="text-xs text-emerald-100">
                Se asociará a la botica actual
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X />
          </button>
        </header>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {/* RUC Input with Search Button */}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              RUC *
            </label>
            <div className="relative flex items-center">
              <input
                value={ruc}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setRuc(val);
                  setOrigenBadge(null);
                  setExisteLocal(false);
                  setWarning("");
                  if (val.length === 11) {
                    handleConsultarRuc(val);
                  }
                }}
                inputMode="numeric"
                className="w-full rounded-xl border border-slate-200 pl-3 pr-24 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono tracking-wider"
                placeholder="Ej: 20123456789"
              />
              <button
                type="button"
                disabled={consultandoRuc || !ruc}
                onClick={() => handleConsultarRuc(ruc)}
                className="absolute right-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-lg transition active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                {consultandoRuc ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Buscar</span>
                )}
              </button>
            </div>
            {origenBadge && (
              <p className="mt-1 text-[11px] text-teal-600 font-semibold flex items-center gap-1">
                <span>✓ Datos validados automáticamente vía {origenBadge}</span>
              </p>
            )}
            {existeLocal && (
              <p className="mt-1 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>✓ Datos cargados del registro local de proveedores</span>
              </p>
            )}
          </div>

          {/* Razón Social */}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Razón social *
            </label>
            <input
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              onBlur={handleBlurRazonSocial}
              disabled={existeLocal}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="Nombre o razón social del proveedor"
            />
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Dirección
            </label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              disabled={existeLocal}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="Dirección del proveedor"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Teléfono
            </label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={existeLocal}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="Ej: 987654321"
            />
          </div>

          {/* Correo */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Correo
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={existeLocal}
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-slate-100"
              placeholder="correo@proveedor.com"
            />
          </div>

          {warning && (
            <p
              className="sm:col-span-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800 border border-amber-200"
              role="alert"
            >
              {warning}
            </p>
          )}

          {error && (
            <p
              className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-sm font-bold"
          >
            Cancelar
          </button>
          <button
            disabled={saving || existeLocal}
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-emerald-950 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Crear proveedor"}
          </button>
        </footer>
      </form>
    </div>
  );
}
