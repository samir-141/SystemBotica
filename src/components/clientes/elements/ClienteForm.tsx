import { useState, useEffect } from "react";
import { X, Save, Loader2, User, Hash, CheckCircle2 } from "lucide-react";
import type { Cliente, ClienteFormData, FormMode, TipoDocumento, TipoCliente, CondicionContribuyente } from "../types";

type Props = {
  open: boolean;
  mode: FormMode;
  cliente: Cliente | null;
  onClose: () => void;
  onSave: (data: Record<string, unknown>, mode: FormMode) => Promise<void>;
};

const EMPTY_FORM: ClienteFormData = {
  tipo_documento: "DNI",
  numero_documento: "",
  nombre: "",
  direccion: "",
  telefono: "",
  email: "",
  tipo_cliente: "NATURAL",
  condicion_contribuyente: "HABIDO",
  estado_sunat: "ACTIVO",
  estado: "ACTIVO",
  limite_credito: 0,
  dias_credito: 0,
  saldo_actual: 0,
  estado_credito: "AL CORRIENTE",
  whatsapp: "",
  contacto_principal: "",
  cargo_contacto: "",
  representante_legal: "",
  dni_representante: "",
  fecha_nacimiento: "",
  observaciones: "",
  origen: "POS",
};

export default function ClienteForm({
  open,
  mode,
  cliente,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<ClienteFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultandoPadron, setConsultandoPadron] = useState(false);
  const [origenBadge, setOrigenBadge] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<"general" | "b2b" | "credito">("general");

  const isEdit = mode === "editar";

  useEffect(() => {
    if (!open) return;
    setError(null);
    setOrigenBadge(null);
    setTabActiva("general");

    if (isEdit && cliente) {
      setForm({
        tipo_documento: cliente.tipo_documento || "DNI",
        numero_documento: cliente.numero_documento || "",
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        telefono: cliente.telefono || "",
        email: cliente.email || "",
        tipo_cliente: cliente.tipo_cliente || "NATURAL",
        condicion_contribuyente: cliente.condicion_contribuyente || "HABIDO",
        estado_sunat: cliente.estado_sunat || "ACTIVO",
        estado: cliente.estado || "ACTIVO",
        limite_credito: cliente.limite_credito || 0,
        dias_credito: cliente.dias_credito || 0,
        saldo_actual: cliente.saldo_actual || 0,
        estado_credito: cliente.estado_credito || "AL CORRIENTE",
        whatsapp: cliente.whatsapp || "",
        contacto_principal: cliente.contacto_principal || "",
        cargo_contacto: cliente.cargo_contacto || "",
        representante_legal: cliente.representante_legal || "",
        dni_representante: cliente.dni_representante || "",
        fecha_nacimiento: cliente.fecha_nacimiento ? cliente.fecha_nacimiento.slice(0, 10) : "",
        observaciones: cliente.observaciones || "",
        origen: cliente.origen || "POS",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, isEdit, cliente]);

  const handleConsultarPadron = async (numeroDoc: string, tipoDocOverride?: TipoDocumento) => {
    const tipoDoc = tipoDocOverride || form.tipo_documento;
    const esValido = (tipoDoc === "DNI" && numeroDoc.length === 8) || (tipoDoc === "RUC" && numeroDoc.length === 11);
    if (!numeroDoc || !esValido) return;

    setConsultandoPadron(true);
    setOrigenBadge(null);

    try {
      const { posApi } = await import("../../api/api.data");
      const res = await posApi.consultarDocumentoPadron(tipoDoc, numeroDoc);
      if (res.encontrado && res.nombre) {
        setForm((prev) => ({
          ...prev,
          tipo_documento: tipoDoc,
          numero_documento: numeroDoc,
          nombre: res.nombre,
          direccion: res.direccion || prev.direccion,
          telefono: res.telefono || prev.telefono,
          email: res.email || prev.email,
          tipo_cliente: res.tipo_cliente || (tipoDoc === "RUC" ? "JURIDICO" : "NATURAL"),
          condicion_contribuyente: res.condicion_contribuyente || "HABIDO",
        }));
        setOrigenBadge(res.origen);
      }
    } catch (err) {
      console.error("Error al consultar padrón:", err);
    } finally {
      setConsultandoPadron(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.numero_documento.trim()) {
      setError("El número de documento es obligatorio.");
      return;
    }
    if (form.tipo_documento === "DNI" && form.numero_documento.length !== 8) {
      setError("El DNI debe contener exactamente 8 dígitos.");
      return;
    }
    if (form.tipo_documento === "RUC" && form.numero_documento.length !== 11) {
      setError("El RUC debe contener exactamente 11 dígitos.");
      return;
    }
    if (!form.nombre.trim()) {
      setError("El nombre o razón social es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await onSave(form as any, mode);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al guardar los datos del cliente");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm">
                {isEdit ? "Editar Cliente" : "Nuevo Cliente POS"}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {isEdit ? `Modificando ID: ${cliente?.id.slice(0, 8)}...` : "Registro comercial & crediticio del cliente"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs de Secciones */}
        <div className="bg-slate-100 px-5 pt-3 pb-0 border-b border-slate-200 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTabActiva("general")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
              tabActiva === "general"
                ? "bg-white border-teal-600 text-teal-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            1. Datos & SUNAT
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("b2b")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
              tabActiva === "b2b"
                ? "bg-white border-teal-600 text-teal-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            2. Datos B2B / Empresa
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("credito")}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition ${
              tabActiva === "credito"
                ? "bg-white border-teal-600 text-teal-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            3. Crédito & Cobranza
          </button>
        </div>

        {/* Formulario Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* TAB 1: DATOS GENERALES & SUNAT */}
          {tabActiva === "general" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Tipo y Número de Documento */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Tipo Doc *
                  </label>
                  <select
                    value={form.tipo_documento}
                    onChange={(e) => {
                      const newTipo = e.target.value as TipoDocumento;
                      setForm((prev) => ({
                        ...prev,
                        tipo_documento: newTipo,
                        tipo_cliente: newTipo === "RUC" ? "JURIDICO" : "NATURAL",
                      }));
                      handleConsultarPadron(form.numero_documento, newTipo);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="DNI">DNI (8 d.)</option>
                    <option value="RUC">RUC (11 d.)</option>
                    <option value="CE">CE</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    N° Documento *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.numero_documento}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((prev) => ({ ...prev, numero_documento: val }));
                        handleConsultarPadron(val);
                      }}
                      placeholder="Ingrese DNI o RUC..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    {consultandoPadron && (
                      <Loader2 className="w-4 h-4 text-teal-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
              </div>

              {origenBadge && (
                <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-[11px] text-teal-800 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Datos validados automáticamente vía {origenBadge}</span>
                </div>
              )}

              {/* Nombre / Razón Social */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Nombre Completo / Razón Social *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="ej. Botica San Rafael S.A.C."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              {/* Clasificación & Condición SUNAT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Tipo de Cliente
                  </label>
                  <select
                    value={form.tipo_cliente}
                    onChange={(e) => setForm((prev) => ({ ...prev, tipo_cliente: e.target.value as TipoCliente }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="NATURAL">Persona Natural</option>
                    <option value="JURIDICO">Empresa (Jurídico)</option>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINICA">Clínica</option>
                    <option value="DROGUERIA">Droguería</option>
                    <option value="BOTICA">Botica / Farmacia</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Condición SUNAT
                  </label>
                  <select
                    value={form.condicion_contribuyente}
                    onChange={(e) => setForm((prev) => ({ ...prev, condicion_contribuyente: e.target.value as CondicionContribuyente }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="HABIDO">✅ HABIDO</option>
                    <option value="NO HABIDO">⚠️ NO HABIDO</option>
                    <option value="SUSPENDED">🚫 SUSPENDIDO</option>
                    <option value="ANULADO">❌ ANULADO</option>
                  </select>
                </div>
              </div>

              {/* Teléfono & WhatsApp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Teléfono Fijo / Celular
                  </label>
                  <input
                    type="text"
                    value={form.telefono || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
                    placeholder="987654321"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    WhatsApp Directo
                  </label>
                  <input
                    type="text"
                    value={form.whatsapp || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="987654321"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Email & Dirección */}
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="contacto@cliente.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Dirección Fiscal / Entrega
                </label>
                <textarea
                  rows={2}
                  value={form.direccion || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Av. Principal 123, Lima..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DATOS B2B & REPRESENTANTE */}
          {tabActiva === "b2b" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Información Corporativa & Contactos B2B</span>
                <p className="text-[11px] text-slate-500">Útil para hospitales, clínicas, droguerías y clientes empresariales.</p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Representante Legal
                </label>
                <input
                  type="text"
                  value={form.representante_legal || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, representante_legal: e.target.value }))}
                  placeholder="Nombre del apoderado o gerente"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  DNI del Representante Legal
                </label>
                <input
                  type="text"
                  value={form.dni_representante || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, dni_representante: e.target.value }))}
                  placeholder="8 dígitos"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Contacto Principal
                  </label>
                  <input
                    type="text"
                    value={form.contacto_principal || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, contacto_principal: e.target.value }))}
                    placeholder="ej. Lic. Maria Perez"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Cargo del Contacto
                  </label>
                  <input
                    type="text"
                    value={form.cargo_contacto || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, cargo_contacto: e.target.value }))}
                    placeholder="ej. Jefa de Compras"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Observaciones / Notas Internas
                </label>
                <textarea
                  rows={3}
                  value={form.observaciones || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Comentarios adicionales sobre el cliente o restricciones de venta..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CRÉDITO & COBRANZA */}
          {tabActiva === "credito" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <span className="font-bold block mb-0.5">Control de Línea de Crédito & Finanzas</span>
                <p className="text-[11px] opacity-90">Permite configurar límites de endeudamiento y días de crédito.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Límite de Crédito (S/)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.limite_credito}
                    onChange={(e) => setForm((prev) => ({ ...prev, limite_credito: e.target.value === "" ? "" : Number(e.target.value) }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Días de Plazo de Crédito
                  </label>
                  <input
                    type="number"
                    value={form.dias_credito}
                    onChange={(e) => setForm((prev) => ({ ...prev, dias_credito: e.target.value === "" ? "" : Number(e.target.value) }))}
                    placeholder="ej. 30"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Estado Crediticio
                  </label>
                  <select
                    value={form.estado_credito}
                    onChange={(e) => setForm((prev) => ({ ...prev, estado_credito: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value="AL CORRIENTE">🟢 AL CORRIENTE</option>
                    <option value="MOROSO">🔴 MOROSO</option>
                    <option value="BLOQUEADO">🚫 BLOQUEADO</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Estado de Cuenta ERP
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="BLOQUEADO">BLOQUEADO</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Cliente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
