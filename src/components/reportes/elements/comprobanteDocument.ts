export interface ComprobanteData {
  id?: string;
  tipoComprobante: "BOLETA" | "FACTURA" | "NOTA_VENTA";
  serieNumero: string;
  fechaEmision: string;
  boticaId?: string;
  botica?: {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
  };
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

export function generarXmlUbl21(c: ComprobanteData): string {
  const isFactura = c.tipoComprobante === "FACTURA";
  const tipoDocCode = isFactura ? "01" : c.tipoComprobante === "BOLETA" ? "03" : "07";
  const rucEmisor = c.botica?.ruc ?? "";
  const razonSocialEmisor = c.botica?.nombre ?? "Sin datos de empresa";

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
    </cac:InvoiceLine>`,
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
