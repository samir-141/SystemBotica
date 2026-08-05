import type { ReceiptData } from "../types/receipt.types";
import type { PrinterConfiguration } from "../types/printer.types";
import { PAPER_CONFIG } from "../constants/paper.constants";
import { formatMoney, formatDate } from "../utils/receipt-format.utils";
import { wrapText, repeatCharacter } from "../utils/text-align.utils";

interface ReceiptPreviewProps {
  receipt: ReceiptData;
  configuration: PrinterConfiguration;
  className?: string;
}

export function ReceiptPreview({ receipt, configuration, className = "" }: ReceiptPreviewProps) {
  const cpl = configuration.charactersPerLine || PAPER_CONFIG[configuration.paperWidth].defaultCharactersPerLine;
  const paperWidth = PAPER_CONFIG[configuration.paperWidth];

  return (
    <div
      className={`receipt-preview bg-white text-black mx-auto font-mono text-xs leading-tight overflow-x-auto ${className}`}
      data-paper={configuration.paperWidth}
      style={{
        width: `${paperWidth.previewWidthMm}mm`,
        padding: configuration.paperWidth === "58mm" ? "3mm" : "4mm",
      }}
    >
      <div className="text-center font-bold">{receipt.company.commercialName || receipt.company.legalName}</div>
      {receipt.company.commercialName && receipt.company.legalName && (
        <div className="text-center">{receipt.company.legalName}</div>
      )}
      {receipt.company.ruc && <div className="text-center">RUC: {receipt.company.ruc}</div>}
      {receipt.company.address && <div className="text-center">{receipt.company.address}</div>}
      {receipt.company.phone && <div className="text-center">Tel: {receipt.company.phone}</div>}

      <div className="text-center my-1">{repeatCharacter("-", cpl)}</div>
      <div className="text-center font-bold">COMPROBANTE DE VENTA</div>
      <div className="text-center my-1">{repeatCharacter("-", cpl)}</div>

      <div>Tipo: {receipt.document.type}</div>
      <div>Serie: {receipt.document.series}-{receipt.document.number}</div>
      <div>Fecha: {formatDate(receipt.document.issuedAt)}</div>
      {receipt.branch.name && <div>Sucursal: {receipt.branch.name}</div>}
      {receipt.customer?.name && <div>Cliente: {receipt.customer.name}</div>}
      {receipt.customer?.documentNumber && (
        <div>{receipt.customer.documentType || "DNI"}: {receipt.customer.documentNumber}</div>
      )}
      {receipt.cashier?.name && <div>Cajero: {receipt.cashier.name}</div>}
      {receipt.isReprint && (
        <div className="text-center font-bold my-1">*** REIMPRESIÓN ***</div>
      )}

      <div className="text-center my-1">{repeatCharacter("-", cpl)}</div>
      <div className="flex justify-between">
        <span>PRODUCTO</span>
        <span>IMPORTE</span>
      </div>
      <div className="text-center my-1">{repeatCharacter("-", cpl)}</div>

      {receipt.items.map((item) => (
        <div key={item.id} className="mb-1">
          {wrapText(item.name, cpl).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
          <div className="flex justify-between">
            <span>{item.quantity} x {formatMoney(item.unitPrice)}</span>
            <span>{formatMoney(item.subtotal)}</span>
          </div>
          {item.presentation && <div className="text-gray-500 ml-2">{item.presentation}</div>}
        </div>
      ))}

      <div className="text-center my-1">{repeatCharacter("-", cpl)}</div>

      {receipt.totals.discount && receipt.totals.discount > 0 && (
        <div className="flex justify-between">
          <span>Descuento:</span>
          <span>- {formatMoney(receipt.totals.discount)}</span>
        </div>
      )}
      {receipt.totals.subtotal !== undefined && (
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatMoney(receipt.totals.subtotal)}</span>
        </div>
      )}
      {receipt.totals.igv !== undefined && receipt.totals.igv > 0 && (
        <div className="flex justify-between">
          <span>IGV (18%):</span>
          <span>{formatMoney(receipt.totals.igv)}</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL:</span>
        <span>{formatMoney(receipt.totals.total)}</span>
      </div>

      <div className="text-center my-1">{repeatCharacter("-", cpl)}</div>

      {receipt.payment && (
        <div>
          {receipt.payment.method && <div>Pago: {receipt.payment.method}</div>}
          {receipt.payment.amountReceived !== undefined && (
            <div className="flex justify-between">
              <span>Recibido:</span>
              <span>{formatMoney(receipt.payment.amountReceived)}</span>
            </div>
          )}
          {receipt.payment.change !== undefined && receipt.payment.change > 0 && (
            <div className="flex justify-between">
              <span>Vuelto:</span>
              <span>{formatMoney(receipt.payment.change)}</span>
            </div>
          )}
        </div>
      )}

      {receipt.qrContent && (
        <div className="text-center my-2 font-bold">[QR]</div>
      )}

      <div className="text-center mt-2">
        {receipt.footer || "Gracias por su compra"}
      </div>
    </div>
  );
}
