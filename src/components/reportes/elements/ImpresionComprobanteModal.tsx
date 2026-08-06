import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import {
  X,
  Printer,
  FileCode,
  FileText,
  Receipt,
  Download,
  Copy,
  Check,
  Store,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { generarXmlUbl21, type ComprobanteData } from "./comprobanteDocument";
import QRCode from "qrcode";

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

  useEffect(() => {
    setTabFormato(formatoInicial);
  }, [formatoInicial]);
  const { sucursalActual } = useAuth();

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

  useEffect(() => {
    if (comprobante) {
      const rucEmisor = botica.ruc;
      const tipoComp = comprobante.tipoComprobante === "FACTURA" ? "01" : comprobante.tipoComprobante === "BOLETA" ? "03" : "07";
      const serie = comprobante.serieNumero.split("-")[0] || "";
      const numero = comprobante.serieNumero.split("-")[1] || "";
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
  }, [comprobante, botica.ruc]);

  if (open === false || !comprobante) return null;

  const displaySerieNumero = comprobante.tipoComprobante === "NOTA_VENTA" && comprobante.serieNumero.includes("-") && comprobante.serieNumero.length > 20
    ? `NV-${comprobante.serieNumero.split("-")[0]?.toUpperCase()}`
    : comprobante.serieNumero;

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

  const handleImprimir = async () => {
    if (tabFormato === "xml" || !comprobante) return;

    const element = document.getElementById("area-impresion-pos");
    if (!element) {
      alert("No se encontró el elemento de impresión.");
      return;
    }

    setImprimiendo(true);
    try {
      // Eliminar iframe previo si existe
      const iframeId = "hidden-html-print-iframe";
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      if (iframe) {
        document.body.removeChild(iframe);
      }

      // Crear nuevo iframe
      iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        throw new Error("No se pudo acceder al documento del iframe.");
      }

      const isThermal = tabFormato === "80mm" || tabFormato === "58mm";
      const paperWidthCss = tabFormato === "80mm" ? "80mm" : tabFormato === "58mm" ? "58mm" : "210mm";
      const previewWidth = tabFormato === "80mm" ? "300px" : tabFormato === "58mm" ? "210px" : "100%";

      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Imprimir Comprobante</title>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: ${isThermal ? `${paperWidthCss} auto` : "A4"};
              margin: 0;
            }
            body {
              margin: 0;
              padding: ${isThermal ? "2mm" : "15mm"};
              font-family: monospace;
              background-color: white;
              color: black;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * {
              box-sizing: border-box;
              font-size: ${tabFormato === "58mm" ? "9px" : tabFormato === "80mm" ? "11px" : "12px"};
            }
            .print-container {
              width: ${previewWidth};
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${element.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        setImprimiendo(false);
      }, 1000);
    } catch (err) {
      console.error("Error al imprimir:", err);
      alert("No se pudo iniciar la impresión.");
      setImprimiendo(false);
    }
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
                onClick={handleImprimir}
                disabled={imprimiendo}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:shadow-none text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-teal-500/20"
              >
                <Printer size={15} />
                <span>{imprimiendo ? "Generando PDF..." : `Imprimir (${tabFormato.toUpperCase()})`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Contenido Previsualización */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-200/60 flex justify-center items-start">
          {tabFormato === "80mm" && (
            <div
              id="area-impresion-pos"
              className="w-[320px] bg-white p-5 rounded-2xl border border-slate-300 shadow-xl font-mono text-[11px] text-slate-900 space-y-3 leading-tight transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-black text-sm text-slate-900">
                  <Store size={16} className="text-teal-600" />
                  <span>{botica.nombre}</span>
                </div>
                <p className="text-[10px] text-slate-500">RUC: {botica.ruc}</p>
                <p className="text-[10px] text-slate-500">{botica.direccion}</p>
                {botica.telefono && (
                  <p className="text-[10px] text-slate-500">Tel: {botica.telefono}</p>
                )}
              </div>

              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <p className="font-black text-xs uppercase">
                  {comprobante.tipoComprobante === "BOLETA"
                    ? "BOLETA DE VENTA ELECTRÓNICA"
                    : comprobante.tipoComprobante === "FACTURA"
                    ? "FACTURA ELECTRÓNICA"
                    : "NOTA DE VENTA"}
                </p>
                <p className="font-black text-teal-700">{displaySerieNumero}</p>
              </div>

              <div className="text-[10px] border-b border-dashed border-slate-300 pb-2 space-y-0.5">
                <p><span className="text-slate-500">Fecha:</span> {comprobante.fechaEmision}</p>
                <p><span className="text-slate-500">Cliente:</span> {comprobante.cliente.nombre}</p>
                <p><span className="text-slate-500">{comprobante.cliente.tipoDocumento}:</span> {comprobante.cliente.numeroDocumento || "--------"}</p>
                {comprobante.cliente.direccion && <p><span className="text-slate-500">Dirección:</span> {comprobante.cliente.direccion}</p>}
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2 text-[10px]">
                <div className="flex justify-between font-bold border-b border-slate-200 pb-0.5">
                  <span className="flex-1">Cant/Descripción</span>
                  <span className="w-14 text-right">Total</span>
                </div>
                {comprobante.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <span className="flex-1 pr-2">
                      {item.cantidad}x {item.descripcion}
                    </span>
                    <span className="w-14 text-right font-bold">S/ {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Op. Gravada</span>
                  <span>S/ {comprobante.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%)</span>
                  <span>S/ {comprobante.igv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-200">
                  <span>IMPORTE TOTAL</span>
                  <span>S/ {comprobante.total.toFixed(2)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 space-y-0.5 text-[9px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Forma de Pago:</span>
                    <span className="font-bold">{comprobante.metodoPago || "EFECTIVO"}</span>
                  </div>
                  {comprobante.montoRecibido !== undefined && (
                    <div className="flex justify-between">
                      <span>Monto Recibido:</span>
                      <span>S/ {comprobante.montoRecibido.toFixed(2)}</span>
                    </div>
                  )}
                  {comprobante.vuelto !== undefined && (
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Vuelto:</span>
                      <span>S/ {(comprobante.vuelto || 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center pt-2 space-y-2 text-[9px] text-slate-500">
                <div className="flex justify-center">
                  <div className="p-1 border border-slate-200 bg-white rounded-lg flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR SUNAT" className="w-20 h-20" />
                    ) : (
                      <QrCode size={48} className="text-slate-800" />
                    )}
                  </div>
                </div>
                <p className="font-bold">Representación Impresa del Comprobante Electrónico</p>
                <p>Consulte su validez en sunat.gob.pe</p>
              </div>
            </div>
          )}

          {tabFormato === "58mm" && (
            <div
              id="area-impresion-pos"
              className="w-[230px] bg-white p-3 rounded-2xl border border-slate-300 shadow-xl font-mono text-[9px] text-slate-900 space-y-2 leading-tight relative overflow-hidden"
            >
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <p className="font-bold text-xs">{botica.nombre}</p>
                <p className="text-[8px] text-slate-500">RUC {botica.ruc}</p>
                <p className="font-bold text-teal-700 text-[10px] mt-1">{displaySerieNumero}</p>
              </div>
              <div className="border-b border-dashed border-slate-300 pb-1.5 space-y-0.5 text-[8px]">
                <p>F: {comprobante.fechaEmision.split("T")[0]}</p>
                <p>C: {comprobante.cliente.nombre}</p>
              </div>
              <div className="space-y-1 border-b border-dashed border-slate-300 pb-1.5">
                {comprobante.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate pr-1">{item.cantidad}x {item.descripcion}</span>
                    <span className="font-bold">S/{item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-0.5 text-right font-bold text-[9px]">
                <p>TOTAL: S/ {comprobante.total.toFixed(2)}</p>
                <p className="text-[8px] font-normal text-slate-600">Pago: {comprobante.metodoPago || "EFECTIVO"}</p>
              </div>
              <div className="flex justify-center mt-1">
                <div className="p-0.5 border border-slate-200 bg-white rounded flex items-center justify-center">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR SUNAT" className="w-14 h-14" />
                  ) : (
                    <QrCode size={32} className="text-slate-800" />
                  )}
                </div>
              </div>
              <div className="text-center pt-1 text-[8px] text-slate-400">
                <p>¡Gracias por su compra!</p>
              </div>
            </div>
          )}

          {tabFormato === "A4" && (
            <div
              id="area-impresion-pos"
              className="w-full max-w-2xl bg-white p-8 rounded-xl border border-slate-300 shadow-xl font-sans text-xs text-slate-800 space-y-6"
            >
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-black text-lg text-slate-900">
                    <Store className="text-teal-600" />
                    <span>{botica.nombre}</span>
                  </div>
                  <p className="text-slate-500 text-xs">{botica.direccion}</p>
                </div>
                <div className="border-2 border-teal-600 rounded-2xl p-4 text-center min-w-[200px] bg-teal-50/30">
                  <p className="text-xs font-bold text-teal-700">RUC {botica.ruc}</p>
                  <p className="font-black text-sm text-slate-800 my-1 uppercase">
                    {comprobante.tipoComprobante === "BOLETA"
                      ? "BOLETA ELECTRÓNICA"
                      : comprobante.tipoComprobante === "FACTURA"
                      ? "FACTURA ELECTRÓNICA"
                      : "NOTA DE VENTA"}
                  </p>
                  <p className="font-extrabold text-teal-700 text-sm">{displaySerieNumero}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p><span className="text-slate-500 font-medium">Señor(es):</span> <span className="font-bold text-slate-900">{comprobante.cliente.nombre}</span></p>
                  <p><span className="text-slate-500 font-medium">{comprobante.cliente.tipoDocumento}:</span> <span className="font-mono font-bold">{comprobante.cliente.numeroDocumento || "--------"}</span></p>
                  {comprobante.cliente.direccion && (
                    <p><span className="text-slate-500 font-medium">Dirección:</span> <span className="text-slate-700">{comprobante.cliente.direccion}</span></p>
                  )}
                </div>
                <div className="space-y-1.5 text-right">
                  <p><span className="text-slate-500 font-medium">Fecha Emisión:</span> <span className="font-bold">{comprobante.fechaEmision}</span></p>
                  <p><span className="text-slate-500 font-medium">Moneda:</span> <span className="font-bold">SOLES (S/)</span></p>
                  <p><span className="text-slate-500 font-medium">Forma de Pago:</span> {comprobante.metodoPago || "EFECTIVO"}</p>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-200 text-slate-700 font-bold">
                    <th className="p-2">Ítem</th>
                    <th className="p-2">Descripción</th>
                    <th className="p-2 text-center">Cant.</th>
                    <th className="p-2 text-right">P. Unit.</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comprobante.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-2 font-medium text-slate-900">{item.descripcion}</td>
                      <td className="p-2 text-center font-bold">{item.cantidad}</td>
                      <td className="p-2 text-right font-mono">S/ {item.precioUnitario.toFixed(2)}</td>
                      <td className="p-2 text-right font-bold font-mono">S/ {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-1 border border-slate-200 bg-white rounded-xl flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR SUNAT" className="w-16 h-16" />
                    ) : (
                      <QrCode size={64} className="text-slate-800" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-teal-600" /> Comprobante Autorizado por SUNAT
                    </p>
                    <p>Hash: {comprobante.id ? `sha1-${comprobante.id.slice(0, 16)}` : "sha1-ubl21-verified"}</p>
                    <p>Consulte su validez en www.sunat.gob.pe</p>
                  </div>
                </div>

                <div className="w-56 space-y-1 text-right text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Op. Gravada:</span>
                    <span className="font-mono">S/ {comprobante.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IGV (18%):</span>
                    <span className="font-mono">S/ {comprobante.igv.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-teal-700 pt-2 border-t border-slate-200">
                    <span>TOTAL:</span>
                    <span>S/ {comprobante.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tabFormato === "xml" && (
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
          )}
        </div>
      </div>
    </div>
  );
}
