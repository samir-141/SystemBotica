import { describe, expect, it } from "vitest";
import { generarXmlUbl21, type ComprobanteData } from "../comprobanteDocument";

const comprobante: ComprobanteData = {
  tipoComprobante: "FACTURA",
  serieNumero: "F001-00000123",
  fechaEmision: "2026-08-01T10:30:00.000Z",
  cliente: {
    nombre: "Cliente Empresa SAC",
    tipoDocumento: "RUC",
    numeroDocumento: "20111111111",
  },
  items: [{
    descripcion: "Producto de prueba",
    presentacion: "Caja",
    cantidad: 2,
    precioUnitario: 11.8,
    subtotal: 23.6,
  }],
  subtotal: 20,
  igv: 3.6,
  total: 23.6,
};

describe("comprobanteDocument", () => {
  it("preserva el XML UBL 2.1 al separarlo del componente React", () => {
    const xml = generarXmlUbl21(comprobante);

    expect(xml).toContain("<cbc:UBLVersionID>2.1</cbc:UBLVersionID>");
    expect(xml).toContain("<cbc:ID>F001-00000123</cbc:ID>");
    expect(xml).toContain('<cbc:InvoiceTypeCode listID="0101">01</cbc:InvoiceTypeCode>');
    expect(xml).toContain('<cbc:ID schemeID="6">20111111111</cbc:ID>');
    expect(xml).toContain("<![CDATA[Producto de prueba]]>");
    expect(xml).toContain('<cbc:PayableAmount currencyID="PEN">23.60</cbc:PayableAmount>');
  });
});
