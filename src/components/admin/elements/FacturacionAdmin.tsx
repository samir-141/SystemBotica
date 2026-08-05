// src/components/admin/elements/FacturacionAdmin.tsx
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Save,
  Upload,
  PlugZap,
  ShieldCheck,
} from "lucide-react";
import { Toast } from "primereact/toast";
import {
  facturacionService,
  type ConfiguracionTributaria,
} from "../../../services/facturacion.service";

const REGIMENES = [
  { value: "GENERAL", label: "Régimen General", permite: "Facturas, boletas y notas" },
  { value: "MYPE", label: "Régimen MYPE Tributario", permite: "Facturas, boletas y notas" },
  { value: "RER", label: "Régimen Especial de Renta (RER)", permite: "Facturas, boletas y notas" },
  { value: "NUEVO_RUS", label: "Nuevo RUS", permite: "Solo boletas de venta" },
];

const estadoInicial = {
  ruc: "",
  razonSocial: "",
  nombreComercial: "",
  ubigeo: "",
  departamento: "",
  provincia: "",
  distrito: "",
  direccionFiscal: "",
  regimenTributario: "GENERAL",
  ambiente: "BETA",
  emisorElectronico: true,
  solUsuario: "",
  solClave: "",
};

export default function FacturacionAdmin() {
  const toast = useRef<Toast>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [probando, setProbando] = useState(false);
  const [subiendoCert, setSubiendoCert] = useState(false);
  const [config, setConfig] = useState<ConfiguracionTributaria | null>(null);
  const [form, setForm] = useState(estadoInicial);
  const [certificado, setCertificado] = useState<File | null>(null);
  const [certificadoClave, setCertificadoClave] = useState("");
  const [prueba, setPrueba] = useState<{ listo: boolean; faltantes: string[] } | null>(null);

  useEffect(() => {
    void cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const actual = await facturacionService.obtenerConfiguracion();
      setConfig(actual);
      if (actual) {
        setForm({
          ruc: actual.ruc,
          razonSocial: actual.razon_social,
          nombreComercial: actual.nombre_comercial ?? "",
          ubigeo: actual.ubigeo ?? "",
          departamento: actual.departamento ?? "",
          provincia: actual.provincia ?? "",
          distrito: actual.distrito ?? "",
          direccionFiscal: actual.direccion_fiscal,
          regimenTributario: actual.regimen_tributario,
          ambiente: actual.ambiente,
          emisorElectronico: actual.emisor_electronico,
          solUsuario: "",
          solClave: "",
        });
      }
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err.message, life: 4000 });
    } finally {
      setCargando(false);
    }
  };

  const set = (campo: keyof typeof estadoInicial, valor: string | boolean) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const guardar = async () => {
    setGuardando(true);
    try {
      const payload: Record<string, unknown> = {
        ruc: form.ruc.trim(),
        razonSocial: form.razonSocial.trim(),
        nombreComercial: form.nombreComercial.trim() || undefined,
        ubigeo: form.ubigeo.trim() || undefined,
        departamento: form.departamento.trim() || undefined,
        provincia: form.provincia.trim() || undefined,
        distrito: form.distrito.trim() || undefined,
        direccionFiscal: form.direccionFiscal.trim(),
        regimenTributario: form.regimenTributario,
        ambiente: form.ambiente,
        emisorElectronico: form.emisorElectronico,
      };
      // Solo se envían credenciales si el usuario escribió nuevas
      if (form.solUsuario.trim()) payload.solUsuario = form.solUsuario.trim();
      if (form.solClave) payload.solClave = form.solClave;

      const guardada = config
        ? await facturacionService.actualizarConfiguracion(payload as never)
        : await facturacionService.guardarConfiguracion(payload as never);
      setConfig(guardada);
      setForm((prev) => ({ ...prev, solUsuario: "", solClave: "" }));
      toast.current?.show({ severity: "success", summary: "Guardado", detail: "Configuración tributaria actualizada", life: 3000 });
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err.message, life: 5000 });
    } finally {
      setGuardando(false);
    }
  };

  const subirCertificado = async () => {
    if (!certificado || !certificadoClave) {
      toast.current?.show({ severity: "warn", summary: "Certificado", detail: "Seleccione el archivo y escriba su contraseña", life: 3000 });
      return;
    }
    setSubiendoCert(true);
    try {
      const actualizada = await facturacionService.subirCertificado(certificado, certificadoClave);
      setConfig(actualizada);
      setCertificado(null);
      setCertificadoClave("");
      toast.current?.show({ severity: "success", summary: "Certificado", detail: "Certificado registrado correctamente", life: 3000 });
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Certificado", detail: err.message, life: 5000 });
    } finally {
      setSubiendoCert(false);
    }
  };

  const probarConexion = async () => {
    setProbando(true);
    setPrueba(null);
    try {
      setPrueba(await facturacionService.probarConexion());
    } catch (err: any) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err.message, life: 4000 });
    } finally {
      setProbando(false);
    }
  };

  if (cargando) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 text-slate-500 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" /> Cargando configuración tributaria...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Toast ref={toast} />

      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Facturación Electrónica SUNAT</h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Datos del emisor, credenciales SOL y certificado digital
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${form.ambiente === "BETA" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            Ambiente: {form.ambiente}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Campo label="RUC *" value={form.ruc} onChange={(v) => set("ruc", v)} maxLength={11} placeholder="20123456789" />
          <Campo label="Razón social *" value={form.razonSocial} onChange={(v) => set("razonSocial", v)} />
          <Campo label="Nombre comercial" value={form.nombreComercial} onChange={(v) => set("nombreComercial", v)} />
          <Campo label="Ubigeo (6 dígitos)" value={form.ubigeo} onChange={(v) => set("ubigeo", v)} maxLength={6} placeholder="150101" />
          <Campo label="Departamento" value={form.departamento} onChange={(v) => set("departamento", v)} />
          <Campo label="Provincia" value={form.provincia} onChange={(v) => set("provincia", v)} />
          <Campo label="Distrito" value={form.distrito} onChange={(v) => set("distrito", v)} />
          <div className="sm:col-span-2">
            <Campo label="Dirección fiscal *" value={form.direccionFiscal} onChange={(v) => set("direccionFiscal", v)} />
          </div>
          <label className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Régimen tributario</span>
            <select
              value={form.regimenTributario}
              onChange={(e) => set("regimenTributario", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {REGIMENES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 font-medium">
              Puede emitir: {REGIMENES.find((r) => r.value === form.regimenTributario)?.permite}
            </span>
          </label>
          <label className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Ambiente SUNAT</span>
            <select
              value={form.ambiente}
              onChange={(e) => set("ambiente", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="BETA">BETA (pruebas)</option>
              <option value="PRODUCCION">PRODUCCIÓN</option>
            </select>
          </label>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Credenciales SOL
            {config?.tiene_credenciales_sol && (
              <span className="text-emerald-600 normal-case">(registradas — deje en blanco para conservar)</span>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Campo label="Usuario SOL (p. ej. MODDATOS)" value={form.solUsuario} onChange={(v) => set("solUsuario", v)} />
            <Campo label="Clave SOL" type="password" value={form.solClave} onChange={(v) => set("solClave", v)} />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer disabled:bg-slate-300"
          >
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {config ? "Guardar cambios" : "Crear configuración"}
          </button>
          <button
            onClick={probarConexion}
            disabled={probando || !config}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {probando ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" />}
            Verificar configuración
          </button>
        </div>

        {prueba && (
          <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${prueba.listo ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
            {prueba.listo ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {prueba.listo
              ? "Configuración completa: lista para emitir comprobantes."
              : `Faltan: ${prueba.faltantes.join(", ")}`}
          </div>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-slate-900">Certificado digital</h3>
        {config?.certificado_nombre && (
          <p className="text-xs text-slate-500">
            Actual: <span className="font-bold">{config.certificado_nombre}</span>
            {config.certificado_fecha_vencimiento && (
              <> — vence el {new Date(config.certificado_fecha_vencimiento).toLocaleDateString("es-PE")}</>
            )}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <label className="space-y-1 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Archivo .pfx / .p12</span>
            <input
              type="file"
              accept=".pfx,.p12"
              onChange={(e) => setCertificado(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-bold file:text-xs file:cursor-pointer"
            />
          </label>
          <Campo label="Contraseña del certificado" type="password" value={certificadoClave} onChange={setCertificadoClave} />
          <button
            onClick={subirCertificado}
            disabled={subiendoCert || !config}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {subiendoCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Subir certificado
          </button>
        </div>
        {!config && (
          <p className="text-[11px] text-amber-600 font-medium">
            Primero guarde la configuración tributaria para poder registrar el certificado.
          </p>
        )}
        <p className="text-[10px] text-slate-400">
          El certificado y las credenciales se almacenan cifrados en el servidor y nunca se muestran completos.
        </p>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}
