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
}

export default function ImpresionComprobanteModal({
  open = true,
  onClose,
  comprobante,
  formatoInicial = "80mm",
}: Props) {
  const [tabFormato, setTabFormato] = useState<"80mm" | "58mm" | "A4" | "xml">(formatoInicial);
  const [copiado, setCopiado] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTabFormato(formatoInicial);
  }, [formatoInicial]);

  const authContext = useContext(AuthContext);
  const sucursalActual = authContext?.sucursalActual ?? null;

  // Cargar datos reales de la botica (empresa) desde la base de datos
  // cuando el comprobante no los trae o vienen incompletos (ej. RUC o dirección vacíos)
  const { data: boticaFallback } = useQuery({
    queryKey: ["botica-perfil"],
    queryFn: () => import("../../../services/facturacion.service").then(m => m.facturacionService.obtenerBoticaPerfil()),
    staleTime: 60_000,
    enabled: !comprobante?.botica || !comprobante.botica.ruc || !comprobante.botica.direccion,
  });

  const botica = (comprobante?.botica && comprobante.botica.ruc && comprobante.botica.direccion)
    ? comprobante.botica
    : (boticaFallback ? {
        nombre: boticaFallback.nombre || boticaFallback.razon_social,
        ruc: boticaFallback.ruc,
        direccion: boticaFallback.direccion || "",
        telefono: boticaFallback.telefono || "",
      } : (comprobante?.botica ?? (sucursalActual ? {
        nombre: sucursalActual.empresa || sucursalActual.nombre,
        ruc: sucursalActual.botica_ruc || "",
        direccion: sucursalActual.botica_direccion || "",
        telefono: sucursalActual.botica_telefono || "",
      } : {
        nombre: "Empresa sin configurar",
        ruc: "",
        direccion: "",
        telefono: "",
      })));

  const displaySerieNumero = comprobante
    ? comprobante.serieNumero &&
      comprobante.serieNumero.length > 20 &&
      !comprobante.serieNumero.startsWith("NV") &&
      !comprobante.serieNumero.startsWith("B") &&
      !comprobante.serieNumero.startsWith("F")
      ? `NV01-${comprobante.serieNumero.replace(/[^0-9]/g, "").padStart(8, "0").slice(-8) || "00000001"}`
      : comprobante.serieNumero
    : "";

  useEffect(() => {
    if (comprobante) {
      const numCompFinal = displaySerieNumero || comprobante.serieNumero;
      const rucEmisor = botica.ruc;
      const tipoComp = comprobante.tipoComprobante === "FACTURA" ? "01" : comprobante.tipoComprobante === "BOLETA" ? "03" : "07";
      const serie = numCompFinal.split("-")[0] || "";
      const numero = numCompFinal.split("-")[1] || "";
      const igv = comprobante.igv.toFixed(2);
      const total = comprobante.total.toFixed(2);
      const fecha = comprobante.fechaEmision.split("T")[0] || "";
      const docCliTipo = comprobante.cliente.tipoDocumento === "RUC" ? "6" : "1";
      const docCliNum = comprobante.cliente.numeroDocumento || "00000000";

      const qrText = `${rucEmisor}|${tipoComp}|${serie}|${numero}|${igv}|${total}|${fecha}|${docCliTipo}|${docCliNum}|`;

      QRCode.toDataURL(qrText, { width: 128, margin: 1 })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error("Error al generar QR:", err);
        });
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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Topbar Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Printer size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Visor e Impresión de Comprobante</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {displaySerieNumero} — {comprobante.tipoComprobante}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selector de Formatos (Tabs) */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => setTabFormato("80mm")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "80mm" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt size={14} />
              <span>Ticket 80mm</span>
            </button>
            <button
              onClick={() => setTabFormato("58mm")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "58mm" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt size={14} />
              <span>Ticket 58mm</span>
            </button>
            <button
              onClick={() => setTabFormato("A4")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "A4" ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} />
              <span>Formato A4</span>
            </button>
            <button
              onClick={() => setTabFormato("xml")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tabFormato === "xml" ? "bg-white text-indigo-700 shadow-sm font-black" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCode size={14} />
              <span>Modelo XML (UBL 2.1)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {tabFormato === "xml" ? (
              <>
                <button
                  onClick={handleCopiarXml}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {copiado ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiado ? "Copiado!" : "Copiar XML"}</span>
                </button>
                <button
                  onClick={handleDescargarXml}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <Download size={14} />
                  <span>Descargar XML</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handlePrint()}
                disabled={imprimiendo}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:shadow-none text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-teal-500/20"
              >
                <Printer size={15} />
                <span>{imprimiendo ? "Preparando impresión..." : `Imprimir (${tabFormato.toUpperCase()})`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Contenido Previsualización */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-200/60 flex justify-center items-start">
          {tabFormato === "xml" ? (
            <div className="w-full max-w-2xl bg-white p-6 rounded-2xl border border-slate-300 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800">UBL 2.1 XML Generado</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                  sunat-xml-draft.xml
                </span>
              </div>
              <textarea
                readOnly
                value={xmlContent}
                className="w-full h-80 bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[10px] leading-relaxed border border-slate-900 focus:outline-none resize-none"
              />
            </div>
          ) : (
            <div className="p-2 flex justify-center w-full">
              <TicketPOS
                ref={ticketRef}
                comprobante={comprobante}
                formato={tabFormato}
                botica={botica}
                qrCodeUrl={qrCodeUrl}
                displaySerieNumero={displaySerieNumero}
                config={ticketConfigService.obtenerConfiguracion(sucursalActual?.botica_id)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
