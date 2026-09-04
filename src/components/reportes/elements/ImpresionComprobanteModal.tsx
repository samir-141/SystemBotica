import { useState, useEffect, useRef, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { AuthContext } from "../../../contexts/auth-context";
import {
  X,
  Printer,
  FileCode,
  FileText,
  Receipt,
  Download,
  Copy,
  Check,
  MessageCircle,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { generarXmlUbl21, type ComprobanteData } from "./comprobanteDocument";
import { TicketPOS } from "./TicketPOS";
import QRCode from "qrcode";
import { ticketConfigService } from "../../../services/ticketConfig.service";

interface Props {
  open?: boolean;
  onClose: () => void;
  comprobante: ComprobanteData | null;
  formatoInicial?: "80mm" | "58mm" | "A4" | "xml";
  onNuevaVenta?: () => void;
}

export default function ImpresionComprobanteModal({
  open = true,
  onClose,
  comprobante,
  formatoInicial = "80mm",
  onNuevaVenta,
}: Props) {
  const [tabFormato, setTabFormato] = useState<"80mm" | "58mm" | "A4" | "xml">(
    formatoInicial
  );
  const [copiado, setCopiado] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [telefonoWs, setTelefonoWs] = useState("");

  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTabFormato(formatoInicial);
  }, [formatoInicial]);

  const authContext = useContext(AuthContext);
  const sucursalActual = authContext?.sucursalActual ?? null;

  const { data: boticaFallback } = useQuery({
    queryKey: ["botica-perfil"],
    queryFn: () =>
      import("../../../services/facturacion.service").then((m) =>
        m.facturacionService.obtenerBoticaPerfil()
      ),
    staleTime: 60_000,
    enabled:
      !comprobante?.botica ||
      !comprobante.botica.ruc ||
      !comprobante.botica.direccion,
  });

  const botica =
    comprobante?.botica &&
    comprobante.botica.ruc &&
    comprobante.botica.direccion
      ? comprobante.botica
      : boticaFallback
      ? {
          nombre: boticaFallback.nombre || boticaFallback.razon_social,
          ruc: boticaFallback.ruc,
          direccion: boticaFallback.direccion || "",
          telefono: boticaFallback.telefono || "",
        }
      : comprobante?.botica ??
        (sucursalActual
          ? {
              nombre: sucursalActual.empresa || sucursalActual.nombre,
              ruc: sucursalActual.botica_ruc || "",
              direccion: sucursalActual.botica_direccion || "",
              telefono: sucursalActual.botica_telefono || "",
            }
          : {
              nombre: "Empresa sin configurar",
              ruc: "",
              direccion: "",
              telefono: "",
            });

  const displaySerieNumero = comprobante
    ? comprobante.serieNumero &&
      comprobante.serieNumero.length > 20 &&
      !comprobante.serieNumero.startsWith("NV") &&
      !comprobante.serieNumero.startsWith("B") &&
      !comprobante.serieNumero.startsWith("F")
      ? `NV01-${
          comprobante.serieNumero
            .replace(/[^0-9]/g, "")
            .padStart(8, "0")
            .slice(-8) || "00000001"
        }`
      : comprobante.serieNumero
    : "";

  useEffect(() => {
    if (comprobante) {
      const numCompFinal = displaySerieNumero || comprobante.serieNumero;
      const rucEmisor = botica.ruc;
      const tipoComp =
        comprobante.tipoComprobante === "FACTURA"
          ? "01"
          : comprobante.tipoComprobante === "BOLETA"
          ? "03"
          : "07";
      const serie = numCompFinal.split("-")[0] || "";
      const numero = numCompFinal.split("-")[1] || "";
      const igv = comprobante.igv.toFixed(2);
      const total = comprobante.total.toFixed(2);
      const fecha = comprobante.fechaEmision.split("T")[0] || "";
      const docCliTipo =
        comprobante.cliente.tipoDocumento === "RUC" ? "6" : "1";
      const docCliNum = comprobante.cliente.numeroDocumento || "00000000";

      const qrText = `${rucEmisor}|${tipoComp}|${serie}|${numero}|${igv}|${total}|${fecha}|${docCliTipo}|${docCliNum}|`;

      QRCode.toDataURL(qrText, { width: 128, margin: 1 })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error("Error al generar QR:", err);
        });

      if (comprobante.cliente?.telefono) {
        setTelefonoWs(comprobante.cliente.telefono);
      }
    }
  }, [comprobante, botica.ruc, displaySerieNumero]);

  const handlePrint = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Ticket_${displaySerieNumero || "Comprobante"}`,
    pageStyle:
      tabFormato === "58mm"
        ? "@media print { @page { size: 58mm auto; margin: 0; } body { margin: 0; padding: 1mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }"
        : tabFormato === "A4"
        ? "@media print { @page { size: A4; margin: 10mm; } body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }"
        : "@media print { @page { size: 80mm auto; margin: 0; } body { margin: 0; padding: 2mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }",
    onBeforePrint: async () => {
      setImprimiendo(true);
    },
    onAfterPrint: () => {
      setImprimiendo(false);
    },
    onPrintError: () => {
      setImprimiendo(false);
    },
  });

  const handlePrintTicketDirect = (formatoTicket: "80mm" | "58mm" = "80mm") => {
    setTabFormato(formatoTicket);
    setTimeout(() => {
      handlePrint();
    }, 150);
  };

  const handlePrintA4Direct = () => {
    setTabFormato("A4");
    setTimeout(() => {
      handlePrint();
    }, 150);
  };

  const handleEnviarWhatsAppDirecto = (telefonoDestino?: string) => {
    if (!comprobante) return;
    const tel = (telefonoDestino || telefonoWs || "").replace(/[^0-9]/g, "");
    if (!tel) {
      setShowWhatsappModal(true);
      return;
    }

    const finalPhone = tel.startsWith("51") ? tel : `51${tel}`;
    const boticaNombre = botica.nombre || "Nuestra Botica";
    const tipo =
      comprobante.tipoComprobante === "FACTURA"
        ? "Factura Electrónica"
        : comprobante.tipoComprobante === "BOLETA"
        ? "Boleta de Venta Electrónica"
        : "Nota de Venta";

    const itemsResumen = comprobante.items
      .map(
        (it) =>
          `• ${it.cantidad}x ${it.descripcion} (S/ ${it.subtotal.toFixed(2)})`
      )
      .join("\n");

    const mensaje = encodeURIComponent(
      `¡Hola ${comprobante.cliente.nombre || "Estimado(a) Cliente"}! 👋\n\n` +
        `Adjuntamos el resumen de tu compra en *${boticaNombre}*:\n\n` +
        `📄 *${tipo}*: ${displaySerieNumero}\n` +
        `📅 Fecha: ${comprobante.fechaEmision}\n\n` +
        `🛍️ *Detalle de productos:*\n${itemsResumen}\n\n` +
        `💰 *TOTAL: S/ ${comprobante.total.toFixed(2)}*\n` +
        `💳 Método de Pago: ${comprobante.metodoPago || "Contado"}\n\n` +
        `¡Muchas gracias por su preferencia! 💊✨`
    );

    window.open(
      `https://api.whatsapp.com/send?phone=${finalPhone}&text=${mensaje}`,
      "_blank"
    );
    setShowWhatsappModal(false);
  };

  if (open === false || !comprobante) return null;

  const xmlContent = generarXmlUbl21(comprobante);

  const handleCopiarXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleDescargarXml = () => {
    const blob = new Blob([xmlContent], { type: "text/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${displaySerieNumero}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNuevaVenta = () => {
    if (onNuevaVenta) {
      onNuevaVenta();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-700">
        {/* Topbar Header con estilo exacto de pantalla POS */}
        <div className="px-5 py-3.5 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <h2 className="font-bold text-sm tracking-wide uppercase">
              Resultados del Comprobante
            </h2>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
              {displaySerieNumero}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <X size={14} />
            <span>Cerrar</span>
          </button>
        </div>

        {/* Toolbar de Formatos */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex bg-slate-800/90 p-1 rounded-xl text-xs font-bold gap-1 border border-slate-700">
            <button
              onClick={() => setTabFormato("80mm")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "80mm"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Receipt size={14} />
              <span>Ticket 80mm</span>
            </button>
            <button
              onClick={() => setTabFormato("58mm")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "58mm"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Receipt size={14} />
              <span>Ticket 58mm</span>
            </button>
            <button
              onClick={() => setTabFormato("A4")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "A4"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText size={14} />
              <span>Formato A4</span>
            </button>
            <button
              onClick={() => setTabFormato("xml")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "xml"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileCode size={14} />
              <span>XML UBL 2.1</span>
            </button>
          </div>

          {tabFormato === "xml" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopiarXml}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer border border-slate-700"
              >
                {copiado ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
                <span>{copiado ? "Copiado" : "Copiar XML"}</span>
              </button>
              <button
                onClick={handleDescargarXml}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <Download size={14} />
                <span>Descargar</span>
              </button>
            </div>
          )}
        </div>

        {/* Visor Central del Comprobante */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/80 flex justify-center items-start">
          {tabFormato === "xml" ? (
            <div className="w-full max-w-2xl bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-200">
                  UBL 2.1 XML Generado
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
                  {displaySerieNumero}.xml
                </span>
              </div>
              <textarea
                readOnly
                value={xmlContent}
                className="w-full h-80 bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[10px] leading-relaxed border border-slate-800 focus:outline-none resize-none"
              />
            </div>
          ) : (
            <div className="p-2 flex justify-center w-full">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden">
                <TicketPOS
                  ref={ticketRef}
                  comprobante={comprobante}
                  formato={tabFormato}
                  botica={botica}
                  qrCodeUrl={qrCodeUrl}
                  displaySerieNumero={displaySerieNumero}
                  config={ticketConfigService.obtenerConfiguracion(
                    sucursalActual?.botica_id
                  )}
                />
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones Rápidas Inferiores (Diseño exacto de la foto) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center sm:justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            {/* 1. Enviar a WhatsApp */}
            <button
              onClick={() => handleEnviarWhatsAppDirecto()}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all transform active:scale-95 shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <MessageCircle size={16} className="fill-white/20" />
              <span>Enviar a WhatsApp</span>
            </button>

            {/* 2. Imprimir Ticket */}
            <button
              onClick={() => handlePrintTicketDirect("80mm")}
              disabled={imprimiendo}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-black transition-all transform active:scale-95 shadow-md shadow-sky-900/30 cursor-pointer"
            >
              <Printer size={16} />
              <span>
                {imprimiendo ? "Imprimiendo..." : "Imprimir Ticket"}
              </span>
            </button>

            {/* 3. Imprimir A4 */}
            <button
              onClick={() => handlePrintA4Direct()}
              disabled={imprimiendo}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-black transition-all transform active:scale-95 shadow-md shadow-rose-900/30 cursor-pointer"
            >
              <FileText size={16} />
              <span>Imprimir A4</span>
            </button>
          </div>

          {/* 4. + Nueva Venta */}
          <button
            onClick={handleNuevaVenta}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all transform active:scale-95 shadow-md shadow-amber-900/30 cursor-pointer"
          >
            <PlusCircle size={16} className="text-slate-950" />
            <span>+ Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* Modal / Diálogo rápido para ingresar teléfono de WhatsApp si no está registrado */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-5 w-full max-w-sm border border-slate-700 shadow-2xl text-white space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-emerald-400" />
                <h3 className="font-bold text-sm">Enviar por WhatsApp</h3>
              </div>
              <button
                onClick={() => setShowWhatsappModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Ingrese el número de WhatsApp del cliente para enviar el comprobante:
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-400 font-bold flex items-center">
                +51
              </span>
              <input
                type="tel"
                value={telefonoWs}
                onChange={(e) => setTelefonoWs(e.target.value)}
                placeholder="987654321"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWhatsappModal(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEnviarWhatsAppDirecto(telefonoWs)}
                disabled={!telefonoWs.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5"
              >
                <MessageCircle size={14} />
                <span>Enviar Comprobante</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
