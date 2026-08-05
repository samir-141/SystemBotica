import type { ReceiptData } from "../types/receipt.types";
import type { PrinterConfiguration } from "../types/printer.types";
import { ESC_POS } from "../constants/escpos.constants";
import { PAPER_CONFIG } from "../constants/paper.constants";
import {
  alignLeftRight,
  centerText,
  repeatCharacter,
  wrapText,
} from "../utils/text-align.utils";
import { formatMoney, formatDate, padRight, formatQuantity } from "../utils/receipt-format.utils";

export function buildReceiptCommands(
  receipt: ReceiptData,
  config: PrinterConfiguration,
): (string | Uint8Array)[] {
  const cpl = config.charactersPerLine || PAPER_CONFIG[config.paperWidth].defaultCharactersPerLine;
  const lines: string[] = [];

  lines.push(ESC_POS.INIT);
  lines.push(ESC_POS.ALIGN_CENTER);

  if (receipt.company.commercialName || receipt.company.legalName) {
    lines.push(ESC_POS.BOLD_ON);
    lines.push(centerText(receipt.company.commercialName || receipt.company.legalName, cpl));
    lines.push(ESC_POS.BOLD_OFF);
  }
  if (receipt.company.legalName && receipt.company.commercialName) {
    lines.push(centerText(receipt.company.legalName, cpl));
  }
  if (receipt.company.ruc) {
    lines.push(centerText(`RUC: ${receipt.company.ruc}`, cpl));
  }
  if (receipt.company.address) {
    lines.push(centerText(receipt.company.address, cpl));
  }
  if (receipt.company.phone) {
    lines.push(centerText(`Tel: ${receipt.company.phone}`, cpl));
  }

  lines.push(repeatCharacter("-", cpl));
  lines.push(centerText("COMPROBANTE DE VENTA", cpl));
  lines.push(repeatCharacter("-", cpl));

  lines.push(ESC_POS.ALIGN_LEFT);
  lines.push(`Tipo: ${receipt.document.type}`);
  lines.push(`Serie: ${receipt.document.series}-${receipt.document.number}`);
  lines.push(`Fecha: ${formatDate(receipt.document.issuedAt)}`);

  if (receipt.branch.name) {
    lines.push(`Sucursal: ${receipt.branch.name}`);
  }

  if (receipt.customer?.name) {
    lines.push(`Cliente: ${receipt.customer.name}`);
  }
  if (receipt.customer?.documentNumber) {
    lines.push(`${receipt.customer.documentType || "DNI"}: ${receipt.customer.documentNumber}`);
  }

  if (receipt.cashier?.name) {
    lines.push(`Cajero: ${receipt.cashier.name}`);
  }

  if (receipt.isReprint) {
    lines.push("");
    lines.push(centerText("*** REIMPRESIÓN ***", cpl));
  }

  lines.push(repeatCharacter("-", cpl));
  lines.push(
    alignLeftRight("PRODUCTO", "IMPORTE", cpl),
  );
  lines.push(repeatCharacter("-", cpl));

  for (const item of receipt.items) {
    const nameLines = wrapText(item.name, cpl);
    for (const nameLine of nameLines) {
      lines.push(nameLine);
    }

    const qtyPrice = `${formatQuantity(item.quantity)} x ${formatMoney(item.unitPrice)}`;
    const amount = formatMoney(item.subtotal);
    lines.push(alignLeftRight(qtyPrice, amount, cpl));

    if (item.presentation) {
      lines.push(`  ${item.presentation}`);
    }
  }

  lines.push(repeatCharacter("-", cpl));

  if (receipt.totals.discount && receipt.totals.discount > 0) {
    lines.push(
      alignLeftRight("Descuento:", `- ${formatMoney(receipt.totals.discount)}`, cpl),
    );
  }
  if (receipt.totals.subtotal !== undefined) {
    lines.push(
      alignLeftRight("Subtotal:", formatMoney(receipt.totals.subtotal), cpl),
    );
  }
  if (receipt.totals.igv !== undefined && receipt.totals.igv > 0) {
    lines.push(
      alignLeftRight("IGV (18%):", formatMoney(receipt.totals.igv), cpl),
    );
  }

  lines.push(ESC_POS.BOLD_ON);
  lines.push(
    alignLeftRight("TOTAL:", formatMoney(receipt.totals.total), cpl),
  );
  lines.push(ESC_POS.BOLD_OFF);

  lines.push(repeatCharacter("-", cpl));

  if (receipt.payment) {
    if (receipt.payment.method) {
      lines.push(`Pago: ${receipt.payment.method}`);
    }
    if (receipt.payment.amountReceived !== undefined) {
      lines.push(
        alignLeftRight("Recibido:", formatMoney(receipt.payment.amountReceived), cpl),
      );
    }
    if (receipt.payment.change !== undefined && receipt.payment.change > 0) {
      lines.push(
        alignLeftRight("Vuelto:", formatMoney(receipt.payment.change), cpl),
      );
    }
  }

  if (receipt.qrContent) {
    lines.push("");
    lines.push(centerText("[QR]", cpl));
  }

  lines.push("");
  if (receipt.footer) {
    lines.push(centerText(receipt.footer, cpl));
  } else {
    lines.push(centerText("Gracias por su compra", cpl));
  }

  lines.push("\n\n\n");

  if (config.autoCut) {
    lines.push(ESC_POS.CUT_PARTIAL);
  }

  return lines;
}

export function buildTestPageCommands(config: PrinterConfiguration): (string | Uint8Array)[] {
  const cpl = config.charactersPerLine || PAPER_CONFIG[config.paperWidth].defaultCharactersPerLine;
  const lines: string[] = [];

  lines.push(ESC_POS.INIT);
  lines.push(ESC_POS.ALIGN_CENTER);
  lines.push(ESC_POS.BOLD_ON);
  lines.push(centerText("MARIFARMA POS", cpl));
  lines.push(ESC_POS.BOLD_OFF);
  lines.push(centerText("PRUEBA DE IMPRESIÓN", cpl));
  lines.push(repeatCharacter("-", cpl));

  lines.push(ESC_POS.ALIGN_LEFT);
  lines.push(`Fecha: ${new Date().toLocaleString("es-PE")}`);
  lines.push(`Impresora: ${config.printerName || "N/A"}`);
  lines.push(`Papel: ${config.paperWidth}`);
  lines.push(`Caracteres/línea: ${cpl}`);
  lines.push(`Codificación: ${config.encoding}`);

  lines.push(repeatCharacter("-", cpl));
  lines.push("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ");
  lines.push("abcdefghijklmnñopqrstuvwxyz");
  lines.push("0123456789");
  lines.push("áéíóú ñ Ñ S/");

  lines.push(repeatCharacter("-", cpl));
  lines.push(centerText("Centrado", cpl));
  lines.push("Izquierda");
  lines.push(padRight("Derecha", cpl));

  lines.push(repeatCharacter("-", cpl));
  lines.push("Producto de prueba");
  lines.push(alignLeftRight("2 x 5.00", "10.00", cpl));
  lines.push(repeatCharacter("-", cpl));
  lines.push(ESC_POS.BOLD_ON);
  lines.push(alignLeftRight("TOTAL:", "10.00", cpl));
  lines.push(ESC_POS.BOLD_OFF);
  lines.push(repeatCharacter("-", cpl));
  lines.push(centerText("[QR DE PRUEBA]", cpl));
  lines.push("");
  lines.push(centerText("Fin de prueba", cpl));
  lines.push("\n\n\n");

  if (config.autoCut) {
    lines.push(ESC_POS.CUT_PARTIAL);
  }

  return lines;
}

export function buildCashDrawerCommand(): (string | Uint8Array)[] {
  return [ESC_POS.OPEN_DRAWER];
}
