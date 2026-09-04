import { useEffect, useRef, useState, useCallback } from "react";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Search,
  ShieldCheck,
  FileText,
  Loader2,
  X,
  Save,
  Info,
  Server,
  Lock,
} from "lucide-react";
import { Toast } from "primereact/toast";
import {
  perfilesTributariosService,
  type PerfilTributario,
  type CreatePerfilTributarioPayload,
} from "../../../services/perfiles-tributarios.service";
import { useEmisorStore } from "../../../store/emisorStore";

const REGIMENES = [
  {
    value: "NRUS",
    label: "Nuevo RUS (NRUS)",
    desc: "Solo Boletas de Venta y Tickets. No permite Facturas.",
    permiteFactura: false,
    color: "bg-amber-100 text-amber-900 border-amber-300",
  },
  {
    value: "RER",
    label: "Régimen Especial (RER)",
    desc: "Facturas, Boletas y Notas de Crédito/Débito.",
    permiteFactura: true,
    color: "bg-blue-100 text-blue-900 border-blue-300",
  },
  {
    value: "RMT",
    label: "Régimen MYPE Tributario (RMT)",
    desc: "Facturas, Boletas y Notas de Crédito/Débito.",
    permiteFactura: true,
    color: "bg-indigo-100 text-indigo-900 border-indigo-300",
  },
  {
    value: "GENERAL",
    label: "Régimen General",
    desc: "Facturas, Boletas y Notas de Crédito/Débito.",
    permiteFactura: true,
    color: "bg-purple-100 text-purple-900 border-purple-300",
  },
  {
    value: "OTRO",
    label: "Otro Régimen",
    desc: "Configuración personalizada.",
    permiteFactura: false,
    color: "bg-slate-100 text-slate-900 border-slate-300",
  },
];

const SISTEMAS_EMISION = [
  { value: "SEE_CONTRIBUYENTE", label: "SEE desde los Sistemas del Contribuyente", reqCert: true },
  { value: "SEE_CF", label: "SEE Consumidor Final / Ticket POS", reqCert: false },
  { value: "SEE_SOL", label: "SEE - Clave SOL (Portal SUNAT)", reqCert: false },
  { value: "PSE", label: "Proveedor de Servicios Electrónicos (PSE)", reqCert: false },
  { value: "OSE", label: "Operador de Servicios Electrónicos (OSE)", reqCert: true },
  { value: "MANUAL", label: "Comprobantes Físicos / Manual", reqCert: false },
];

const formInicial: CreatePerfilTributarioPayload = {
  ruc: "",
  razon_social: "",
  nombre_comercial: "",
  tipo_contribuyente: "PERSONA_NATURAL",
  regimen_tributario: "NRUS",
  direccion_fiscal: "",
  ubigeo: "",
  departamento: "",
  provincia: "",
  distrito: "",
  telefono: "",
  email: "",
  es_principal: false,
  activo: true,
  configuracion_emision: {
    sistema_emision: "SEE_CF",
    proveedor_tipo: "SUNAT_DIRECTO",
    ambiente: "BETA",
    sol_usuario: "",
    sol_clave: "",
  },
};

export default function FacturacionAdmin() {
  const toast = useRef<Toast>(null);
  const { cargarPerfiles } = useEmisorStore();
  const [perfiles, setPerfiles] = useState<PerfilTributario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePerfilTributarioPayload>(formInicial);
  const [guardando, setGuardando] = useState(false);
  const [consultandoRuc, setConsultandoRuc] = useState(false);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certPerfilId, setCertPerfilId] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certClave, setCertClave] = useState("");
  const [subiendoCert, setSubiendoCert] = useState(false);
  const [verificandoId, setVerificandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await perfilesTributariosService.listar();
      setPerfiles(data);
      await cargarPerfiles(true);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err?.response?.data?.message || err?.message || "Error al cargar perfiles",
        life: 4000,
      });
    } finally {
      setCargando(false);
    }
  }, [cargarPerfiles]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleConsultarRuc = async () => {
    const rucLimpio = form.ruc.trim();
    if (rucLimpio.length !== 11) {
      toast.current?.show({
        severity: "warn",
        summary: "RUC Inválido",
        detail: "El RUC debe tener exactamente 11 dígitos numéricos.",
        life: 3000,
      });
      return;
    }

    setConsultandoRuc(true);
    try {
      const datos = await perfilesTributariosService.consultarRuc(rucLimpio);
      setForm((prev) => ({
        ...prev,
        razon_social: datos.razonSocial || prev.razon_social,
        nombre_comercial: datos.nombreComercial || prev.nombre_comercial,
        tipo_contribuyente:
          datos.tipoContribuyente ||
          (rucLimpio.startsWith("20") ? "PERSONA_JURIDICA" : "PERSONA_NATURAL"),
        direccion_fiscal: datos.direccion || prev.direccion_fiscal,
        ubigeo: datos.ubigeo || prev.ubigeo,
        departamento: datos.departamento || prev.departamento,
        provincia: datos.provincia || prev.provincia,
        distrito: datos.distrito || prev.distrito,
        estado_sunat: datos.estado || "ACTIVO",
        condicion_sunat: datos.condicion || "HABIDO",
      }));
      toast.current?.show({
        severity: "success",
        summary: "Datos obtenidos",
        detail: `RUC ${rucLimpio} verificado: ${datos.razonSocial}`,
        life: 3000,
      });
    } catch {
      toast.current?.show({
        severity: "info",
        summary: "Consulta manual",
        detail: "No se pudo consultar automáticamente. Puedes completar los datos manualmente.",
        life: 4000,
      });
    } finally {
      setConsultandoRuc(false);
    }
  };

  const handleAbrirCrear = () => {
    setEditId(null);
    setForm(formInicial);
    setModalOpen(true);
  };

  const handleAbrirEditar = (p: PerfilTributario) => {
    setEditId(p.id);
    setForm({
      ruc: p.ruc,
      razon_social: p.razon_social,
      nombre_comercial: p.nombre_comercial || "",
      tipo_contribuyente: p.tipo_contribuyente,
      regimen_tributario: p.regimen_tributario,
      direccion_fiscal: p.direccion_fiscal,
      ubigeo: p.ubigeo || "",
      departamento: p.departamento || "",
      provincia: p.provincia || "",
      distrito: p.distrito || "",
      telefono: p.telefono || "",
      email: p.email || "",
      es_principal: p.es_principal,
      activo: p.activo,
      configuracion_emision: {
        sistema_emision: p.configuracion_emision?.sistema_emision || "SEE_CONTRIBUYENTE",
        proveedor_tipo: p.configuracion_emision?.proveedor_tipo || "SUNAT_DIRECTO",
        ambiente: p.configuracion_emision?.ambiente || "BETA",
        sol_usuario: "",
        sol_clave: "",
        pse_id: p.configuracion_emision?.pse_id || "",
        ose_id: p.configuracion_emision?.ose_id || "",
      },
    });
    setModalOpen(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ruc.trim() || !form.razon_social.trim() || !form.direccion_fiscal.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Campos requeridos",
        detail: "RUC, Razón Social y Dirección Fiscal son obligatorios.",
        life: 3000,
      });
      return;
    }

    const cleanUbigeo = form.ubigeo?.trim() || "";
    if (cleanUbigeo && !/^\d{6}$/.test(cleanUbigeo)) {
      toast.current?.show({
        severity: "warn",
        summary: "Ubigeo inválido",
        detail: "El código de ubigeo debe tener exactamente 6 dígitos numéricos (o déjalo en blanco si no lo conoces).",
        life: 4000,
      });
      return;
    }

    const payload = {
      ...form,
      ubigeo: cleanUbigeo || undefined,
      nombre_comercial: form.nombre_comercial?.trim() || undefined,
      departamento: form.departamento?.trim() || undefined,
      provincia: form.provincia?.trim() || undefined,
      distrito: form.distrito?.trim() || undefined,
      telefono: form.telefono?.trim() || undefined,
      email: form.email?.trim() || undefined,
    };

    setGuardando(true);
    try {
      if (editId) {
        await perfilesTributariosService.actualizar(editId, payload);
        toast.current?.show({
          severity: "success",
          summary: "Actualizado",
          detail: "Perfil tributario actualizado correctamente.",
          life: 3000,
        });
      } else {
        await perfilesTributariosService.crear(payload as any);
        toast.current?.show({
          severity: "success",
          summary: "Creado",
          detail: "Perfil tributario registrado con éxito.",
          life: 3000,
        });
      }
      setModalOpen(false);
      await cargar();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error al guardar",
        detail: err?.response?.data?.message || err?.message || "Ocurrió un error",
        life: 4000,
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: string, razon: string) => {
    if (!confirm(`¿Eliminar el perfil tributario "${razon}"?`)) return;
    try {
      await perfilesTributariosService.eliminar(id);
      toast.current?.show({
        severity: "success",
        summary: "Eliminado",
        detail: "Perfil tributario eliminado.",
        life: 3000,
      });
      await cargar();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err?.response?.data?.message || err?.message,
        life: 4000,
      });
    }
  };

  const handleAbrirCertModal = (id: string) => {
    setCertPerfilId(id);
    setCertFile(null);
    setCertClave("");
    setCertModalOpen(true);
  };

  const handleSubirCertificado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certPerfilId || !certFile) {
      toast.current?.show({
        severity: "warn",
        summary: "Archivo requerido",
        detail: "Seleccione un archivo .pfx o .p12",
        life: 3000,
      });
      return;
    }

    setSubiendoCert(true);
    try {
      await perfilesTributariosService.subirCertificado(certPerfilId, certFile, certClave);
      toast.current?.show({
        severity: "success",
        summary: "Certificado subido",
        detail: "El certificado digital fue cargado y validado exitosamente.",
        life: 3000,
      });
      setCertModalOpen(false);
      await cargar();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error en certificado",
        detail: err?.response?.data?.message || err?.message || "No se pudo leer el certificado",
        life: 4000,
      });
    } finally {
      setSubiendoCert(false);
    }
  };

  const handleVerificar = async (id: string) => {
    setVerificandoId(id);
    try {
      const res = await perfilesTributariosService.verificarConfiguracion(id);
      if (res.valido) {
        toast.current?.show({
          severity: "success",
          summary: "Configuración Verificada",
          detail: res.mensaje,
          life: 4000,
        });
      } else {
        toast.current?.show({
          severity: "warn",
          summary: "Advertencia",
          detail: res.mensaje,
          life: 5000,
        });
      }
      await cargar();
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error de verificación",
        detail: err?.response?.data?.message || err?.message,
        life: 4000,
      });
    } finally {
      setVerificandoId(null);
    }
  };

  const reqCert =
    form.regimen_tributario !== "NRUS" &&
    form.configuracion_emision?.sistema_emision !== "SEE_CF" &&
    form.configuracion_emision?.sistema_emision !== "SEE_SOL" &&
    form.configuracion_emision?.sistema_emision !== "MANUAL";

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Facturación Multi-RUC & Emisores Tributarios
              </h2>
              <p className="text-xs text-slate-500">
                Administra múltiples RUCs (Nuevo RUS, RER, RMT, General) con credenciales, certificados y series independientes.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAbrirCrear}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
        >
          <Plus size={16} />
          <span>Nuevo Emisor / RUC</span>
        </button>
      </div>

      {/* Lista de Emisores */}
      {cargando ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-slate-500 font-medium">Cargando emisores tributarios...</span>
        </div>
      ) : perfiles.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No hay perfiles tributarios configurados</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Registra tu primer RUC (Nuevo RUS o Régimen General/MYPE) para habilitar la emisión de comprobantes en el POS.
          </p>
          <button
            type="button"
            onClick={handleAbrirCrear}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
          >
            <Plus size={15} />
            <span>Configurar Primer RUC</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {perfiles.map((p) => {
            const esRus = p.regimen_tributario === "NRUS" || p.regimen_tributario === "NUEVO_RUS";
            const cfg = p.configuracion_emision;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border transition-all p-5 space-y-4 ${
                  p.es_principal
                    ? "border-emerald-300 ring-2 ring-emerald-100 shadow-xs"
                    : "border-slate-200/90 shadow-2xs hover:border-slate-300"
                }`}
              >
                {/* Top Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                        esRus ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {esRus ? "RUS" : "RUC"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900 truncate max-w-[200px]">
                          {p.razon_social}
                        </h3>
                        {p.es_principal && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                        <span className="font-bold text-slate-800">RUC: {p.ruc}</span>
                        <span>•</span>
                        <span>{p.tipo_contribuyente === "PERSONA_NATURAL" ? "Pers. Natural" : "Pers. Jurídica"}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border uppercase ${
                      esRus
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-blue-50 text-blue-800 border-blue-200"
                    }`}
                  >
                    {p.regimen_tributario}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Modalidad</span>
                    <span className="font-semibold text-slate-700 truncate block">
                      {cfg?.sistema_emision || "SEE_CF"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Ambiente</span>
                    <span
                      className={`font-bold inline-block px-1.5 py-0.2 rounded text-[10px] ${
                        cfg?.ambiente === "PRODUCCION"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {cfg?.ambiente || "BETA"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Certificado</span>
                    {cfg?.tiene_certificado ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Vigente
                      </span>
                    ) : esRus ? (
                      <span className="text-slate-500 font-medium">No requerido</span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <AlertTriangle size={12} /> Pendiente
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Credenciales SOL</span>
                    {cfg?.tiene_sol_usuario && cfg?.tiene_sol_clave ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Cifradas
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin configurar</span>
                    )}
                  </div>
                </div>

                {/* Rules hint */}
                {esRus ? (
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                    <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <span className="font-bold">Nuevo RUS:</span> Habilitado para emitir <strong>Boletas de Venta</strong> y <strong>Tickets</strong>. El sistema bloquea automáticamente la emisión de Facturas con este RUC.
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-blue-600" />
                    <div>
                      Habilitado para emitir <strong>Facturas</strong>, <strong>Boletas</strong> y <strong>Notas</strong> electrónicas.
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleVerificar(p.id)}
                      disabled={verificandoId === p.id}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                      title="Verificar configuración tributaria y credenciales"
                    >
                      {verificandoId === p.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ShieldCheck size={13} />
                      )}
                      <span>Verificar</span>
                    </button>

                    {!esRus && (
                      <button
                        type="button"
                        onClick={() => handleAbrirCertModal(p.id)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        title="Subir o actualizar Certificado Digital .PFX / .P12"
                      >
                        <Upload size={13} />
                        <span>Certificado</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAbrirEditar(p)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Editar emisor"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(p.id, p.razon_social)}
                      className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Eliminar emisor"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear / Editar Perfil Tributario */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Header modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editId ? "Editar Emisor Tributario" : "Nuevo Emisor Tributario (RUC)"}
                  </h3>
                  <p className="text-xs text-slate-500">Configuración fiscal y credenciales de emisión</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body modal */}
            <form onSubmit={handleGuardar} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sección 1: Identificación */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 size={14} /> Identificación del Contribuyente
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Número de RUC <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={11}
                        required
                        value={form.ruc}
                        onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, "") })}
                        placeholder="Ej: 10406447307 o 20601234567"
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleConsultarRuc}
                        disabled={consultandoRuc || form.ruc.length !== 11}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {consultandoRuc ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        <span>Consultar</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo Contribuyente</label>
                    <select
                      value={form.tipo_contribuyente}
                      onChange={(e) => setForm({ ...form, tipo_contribuyente: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                      <option value="PERSONA_NATURAL">Persona Natural (con negocio)</option>
                      <option value="PERSONA_JURIDICA">Persona Jurídica (SAC, SRL, etc.)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Razón Social <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.razon_social}
                      onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
                      placeholder="Nombre fiscal de la empresa o persona"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      value={form.nombre_comercial || ""}
                      onChange={(e) => setForm({ ...form, nombre_comercial: e.target.value })}
                      placeholder="Ej: Botica Marifarma"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección Fiscal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.direccion_fiscal}
                    onChange={(e) => setForm({ ...form, direccion_fiscal: e.target.value })}
                    placeholder="Av. / Jr. / Calle, Número, Urbanización"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ubigeo <span className="text-slate-400 font-normal">(6 dígitos)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={form.ubigeo || ""}
                      onChange={(e) => setForm({ ...form, ubigeo: e.target.value.replace(/\D/g, "") })}
                      placeholder="Ej: 150101"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Departamento</label>
                    <input
                      type="text"
                      value={form.departamento || ""}
                      onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                      placeholder="Ej: LIMA"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Provincia</label>
                    <input
                      type="text"
                      value={form.provincia || ""}
                      onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                      placeholder="Ej: LIMA"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Distrito</label>
                    <input
                      type="text"
                      value={form.distrito || ""}
                      onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                      placeholder="Ej: SAN BORJA"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={form.telefono || ""}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="Ej: 01 2345678 / 987654321"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={form.email || ""}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="facturacion@empresa.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Régimen Tributario */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText size={14} /> Régimen Tributario
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REGIMENES.map((reg) => {
                    const sel = form.regimen_tributario === reg.value;
                    return (
                      <label
                        key={reg.value}
                        className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-start gap-2.5 ${
                          sel
                            ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="regimen_tributario"
                          value={reg.value}
                          checked={sel}
                          onChange={() => setForm({ ...form, regimen_tributario: reg.value })}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{reg.label}</span>
                          <span className="text-[11px] text-slate-500 block leading-snug">{reg.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sección 3: Modalidad & SUNAT */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Server size={14} /> Modalidad de Emisión y Credenciales SOL
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sistema de Emisión</label>
                    <select
                      value={form.configuracion_emision?.sistema_emision || "SEE_CONTRIBUYENTE"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          configuracion_emision: {
                            ...form.configuracion_emision,
                            sistema_emision: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                      {SISTEMAS_EMISION.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ambiente SUNAT</label>
                    <select
                      value={form.configuracion_emision?.ambiente || "BETA"}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          configuracion_emision: {
                            ...form.configuracion_emision,
                            ambiente: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                      <option value="BETA">BETA / Homologación (Pruebas)</option>
                      <option value="PRODUCCION">PRODUCCIÓN (Validez Legal)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Usuario Secundario SOL</label>
                    <input
                      type="text"
                      value={form.configuracion_emision?.sol_usuario || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          configuracion_emision: {
                            ...form.configuracion_emision,
                            sol_usuario: e.target.value,
                          },
                        })
                      }
                      placeholder={editId ? "(Sin cambios)" : "Ej: MODDATOS"}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Clave SOL</label>
                    <input
                      type="password"
                      value={form.configuracion_emision?.sol_clave || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          configuracion_emision: {
                            ...form.configuracion_emision,
                            sol_clave: e.target.value,
                          },
                        })
                      }
                      placeholder={editId ? "•••••••• (Sin cambios)" : "Clave SOL"}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Mensaje condicional de Certificado */}
                {!reqCert ? (
                  <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                    <Info size={15} className="text-slate-500 shrink-0" />
                    <span>
                      <strong>Certificado Digital:</strong> No es obligatorio para la modalidad seleccionada ({form.regimen_tributario} / {form.configuracion_emision?.sistema_emision}).
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                    <Lock size={15} className="text-indigo-600 shrink-0" />
                    <span>
                      Esta modalidad requiere Certificado Digital (.pfx / .p12). Podrás cargarlo una vez guardado el perfil.
                    </span>
                  </div>
                )}

                {/* Checkbox Principal */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.es_principal ?? false}
                      onChange={(e) => setForm({ ...form, es_principal: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>Establecer como Emisor Principal por defecto en las ventas</span>
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{editId ? "Guardar Cambios" : "Registrar Emisor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Subir Certificado Digital */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Upload size={16} />
                </div>
                <h3 className="text-sm font-black text-slate-900">Subir Certificado Digital (.pfx / .p12)</h3>
              </div>
              <button
                type="button"
                onClick={() => setCertModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubirCertificado} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Archivo del Certificado (.pfx / .p12) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pfx,.p12"
                  required
                  onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña del Certificado</label>
                <input
                  type="password"
                  value={certClave}
                  onChange={(e) => setCertClave(e.target.value)}
                  placeholder="Contraseña privada del archivo PFX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <Lock size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <span>
                  El certificado y su contraseña se cifran con clave maestra AES-256 en el servidor. Nunca se almacenan en texto plano ni se exponen al navegador.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCertModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={subiendoCert || !certFile}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {subiendoCert ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>Subir y Cifrar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
