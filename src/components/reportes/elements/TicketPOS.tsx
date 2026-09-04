import React from "react";
import { Store, QrCode } from "lucide-react";
import type { ComprobanteData } from "./comprobanteDocument";
import type { TicketConfig } from "../../../types/ticketConfig";
import { TICKET_CONFIG_DEFAULT } from "../../../types/ticketConfig";
import { numeroALetras } from "../../../utils/numeroALetras";

export interface TicketPOSProps {
  comprobante: ComprobanteData;
  formato?: "80mm" | "58mm" | "A4";
  botica: {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono?: string;
  };
  qrCodeUrl?: string;
  displaySerieNumero?: string;
  config?: TicketConfig;
}

export const TicketPOS = React.forwardRef<HTMLDivElement, TicketPOSProps>(
  ({ comprobante, formato = "80mm", botica, qrCodeUrl, displaySerieNumero, config = TICKET_CONFIG_DEFAULT }, ref) => {
    const displaySerie =
      displaySerieNumero ||
      (comprobante.serieNumero &&
      comprobante.serieNumero.length > 20 &&
      !comprobante.serieNumero.startsWith("NV") &&
      !comprobante.serieNumero.startsWith("B") &&
      !comprobante.serieNumero.startsWith("F")
        ? `NV01-${comprobante.serieNumero.replace(/[^0-9]/g, "").padStart(8, "0").slice(-8) || "00000001"}`
        : comprobante.serieNumero);

    const cfg = config || TICKET_CONFIG_DEFAULT;
    const fontClass =
      cfg.fuenteFamilia === "sans"
        ? "font-sans"
        : cfg.fuenteFamilia === "compact"
        ? "font-mono tracking-tighter"
        : "font-mono";

    const spacingClass =
      cfg.interlineado === "compacto"
        ? "space-y-1 leading-tight"
        : cfg.interlineado === "espacioso"
        ? "space-y-2.5 leading-relaxed"
        : "space-y-1.5 leading-snug";

    // ------------------------------------------------------------- 58mm FORMAT
    if (formato === "58mm") {
      const textSizeClass =
        cfg.tamanoFuente === "sm" ? "text-[8px]" : cfg.tamanoFuente === "lg" ? "text-[10px]" : "text-[9px]";

      return (
        <div
          ref={ref}
          className={`ticket-pos-58mm bg-white p-2.5 ${fontClass} ${textSizeClass} ${spacingClass} text-black selection:bg-none`}
          style={{ width: "54mm", margin: "0 auto", backgroundColor: "#ffffff", color: "#000000" }}
        >
          {/* Logo opcional */}
          {cfg.mostrarLogo && cfg.logoUrl && (
            <div
              className={`flex mb-1.5 ${
                cfg.logoAlineacion === "left"
                  ? "justify-start"
                  : cfg.logoAlineacion === "right"
                  ? "justify-end"
                  : "justify-center"
              }`}
            >
              <img
                src={cfg.logoUrl}
                alt="Logo"
                style={{
                  maxWidth: `${Math.min(cfg.logoWidthPx || 120, 180)}px`,
                  filter: cfg.logoMonocromatico ? "grayscale(100%) contrast(150%)" : "none",
                }}
                className="h-auto object-contain"
              />
            </div>
          )}

          {/* Header */}
          <div className="text-center border-b border-dashed border-gray-400 pb-1.5">
            <p className="font-bold text-[11px] leading-snug uppercase">
              {cfg.nombreComercialPersonalizado || botica.nombre}
            </p>
            {cfg.eslogan && <p className="text-[7.5px] italic text-gray-700">{cfg.eslogan}</p>}
            {cfg.mostrarRuc && botica.ruc && <p className="text-[8px]">RUC: {botica.ruc}</p>}
            {cfg.mostrarDireccion && botica.direccion && (
              <p className="text-[7.5px] line-clamp-2">{botica.direccion}</p>
            )}
            {cfg.mostrarTelefono && botica.telefono && <p className="text-[7.5px]">Tel: {botica.telefono}</p>}

            <p className="font-bold text-[10px] uppercase mt-1">
              {comprobante.tipoComprobante === "BOLETA"
                ? "BOLETA DE VENTA ELECTRÓNICA"
                : comprobante.tipoComprobante === "FACTURA"
                ? "FACTURA ELECTRÓNICA"
                : "NOTA DE VENTA"}
            </p>
            <p className="font-bold text-[10px] font-mono">{displaySerie}</p>
          </div>

          {/* Info */}
          <div className="border-b border-dashed border-gray-400 pb-1 text-[8px] space-y-0.5">
            <p><strong>Fecha:</strong> {comprobante.fechaEmision}</p>
            {cfg.mostrarCajero && comprobante.cajero && (
              <p><strong>Atendido por:</strong> {comprobante.cajero}</p>
            )}
            {cfg.mostrarCliente && (
              <>
                <p><strong>Cliente:</strong> {comprobante.cliente.nombre}</p>
                <p>
                  <strong>{comprobante.cliente.tipoDocumento || "DOC"}:</strong>{" "}
                  {comprobante.cliente.numeroDocumento || "--------"}
                </p>
              </>
            )}
          </div>

          {/* Items */}
          <div className="border-b border-dashed border-gray-400 pb-1.5 text-[8px] space-y-1">
            <div className="flex justify-between font-bold border-b border-gray-300 pb-0.5 uppercase tracking-wider text-gray-700">
              <span>Descripción</span>
              <span className="text-right">Importe</span>
            </div>
            {comprobante.items.map((item, idx) => {
              const valorUnitario = (item.precioUnitario / 1.18).toFixed(2);
              return (
                <div key={idx} className="space-y-0.5 pt-0.5">
                  <div className="flex justify-between items-start font-bold">
                    <span className="truncate pr-1 flex-1">{item.descripcion}</span>
                    <span className="whitespace-nowrap">S/ {item.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[7px] text-gray-600">
                    <span>{item.cantidad} NIU x {item.precioUnitario.toFixed(2)}</span>
                    <span>V. Unit: {valorUnitario}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          <div className="border-b border-dashed border-gray-400 pb-1.5 text-[8px] space-y-0.5">
            <div className="flex justify-between">
              <span>Op. Gravadas:</span>
              <span>S/ {comprobante.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>IGV (18%):</span>
              <span>S/ {comprobante.igv.toFixed(2)}</span>
            </div>
            {cfg.mostrarDescuentos && comprobante.descuento !== undefined && comprobante.descuento > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Descuento:</span>
                <span>- S/ {comprobante.descuento.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-[10.5px] pt-1 border-t border-gray-300 mt-1">
              <span>TOTAL:</span>
              <span>S/ {comprobante.total.toFixed(2)}</span>
            </div>
            <div className="pt-1 text-[7px] text-gray-700 uppercase font-semibold">
              <p>SON: {numeroALetras(comprobante.total)}</p>
            </div>
            <div className="pt-1 text-[7.5px] border-t border-dashed border-gray-200 mt-1">
              <div className="flex justify-between">
                <span>Forma de Pago:</span>
                <span className="font-bold">{comprobante.metodoPago || "Contado"}</span>
              </div>
              {comprobante.montoRecibido !== undefined && (
                <div className="flex justify-between">
                  <span>Recibido:</span>
                  <span>S/ {comprobante.montoRecibido.toFixed(2)}</span>
                </div>
              )}
              {comprobante.vuelto !== undefined && comprobante.vuelto > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Vuelto:</span>
                  <span>S/ {comprobante.vuelto.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR and Footer */}
          <div className="text-center pt-1 text-[7.5px] space-y-1">
            {cfg.mostrarQR && (
              <div className="flex justify-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR SUNAT" className="w-14 h-14" />
                ) : (
                  <QrCode size={28} className="text-black" />
                )}
              </div>
            )}
            <p className="font-semibold">Representación Impresa del Comprobante</p>
            {cfg.mensajePie && (
              <p className="whitespace-pre-line text-[7px] text-gray-700 font-medium">{cfg.mensajePie}</p>
            )}
            {cfg.mensajeContacto && (
              <p className="text-[7.5px] font-bold text-gray-800">{cfg.mensajeContacto}</p>
            )}
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------- A4 FORMAT
    if (formato === "A4") {
      return (
        <div
          ref={ref}
          className="ticket-pos-a4 bg-white p-8 font-sans text-xs text-slate-800 space-y-6 max-w-2xl mx-auto"
          style={{ width: "210mm", minHeight: "297mm", backgroundColor: "#ffffff", color: "#000000" }}
        >
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div className="space-y-1">
              {cfg.mostrarLogo && cfg.logoUrl ? (
                <img
                  src={cfg.logoUrl}
                  alt="Logo"
                  style={{ maxWidth: "160px" }}
                  className="h-auto object-contain mb-2"
                />
              ) : (
                <div className="flex items-center gap-2 font-black text-lg text-slate-900">
                  <Store className="text-teal-600" />
                  <span>{cfg.nombreComercialPersonalizado || botica.nombre}</span>
                </div>
              )}
              {cfg.eslogan && <p className="text-xs text-slate-500 italic">{cfg.eslogan}</p>}
              {cfg.mostrarRuc && botica.ruc && <p className="text-slate-600 text-xs">RUC: {botica.ruc}</p>}
              {cfg.mostrarDireccion && botica.direccion && (
                <p className="text-slate-500 text-xs">{botica.direccion}</p>
              )}
              {cfg.mostrarTelefono && botica.telefono && (
                <p className="text-slate-500 text-xs">Tel: {botica.telefono}</p>
              )}
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
              <p className="font-extrabold text-teal-700 text-sm font-mono">{displaySerie}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <p>
                <span className="text-slate-500 font-medium">Señor(es):</span>{" "}
                <span className="font-bold text-slate-900">{comprobante.cliente.nombre}</span>
              </p>
              <p>
                <span className="text-slate-500 font-medium">{comprobante.cliente.tipoDocumento || "Documento"}:</span>{" "}
                <span className="font-mono font-bold">{comprobante.cliente.numeroDocumento || "--------"}</span>
              </p>
              {comprobante.cliente.direccion && (
                <p>
                  <span className="text-slate-500 font-medium">Dirección:</span>{" "}
                  <span className="text-slate-700">{comprobante.cliente.direccion}</span>
                </p>
              )}
            </div>
            <div className="space-y-1.5 text-right">
              <p>
                <span className="text-slate-500 font-medium">Fecha Emisión:</span>{" "}
                <span className="font-bold">{comprobante.fechaEmision}</span>
              </p>
              {cfg.mostrarCajero && comprobante.cajero && (
                <p>
                  <span className="text-slate-500 font-medium">Cajero / Vendedor:</span>{" "}
                  <span className="font-bold">{comprobante.cajero}</span>
                </p>
              )}
              <p>
                <span className="text-slate-500 font-medium">Moneda:</span>{" "}
                <span className="font-bold">SOLES (S/)</span>
              </p>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-200">
                <th className="py-2 px-3 font-bold">Cant.</th>
                <th className="py-2 px-3 font-bold">Descripción</th>
                <th className="py-2 px-3 font-bold text-right">P. Unit</th>
                <th className="py-2 px-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {comprobante.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 px-3 font-bold">{item.cantidad}</td>
                  <td className="py-2 px-3">{item.descripcion}</td>
                  <td className="py-2 px-3 text-right">S/ {item.precioUnitario.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right font-bold">S/ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-end pt-4 border-t border-slate-200">
            <div className="space-y-2">
              {cfg.mostrarQR && (
                <div className="w-24 h-24 border border-slate-200 rounded-xl flex items-center justify-center p-1 bg-white">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR SUNAT" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode size={48} className="text-slate-400" />
                  )}
                </div>
              )}
              <p className="text-[10px] text-slate-500 max-w-xs leading-tight whitespace-pre-line">
                {cfg.mensajePie || "Representación impresa de Comprobante Electrónico"}
              </p>
              {cfg.mensajeContacto && (
                <p className="text-[11px] font-bold text-slate-700">{cfg.mensajeContacto}</p>
              )}
            </div>
            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between">
                <span className="text-slate-500">Op. Gravada:</span>
                <span className="font-bold">S/ {comprobante.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IGV (18%):</span>
                <span className="font-bold">S/ {comprobante.igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t-2 border-slate-900 pt-1.5 text-slate-900">
                <span>TOTAL:</span>
                <span>S/ {comprobante.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------- 80mm FORMAT (DEFAULT POS)
    const textSizeClass =
      cfg.tamanoFuente === "sm" ? "text-[9px]" : cfg.tamanoFuente === "lg" ? "text-[11.5px]" : "text-[10px]";

    return (
      <div
        ref={ref}
        className={`ticket-pos-80mm bg-white p-4 ${fontClass} ${textSizeClass} ${spacingClass} text-black selection:bg-none`}
        style={{ width: "72mm", margin: "0 auto", backgroundColor: "#ffffff", color: "#000000" }}
      >
        {/* Logo Opcional */}
        {cfg.mostrarLogo && cfg.logoUrl && (
          <div
            className={`flex mb-2 ${
              cfg.logoAlineacion === "left"
                ? "justify-start"
                : cfg.logoAlineacion === "right"
                ? "justify-end"
                : "justify-center"
            }`}
          >
            <img
              src={cfg.logoUrl}
              alt="Logo"
              style={{
                maxWidth: `${Math.min(cfg.logoWidthPx || 140, 240)}px`,
                filter: cfg.logoMonocromatico ? "grayscale(100%) contrast(150%)" : "none",
              }}
              className="h-auto object-contain"
            />
          </div>
        )}

        {/* Encabezado */}
        <div className="text-center border-b border-dashed border-gray-400 pb-2">
          <p className="font-black text-sm leading-snug uppercase">
            {cfg.nombreComercialPersonalizado || botica.nombre}
          </p>
          {cfg.eslogan && <p className="text-[9px] italic text-gray-700 my-0.5">{cfg.eslogan}</p>}
          {cfg.mostrarRuc && botica.ruc && <p className="text-[9px]">RUC: {botica.ruc}</p>}
          {cfg.mostrarDireccion && botica.direccion && (
            <p className="text-[8.5px] line-clamp-2">{botica.direccion}</p>
          )}
          {cfg.mostrarTelefono && botica.telefono && <p className="text-[8.5px]">Tel: {botica.telefono}</p>}

          <div className="mt-1.5 pt-1 border-t border-dashed border-gray-300">
            <p className="font-bold text-[11px] uppercase">
              {comprobante.tipoComprobante === "BOLETA"
                ? "BOLETA DE VENTA ELECTRÓNICA"
                : comprobante.tipoComprobante === "FACTURA"
                ? "FACTURA ELECTRÓNICA"
                : "NOTA DE VENTA"}
            </p>
            <p className="font-extrabold text-[12px] font-mono tracking-wider">{displaySerie}</p>
          </div>
        </div>

        {/* Info del Comprobante y Cliente */}
        <div className="border-b border-dashed border-gray-400 py-1.5 text-[9px] space-y-0.5">
          <div className="flex justify-between">
            <span>Fecha: {comprobante.fechaEmision}</span>
            <span>Moneda: Soles</span>
          </div>
          {cfg.mostrarCajero && comprobante.cajero && (
            <p>Cajero: {comprobante.cajero}</p>
          )}
          {cfg.mostrarCliente && (
            <>
              <p className="truncate">Cliente: {comprobante.cliente.nombre}</p>
              <p>
                {comprobante.cliente.tipoDocumento || "DOC"}: {comprobante.cliente.numeroDocumento || "--------"}
              </p>
            </>
          )}
        </div>

        {/* Detalle de Productos */}
        <div className="border-b border-dashed border-gray-400 py-1.5 space-y-1">
          <div className="flex justify-between font-bold text-[9.5px] border-b border-gray-300 pb-0.5 uppercase tracking-wider text-gray-700">
            <span>Descripción</span>
            <span className="text-right">Importe</span>
          </div>

          {comprobante.items.map((item, idx) => {
            const valorUnitario = (item.precioUnitario / 1.18).toFixed(2);
            return (
              <div key={idx} className="space-y-0.5 pt-0.5">
                <div className="flex justify-between items-start font-bold text-[9.5px]">
                  <span className="truncate pr-1 flex-1">{item.descripcion}</span>
                  <span className="whitespace-nowrap">S/ {item.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[8px] text-gray-600">
                  <span>{item.cantidad} NIU x {item.precioUnitario.toFixed(2)}</span>
                  <span>V. Unit: {valorUnitario}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Liquidación y Totales */}
        <div className="border-b border-dashed border-gray-400 py-1.5 text-[9.5px] space-y-0.5">
          <div className="flex justify-between">
            <span>Op. Gravadas:</span>
            <span>S/ {comprobante.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IGV (18%):</span>
            <span>S/ {comprobante.igv.toFixed(2)}</span>
          </div>
          {cfg.mostrarDescuentos && comprobante.descuento !== undefined && comprobante.descuento > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Descuento Total:</span>
              <span>- S/ {comprobante.descuento.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-gray-300 mt-1">
            <span>TOTAL:</span>
            <span>S/ {comprobante.total.toFixed(2)}</span>
          </div>
          <div className="pt-1 text-[8px] text-gray-700 uppercase font-semibold">
            <p>SON: {numeroALetras(comprobante.total)}</p>
          </div>

          <div className="pt-1 text-[8.5px] border-t border-dashed border-gray-200 mt-1">
            <div className="flex justify-between">
              <span>Forma de Pago:</span>
              <span className="font-bold">{comprobante.metodoPago || "Contado"}</span>
            </div>
            {comprobante.montoRecibido !== undefined && (
              <div className="flex justify-between">
                <span>Monto Recibido:</span>
                <span>S/ {comprobante.montoRecibido.toFixed(2)}</span>
              </div>
            )}
            {comprobante.vuelto !== undefined && comprobante.vuelto > 0 && (
              <div className="flex justify-between font-bold">
                <span>Vuelto:</span>
                <span>S/ {comprobante.vuelto.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR y Mensajes Finales */}
        <div className="text-center pt-2 text-[8px] space-y-1.5">
          {cfg.mostrarQR && (
            <div className="flex justify-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR SUNAT" className="w-20 h-20" />
              ) : (
                <QrCode size={36} className="text-black" />
              )}
            </div>
          )}
          <p className="font-bold text-[8.5px]">Representación Impresa del Comprobante Electrónico</p>
          {cfg.mensajePie && (
            <p className="whitespace-pre-line text-[8px] text-gray-700">{cfg.mensajePie}</p>
          )}
          {cfg.mensajeContacto && (
            <p className="font-black text-[9px] text-gray-900 pt-0.5">{cfg.mensajeContacto}</p>
          )}

          {cfg.mostrarCodigoBarras && (
            <div className="pt-1 flex flex-col items-center justify-center">
              <div className="font-mono text-[10px] tracking-widest border border-black px-3 py-1 font-bold">
                *{displaySerie.replace(/[^a-zA-Z0-9]/g, "")}*
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TicketPOS.displayName = "TicketPOS";
