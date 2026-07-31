import { useState, useEffect } from "react";
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

export interface ComprobanteData {
  id?: string;
  tipoComprobante: "BOLETA" | "FACTURA" | "NOTA_VENTA";
  serieNumero: string;
  fechaEmision: string;
  cliente: {
    nombre: string;
    tipoDocumento: string;
    numeroDocumento: string;
    direccion?: string;
  };
  items: Array<{
    descripcion: string;
    presentacion?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  igv: number;
  total: number;
  metodoPago?: string;
  montoRecibido?: number;
  vuelto?: number;
  estadoSunat?: "ACEPTADO" | "PENDIENTE" | "OBSERVADO" | "RECHAZADO" | "ANULADO";
}

interface Props {
  open?: boolean;
  onClose: () => void;
  comprobante: ComprobanteData | null;
  formatoInicial?: "80mm" | "58mm" | "A4" | "xml";
}

export function generarXmlUbl21(c: ComprobanteData): string {
  const isFactura = c.tipoComprobante === "FACTURA";
  const tipoDocCode = isFactura ? "01" : c.tipoComprobante === "BOLETA" ? "03" : "07";
  const rucEmisor = "20612345678";
  const razonSocialEmisor = "BOTICA MARIFARMA";
  
  const itemsXml = (c.items || [])
    .map(
      (item, idx) => `
    <cac:InvoiceLine>
        <cbc:ID>${idx + 1}</cbc:ID>
        <cbc:InvoicedQuantity unitCode="NIU">${item.cantidad}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="PEN">${(item.subtotal / 1.18).toFixed(2)}</cbc:LineExtensionAmount>
        <cac:PricingReference>
            <cac:AlternativeConditionPrice>
                <cbc:PriceAmount currencyID="PEN">${item.precioUnitario.toFixed(2)}</cbc:PriceAmount>
                <cbc:PriceTypeCode>01</cbc:PriceTypeCode>
            </cac:AlternativeConditionPrice>
        </cac:PricingReference>
        <cac:TaxTotal>
            <cbc:TaxAmount currencyID="PEN">${(item.subtotal - item.subtotal / 1.18).toFixed(2)}</cbc:TaxAmount>
            <cac:TaxSubtotal>
                <cbc:TaxableAmount currencyID="PEN">${(item.subtotal / 1.18).toFixed(2)}</cbc:TaxableAmount>
                <cbc:TaxAmount currencyID="PEN">${(item.subtotal - item.subtotal / 1.18).toFixed(2)}</cbc:TaxAmount>
                <cac:TaxScheme>
                    <cbc:ID>1000</cbc:ID>
                    <cbc:Name>IGV</cbc:Name>
                    <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
                </cac:TaxScheme>
            </cac:TaxSubtotal>
        </cac:TaxTotal>
        <cac:Item>
            <cbc:Description><![CDATA[${item.descripcion}]]></cbc:Description>
            <cac:SellersItemIdentification>
                <cbc:ID>MED-${idx + 100}</cbc:ID>
            </cac:SellersItemIdentification>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="PEN">${(item.precioUnitario / 1.18).toFixed(2)}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
    <cbc:CustomizationID>2.0</cbc:CustomizationID>
    <cbc:ID>${c.serieNumero}</cbc:ID>
    <cbc:IssueDate>${c.fechaEmision.split("T")[0]}</cbc:IssueDate>
    <cbc:IssueTime>${new Date(c.fechaEmision).toTimeString().split(" ")[0]}</cbc:IssueTime>
    <cbc:InvoiceTypeCode listID="0101">${tipoDocCode}</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode>
    
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="6">${rucEmisor}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName><![CDATA[${razonSocialEmisor}]]></cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>
    
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="${c.cliente.tipoDocumento === "RUC" ? "6" : "1"}">${c.cliente.numeroDocumento || "00000000"}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName><![CDATA[${c.cliente.nombre}]]></cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>
    
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="PEN">${c.igv.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="PEN">${c.subtotal.toFixed(2)}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="PEN">${c.igv.toFixed(2)}</cbc:TaxAmount>
            <cac:TaxScheme>
                <cbc:ID>1000</cbc:ID>
                <cbc:Name>IGV</cbc:Name>
                <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
            </cac:TaxScheme>
        </cac:TaxSubtotal>
    </cac:TaxTotal>
    
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="PEN">${c.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
        <cbc:TaxInclusiveAmount currencyID="PEN">${c.total.toFixed(2)}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="PEN">${c.total.toFixed(2)}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    ${itemsXml}
</Invoice>`;
}

export default function ImpresionComprobanteModal({
  open = true,
  onClose,
  comprobante,
  formatoInicial = "80mm",
}: Props) {
  const [tabFormato, setTabFormato] = useState<"80mm" | "58mm" | "A4" | "xml">(formatoInicial);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setTabFormato(formatoInicial);
  }, [formatoInicial]);

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
    link.download = `${comprobante.serieNumero}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inyección de estilos CSS @page dinámicos para impresoras térmicas (80mm / 58mm) o A4
  const handleImprimir = () => {
    const styleId = "print-page-size-style";
    let existingStyle = document.getElementById(styleId);
    if (!existingStyle) {
      existingStyle = document.createElement("style");
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    let pageSizeCss = "@page { size: 80mm auto; margin: 0mm; }";
    if (tabFormato === "58mm") {
      pageSizeCss = "@page { size: 58mm auto; margin: 0mm; }";
    } else if (tabFormato === "A4") {
      pageSizeCss = "@page { size: A4 portrait; margin: 10mm; }";
    }

    existingStyle.innerHTML = `
      @media print {
        ${pageSizeCss}
        body * {
          visibility: hidden;
        }
        #area-impresion-pos, #area-impresion-pos * {
          visibility: visible;
        }
        #area-impresion-pos {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          margin: 0 !important;
          padding: 4mm !important;
          box-shadow: none !important;
          border: none !important;
        }
      }
    `;

    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* ══ Topbar Header ══ */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Printer size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Visor e Impresión de Comprobante</h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {comprobante.serieNumero} — {comprobante.tipoComprobante}
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

        {/* ══ Selector de Formatos (Tabs) ══ */}
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

          {/* Acciones para XML o Impresión */}
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
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer shadow-md shadow-teal-500/20"
              >
                <Printer size={15} />
                <span>Imprimir ({tabFormato.toUpperCase()})</span>
              </button>
            )}
          </div>
        </div>

        {/* ══ Contenido Previsualización ══ */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-200/60 flex justify-center items-start">
          {/* FORMATO TICKET 80MM (VISTA PREVIA REALISTA) */}
          {tabFormato === "80mm" && (
            <div
              id="area-impresion-pos"
              className="w-[320px] bg-white p-5 rounded-2xl border border-slate-300 shadow-xl font-mono text-[11px] text-slate-900 space-y-3 leading-tight transition-all relative overflow-hidden"
            >
              {/* Textura de corte térmico superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-black text-sm text-slate-900">
                  <Store size={16} className="text-teal-600" />
                  <span>BOTICA MARIFARMA</span>
                </div>
                <p className="text-[10px] text-slate-500">RUC: 20612345678</p>
                <p className="text-[10px] text-slate-500">Av. Javier Prado 1234, San Isidro, Lima</p>
                <p className="text-[10px] text-slate-500">Tel: (01) 456-7890</p>
              </div>

              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <p className="font-black text-xs uppercase">
                  {comprobante.tipoComprobante === "BOLETA"
                    ? "BOLETA DE VENTA ELECTRÓNICA"
                    : comprobante.tipoComprobante === "FACTURA"
                    ? "FACTURA ELECTRÓNICA"
                    : "NOTA DE VENTA"}
                </p>
                <p className="font-black text-teal-700">{comprobante.serieNumero}</p>
              </div>

              <div className="text-[10px] border-b border-dashed border-slate-300 pb-2 space-y-0.5">
                <p><span className="text-slate-500">Fecha:</span> {comprobante.fechaEmision}</p>
                <p><span className="text-slate-500">Cliente:</span> {comprobante.cliente.nombre}</p>
                <p><span className="text-slate-500">{comprobante.cliente.tipoDocumento}:</span> {comprobante.cliente.numeroDocumento || "--------"}</p>
                {comprobante.cliente.direccion && <p><span className="text-slate-500">Dirección:</span> {comprobante.cliente.direccion}</p>}
              </div>

              {/* Tabla Ítems */}
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

              {/* Totales */}
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

              {/* Pie de Ticket / QR */}
              <div className="text-center pt-2 space-y-2 text-[9px] text-slate-500">
                <div className="flex justify-center">
                  <div className="p-2 border border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center">
                    <QrCode size={48} className="text-slate-800" />
                  </div>
                </div>
                <p className="font-bold">Representación Impresa del Comprobante Electrónico</p>
                <p>Consulte su validez en sunat.gob.pe</p>
              </div>
            </div>
          )}

          {/* FORMATO TICKET 58MM */}
          {tabFormato === "58mm" && (
            <div
              id="area-impresion-pos"
              className="w-[230px] bg-white p-3 rounded-2xl border border-slate-300 shadow-xl font-mono text-[9px] text-slate-900 space-y-2 leading-tight relative overflow-hidden"
            >
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <p className="font-bold text-xs">BOTICA MARIFARMA</p>
                <p className="text-[8px] text-slate-500">RUC 20612345678</p>
                <p className="font-bold text-teal-700 text-[10px] mt-1">{comprobante.serieNumero}</p>
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
              <div className="text-center pt-1 text-[8px] text-slate-400">
                <p>¡Gracias por su compra!</p>
              </div>
            </div>
          )}

          {/* FORMATO HOJA A4 */}
          {tabFormato === "A4" && (
            <div
              id="area-impresion-pos"
              className="w-full max-w-2xl bg-white p-8 rounded-xl border border-slate-300 shadow-xl font-sans text-xs text-slate-800 space-y-6"
            >
              {/* Encabezado A4 */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-black text-lg text-slate-900">
                    <Store className="text-teal-600" />
                    <span>BOTICA MARIFARMA</span>
                  </div>
                  <p className="text-slate-500 text-xs">Av. Javier Prado Este 1234, San Isidro, Lima</p>
                  <p className="text-slate-500 text-xs">Teléfono: (01) 456-7890 | Email: contacto@farmaciademo.pe</p>
                </div>
                <div className="border-2 border-slate-900 rounded-xl p-3 text-center min-w-[200px] bg-slate-50">
                  <p className="font-bold text-xs uppercase">R.U.C. 20612345678</p>
                  <p className="font-black text-sm text-teal-700 my-1">
                    {comprobante.tipoComprobante === "BOLETA"
                      ? "BOLETA DE VENTA ELECTRÓNICA"
                      : comprobante.tipoComprobante === "FACTURA"
                      ? "FACTURA ELECTRÓNICA"
                      : "NOTA DE VENTA"}
                  </p>
                  <p className="font-bold font-mono text-xs">{comprobante.serieNumero}</p>
                </div>
              </div>

              {/* Datos Cliente */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Señor(es):</p>
                  <p className="font-bold text-slate-900">{comprobante.cliente.nombre}</p>
                  <p className="text-slate-600 mt-1">
                    <span className="font-bold">{comprobante.cliente.tipoDocumento}:</span>{" "}
                    {comprobante.cliente.numeroDocumento || "--------"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Fecha de Emisión:</p>
                  <p className="font-bold text-slate-900">{comprobante.fechaEmision}</p>
                  <p className="text-slate-600 mt-1">
                    <span className="font-bold">Forma de Pago:</span> {comprobante.metodoPago || "EFECTIVO"}
                  </p>
                </div>
              </div>

              {/* Tabla Detalle */}
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

              {/* Pie y Totales A4 */}
              <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 border border-slate-200 rounded-xl bg-slate-50">
                    <QrCode size={64} className="text-slate-800" />
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

          {/* VISOR MODELO XML UBL 2.1 */}
          {tabFormato === "xml" && (
            <div className="w-full max-w-3xl bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-2xl font-mono text-xs overflow-x-auto leading-relaxed">
              <pre className="whitespace-pre-wrap text-emerald-400">{xmlContent}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
