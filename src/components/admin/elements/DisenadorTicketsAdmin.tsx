import React, { useState, useRef, useEffect } from "react";
import {
  Printer,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Type,
  Image as ImageIcon,
  MessageSquare,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Toast } from "primereact/toast";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "../../../hooks/useAuth";
import { TicketPOS } from "../../reportes/elements/TicketPOS";
import {
  type TicketConfig,
  type FormatoPapel,
  type FuenteFamilia,
  type TamanoFuente,
  type Interlineado,
  type AlineacionLogo,
} from "../../../types/ticketConfig";
import { ticketConfigService } from "../../../services/ticketConfig.service";
import { api } from "../../../services/api";
import type { ComprobanteData } from "../../reportes/elements/comprobanteDocument";

// Datos de prueba realistas para la simulación del voucher
const MOCK_COMPROBANTE: ComprobanteData = {
  tipoComprobante: "BOLETA",
  serieNumero: "B001-00004821",
  fechaEmision: new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }),
  cliente: {
    nombre: "Juan Pérez Quispe",
    tipoDocumento: "DNI",
    numeroDocumento: "70809010",
    direccion: "Jr. Las Flores 123, Surco",
  },
  items: [
    {
      cantidad: 2,
      descripcion: "Paracetamol 500 mg x 10 Tab",
      precioUnitario: 0.5,
      subtotal: 1.0,
    },
    {
      cantidad: 1,
      descripcion: "Amoxicilina 500 mg x 20 Cáp",
      precioUnitario: 1.5,
      subtotal: 1.5,
    },
    {
      cantidad: 1,
      descripcion: "Alcohol en Gel 70% 500ml",
      precioUnitario: 9.9,
      subtotal: 9.9,
    },
  ],
  subtotal: 10.51,
  igv: 1.89,
  descuento: 0.0,
  total: 12.4,
  metodoPago: "EFECTIVO",
  montoRecibido: 20.0,
  vuelto: 7.6,
  cajero: "María Gómez (Caja 1)",
  qrCodeUrl: "",
};

export default function DisenadorTicketsAdmin() {
  const toast = useRef<Toast>(null);
  const { sucursalActual } = useAuth();
  const boticaId = sucursalActual?.botica_id || "default";

  const [config, setConfig] = useState<TicketConfig>(() =>
    ticketConfigService.obtenerConfiguracion(boticaId)
  );
  const [formatoSimulador, setFormatoSimulador] = useState<FormatoPapel>(
    config.formatoPapel || "80mm"
  );
  const [seccionActiva, setSeccionActiva] = useState<"formato" | "logo" | "textos" | "visibilidad">("formato");

  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ticketConfigService.cargarConfiguracionRemota(boticaId).then((remota) => {
      setConfig(remota);
      setFormatoSimulador(remota.formatoPapel || "80mm");
    });
  }, [boticaId]);

  const handlePrintTest = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Ticket_Prueba_${config.formatoPapel}`,
  });

  const handleSave = async () => {
    await ticketConfigService.guardarConfiguracion(config, boticaId);
    toast.current?.show({
      severity: "success",
      summary: "Diseño Guardado",
      detail: "La configuración de voucher se sincronizó en la base de datos y Supabase.",
      life: 3000,
    });
  };

  const handleReset = async () => {
    const restablecida = await ticketConfigService.restablecerConfiguracion(boticaId);
    setConfig(restablecida);
    setFormatoSimulador(restablecida.formatoPapel);
    toast.current?.show({
      severity: "info",
      summary: "Valores Restablecidos",
      detail: "Se han restaurado los valores por defecto del sistema.",
      life: 3000,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.current?.show({
        severity: "error",
        summary: "Formato no válido",
        detail: "Seleccione una imagen PNG, JPG o WEBP.",
        life: 3000,
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.current?.show({
        severity: "error",
        summary: "Imagen muy pesada",
        detail: "El logo no debe superar los 2 MB para asegurar rapidez de impresión.",
        life: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      // Previsualización instantánea
      setConfig((prev) => ({
        ...prev,
        logoUrl: base64,
        mostrarLogo: true,
      }));

      // Subida a Supabase Storage mediante el backend
      try {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await api.post<{ publicUrl?: string }>("/storage/logo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data?.publicUrl) {
          setConfig((prev) => {
            const updated = {
              ...prev,
              logoUrl: data.publicUrl,
              mostrarLogo: true,
            };
            ticketConfigService.guardarConfiguracion(updated, boticaId);
            return updated;
          });
          toast.current?.show({
            severity: "success",
            summary: "Logo en Supabase Storage",
            detail: "El logo fue subido a Supabase Storage y guardado con éxito.",
            life: 3000,
          });
          return;
        }
      } catch (err) {
        console.warn("Fallo subida a API storage, usando base64 local", err);
      }

      toast.current?.show({
        severity: "success",
        summary: "Logo cargado",
        detail: "El logo se ha añadido a la vista previa.",
        life: 2500,
      });
    };
    reader.readAsDataURL(file);
  };

  const boticaData = {
    nombre: config.nombreComercialPersonalizado || sucursalActual?.empresa || sucursalActual?.nombre || "BOTICA MARIFARMA",
    ruc: sucursalActual?.botica_ruc || "20609999992",
    direccion: sucursalActual?.botica_direccion || "Av. Principal 450, Lima",
    telefono: sucursalActual?.botica_telefono || "987-654-321",
  };

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900">Diseñador y Personalizador de Tickets (POS)</h2>
              <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Live Preview
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Personaliza el logotipo, tipografía, cabecera y pie de página de tus comprobantes térmicos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RotateCcw size={14} /> Restablecer
          </button>
          <button
            type="button"
            onClick={() => handlePrintTest()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Printer size={14} /> Imprimir Prueba
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition cursor-pointer"
          >
            <Save size={14} /> Guardar Diseño
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel de Controles (Izquierda) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {/* Sub-tabs de configuración */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setSeccionActiva("formato")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                seccionActiva === "formato"
                  ? "bg-white text-purple-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Type size={14} /> Formato y Letra
            </button>
            <button
              type="button"
              onClick={() => setSeccionActiva("logo")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                seccionActiva === "logo"
                  ? "bg-white text-purple-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon size={14} /> Logo e Imagen
            </button>
            <button
              type="button"
              onClick={() => setSeccionActiva("textos")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                seccionActiva === "textos"
                  ? "bg-white text-purple-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare size={14} /> Textos y Mensajes
            </button>
            <button
              type="button"
              onClick={() => setSeccionActiva("visibilidad")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                seccionActiva === "visibilidad"
                  ? "bg-white text-purple-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye size={14} /> Campos Visibles
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* SECCIÓN 1: FORMATO Y TIPOGRAFÍA */}
            {seccionActiva === "formato" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Ancho de Papel Predeterminado
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setConfig((p) => ({ ...p, formatoPapel: "80mm" }));
                        setFormatoSimulador("80mm");
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                        config.formatoPapel === "80mm"
                          ? "bg-purple-50/70 border-purple-400 text-purple-900 ring-2 ring-purple-200"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs">80 mm (Estándar)</span>
                        {config.formatoPapel === "80mm" && <CheckCircle2 size={16} className="text-purple-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500">Impresoras térmicas de caja de mostrador.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setConfig((p) => ({ ...p, formatoPapel: "58mm" }));
                        setFormatoSimulador("58mm");
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition cursor-pointer ${
                        config.formatoPapel === "58mm"
                          ? "bg-purple-50/70 border-purple-400 text-purple-900 ring-2 ring-purple-200"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs">58 mm (Compacto)</span>
                        {config.formatoPapel === "58mm" && <CheckCircle2 size={16} className="text-purple-600" />}
                      </div>
                      <span className="text-[11px] text-slate-500">Impresoras pequeñas o inalámbricas Bluetooth.</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Estilo de Fuente
                    </label>
                    <select
                      value={config.fuenteFamilia}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, fuenteFamilia: e.target.value as FuenteFamilia }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="mono">Monoespaciada Clásica</option>
                      <option value="sans">Moderna Sans-Serif</option>
                      <option value="compact">Compacta Condensada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Tamaño de Letra
                    </label>
                    <select
                      value={config.tamanoFuente}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, tamanoFuente: e.target.value as TamanoFuente }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="sm">Pequeño (Ahorro)</option>
                      <option value="md">Mediano (Normal)</option>
                      <option value="lg">Grande (Legible)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Interlineado
                    </label>
                    <select
                      value={config.interlineado}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, interlineado: e.target.value as Interlineado }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="compacto">Compacto</option>
                      <option value="normal">Normal</option>
                      <option value="espacioso">Espaciado</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 2: LOGO E IMAGEN */}
            {seccionActiva === "logo" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Mostrar Logotipo en el Ticket</p>
                    <p className="text-[11px] text-slate-500">Imprime el logo en la parte superior del encabezado.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.mostrarLogo}
                    onChange={(e) => setConfig((p) => ({ ...p, mostrarLogo: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-200 hover:border-purple-300 rounded-2xl p-6 text-center space-y-3 transition bg-slate-50/50">
                  {config.logoUrl ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <img
                          src={config.logoUrl}
                          alt="Logo de la botica"
                          style={{
                            maxWidth: `${config.logoWidthPx}px`,
                            filter: config.logoMonocromatico ? "grayscale(100%) contrast(150%)" : "none",
                          }}
                          className="h-auto max-h-24 object-contain border border-slate-200 bg-white p-2 rounded-xl shadow-xs"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1">
                          <Upload size={13} /> Cambiar Imagen
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setConfig((p) => ({ ...p, logoUrl: null, mostrarLogo: false }))}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Quitar Logo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Haz clic para subir el logotipo</span>
                      <span className="text-[11px] text-slate-400">PNG o JPG con fondo blanco/transparente (máx 2MB)</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {config.logoUrl && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Ancho ({config.logoWidthPx} px)
                      </label>
                      <input
                        type="range"
                        min={60}
                        max={200}
                        step={5}
                        value={config.logoWidthPx}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, logoWidthPx: Number(e.target.value) }))
                        }
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Alineación
                      </label>
                      <select
                        value={config.logoAlineacion}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, logoAlineacion: e.target.value as AlineacionLogo }))
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="center">Centrado</option>
                        <option value="left">Izquierda</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="monoToggle"
                        checked={config.logoMonocromatico}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, logoMonocromatico: e.target.checked }))
                        }
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                      <label htmlFor="monoToggle" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Blanco y Negro (Alto contraste)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN 3: TEXTOS Y MENSAJES */}
            {seccionActiva === "textos" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nombre Comercial en Encabezado
                  </label>
                  <input
                    type="text"
                    value={config.nombreComercialPersonalizado || ""}
                    onChange={(e) =>
                      setConfig((p) => ({ ...p, nombreComercialPersonalizado: e.target.value }))
                    }
                    placeholder="Ej. BOTICA SAN PEDRO"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Dejar en blanco para usar el nombre oficial de la botica.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Eslogan o Subtítulo Superior
                  </label>
                  <input
                    type="text"
                    value={config.eslogan || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, eslogan: e.target.value }))}
                    placeholder="Ej. Tu salud y bienestar, nuestra prioridad"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mensaje de Agradecimiento / Términos al Pie
                  </label>
                  <textarea
                    rows={3}
                    value={config.mensajePie || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, mensajePie: e.target.value }))}
                    placeholder="Ej. ¡Gracias por su preferencia!&#10;Conserve este comprobante para cualquier cambio dentro de 48h."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teléfono / WhatsApp / Delivery al Pie
                  </label>
                  <input
                    type="text"
                    value={config.mensajeContacto || ""}
                    onChange={(e) => setConfig((p) => ({ ...p, mensajeContacto: e.target.value }))}
                    placeholder="Ej. Pedidos y Delivery WhatsApp: 987-654-321"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* SECCIÓN 4: CAMPOS VISIBLES */}
            {seccionActiva === "visibilidad" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "mostrarRuc", label: "Mostrar RUC de la Empresa" },
                  { key: "mostrarDireccion", label: "Mostrar Dirección Fiscal/Sede" },
                  { key: "mostrarTelefono", label: "Mostrar Teléfono de la Botica" },
                  { key: "mostrarCajero", label: "Mostrar Nombre del Cajero" },
                  { key: "mostrarCliente", label: "Mostrar Datos del Cliente" },
                  { key: "mostrarDescuentos", label: "Mostrar Desglose de Descuentos" },
                  { key: "mostrarQR", label: "Mostrar Código QR Tributario" },
                  { key: "mostrarCodigoBarras", label: "Mostrar Código de Barras de Ticket" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer select-none transition"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(config[item.key as keyof TicketConfig])}
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, [item.key]: e.target.checked }))
                      }
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de Vista Previa en Vivo (Derecha) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Selector interactivo de simulación */}
          <div className="w-full max-w-sm flex items-center justify-between bg-slate-900 text-white p-2.5 rounded-t-2xl px-4 shadow-md">
            <span className="text-xs font-bold flex items-center gap-1.5 text-purple-300">
              <Eye size={14} /> Simulador en Tiempo Real
            </span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-[10px] font-extrabold">
              <button
                type="button"
                onClick={() => setFormatoSimulador("80mm")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  formatoSimulador === "80mm" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                80 mm
              </button>
              <button
                type="button"
                onClick={() => setFormatoSimulador("58mm")}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  formatoSimulador === "58mm" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                58 mm
              </button>
            </div>
          </div>

          {/* Ticket Paper Container con efecto térmico */}
          <div className="w-full max-w-sm bg-slate-200 p-4 rounded-b-2xl border border-slate-300 shadow-xl flex justify-center overflow-x-auto min-h-[520px]">
            <div className="bg-white shadow-2xl rounded-sm transition-all duration-150 transform hover:scale-[1.01]">
              <TicketPOS
                ref={ticketRef}
                comprobante={MOCK_COMPROBANTE}
                formato={formatoSimulador}
                botica={boticaData}
                config={config}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
