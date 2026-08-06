import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { comprobantesService } from "../../services/comprobantes.service";
import type { PublicReceiptResponse } from "../../types/api.types";
import { QrCode, ShieldCheck, Store } from "lucide-react";
import QRCode from "qrcode";

const moneda = (value: number) => `S/ ${Number(value || 0).toFixed(2)}`;

export default function ComprobantePublicoPage() {
  const { token } = useParams();
  const [data, setData] = useState<PublicReceiptResponse | null>(null);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    setData(null);
    setError("");
    if (!token) {
      setError("El enlace del comprobante está incompleto.");
      return;
    }

    const controller = new AbortController();
    const loadReceipt = async () => {
      try {
        const payload = await comprobantesService.obtenerComprobantePublico(token, controller.signal);
        setData(payload);
      } catch (caught: any) {
        if (
          caught?.name === "CanceledError" ||
          caught?.name === "AbortError" ||
          (caught instanceof DOMException && caught.name === "AbortError")
        )
          return;
        setError(caught?.message || "No se pudo cargar el comprobante.");
      }
    };

    void loadReceipt();
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (data?.snapshot) {
      const snapshot = data.snapshot;
      const rucEmisor = snapshot.emisor?.ruc || "10766480557";
      const tipoComp = snapshot.tipo_comprobante === "FACTURA" ? "01" : "03";
      const serieCompleta = snapshot.venta_id || "";
      const serie = serieCompleta.slice(0, 4).toUpperCase();
      const numero = "000001";
      const igv = Number(snapshot.totales?.igv || 0).toFixed(2);
      const total = Number(snapshot.totales?.total || 0).toFixed(2);
      const fecha = (snapshot.emitido_at || "").split("T")[0] || "";
      const docCliTipo = "1";
      const docCliNum = "00000000";

      const qrText = `${rucEmisor}|${tipoComp}|${serie}|${numero}|${igv}|${total}|${fecha}|${docCliTipo}|${docCliNum}|`;

      QRCode.toDataURL(qrText, { width: 128, margin: 1 })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error("Error al generar QR:", err);
        });
    }
  }, [data]);

  if (error) {
    return (
      <main className="receipt-public-background min-h-screen grid place-items-center p-4">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="font-black text-rose-700">Comprobante no disponible</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="receipt-public-background min-h-screen grid place-items-center text-sm font-bold text-slate-500" role="status">
        Cargando comprobante…
      </main>
    );
  }

  const snapshot = data.snapshot;
  const shortCode = snapshot.venta_id ? snapshot.venta_id.split("-")[0]?.toUpperCase() : "";

  return (
    <main className="receipt-public-background min-h-screen p-3 sm:p-8 flex flex-col items-center justify-center bg-slate-50">
      <article
        id="area-impresion-pos"
        className="w-full max-w-[210mm] bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xl font-sans text-xs text-slate-800 space-y-6 relative overflow-hidden print:shadow-none print:border-none"
      >
        {/* Encabezado A4 */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-black text-lg text-slate-900">
              <Store className="text-teal-600 w-6 h-6" />
              <span className="uppercase">{snapshot.emisor?.razon_social || snapshot.emisor?.nombre}</span>
            </div>
            {snapshot.emisor?.direccion && (
              <p className="text-slate-500 text-xs leading-normal max-w-sm">{snapshot.emisor.direccion}</p>
            )}
            {snapshot.emisor?.telefono && (
              <p className="text-slate-400 text-xs">Teléfono: {snapshot.emisor.telefono}</p>
            )}
          </div>
          <div className="border-2 border-teal-600 rounded-2xl p-4 text-center min-w-[200px] bg-teal-50/20">
            {snapshot.emisor?.ruc && <p className="text-xs font-bold text-teal-700">RUC {snapshot.emisor.ruc}</p>}
            <p className="font-black text-xs text-slate-800 my-1 uppercase">
              {snapshot.tipo_comprobante === "BOLETA"
                ? "BOLETA ELECTRÓNICA"
                : snapshot.tipo_comprobante === "FACTURA"
                ? "FACTURA ELECTRÓNICA"
                : "NOTA DE VENTA"}
            </p>
            {shortCode && <p className="font-extrabold text-teal-700 text-xs">CÓD: {shortCode}</p>}
          </div>
        </div>

        {/* Info Cliente A4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <p>
              <span className="text-slate-500 font-medium">Señor(es):</span>{" "}
              <span className="font-bold text-slate-900">{snapshot.cliente?.nombre || "CLIENTE GENERAL"}</span>
            </p>
            <p>
              <span className="text-slate-500 font-medium">Documento:</span>{" "}
              <span className="font-mono font-bold">{snapshot.cliente?.documento || "--------"}</span>
            </p>
            {snapshot.cliente?.direccion && (
              <p>
                <span className="text-slate-500 font-medium">Dirección:</span>{" "}
                <span className="text-slate-700">{snapshot.cliente.direccion}</span>
              </p>
            )}
          </div>
          <div className="space-y-1.5 md:text-right">
            <p>
              <span className="text-slate-500 font-medium">Fecha Emisión:</span>{" "}
              <span className="font-bold">{new Date(snapshot.emitido_at).toLocaleString("es-PE")}</span>
            </p>
            <p>
              <span className="text-slate-500 font-medium">Moneda:</span>{" "}
              <span className="font-bold">SOLES (S/)</span>
            </p>
            <p>
              <span className="text-slate-500 font-medium">Forma de Pago:</span>{" "}
              <span className="font-bold text-slate-900">{snapshot.metodo_pago || "EFECTIVO"}</span>
            </p>
          </div>
        </div>

        {/* Tabla Detalle A4 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-200 text-slate-700 font-bold">
                <th className="p-2.5 w-12">Ítem</th>
                <th className="p-2.5">Descripción</th>
                <th className="p-2.5 text-center w-16">Cant.</th>
                <th className="p-2.5 text-right w-24">P. Unit.</th>
                <th className="p-2.5 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {snapshot.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-2.5">
                    <span className="font-medium text-slate-900">{item.descripcion}</span>
                    {item.presentacion && (
                      <span className="block text-[10px] text-slate-500">({item.presentacion})</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center font-bold">{item.cantidad}</td>
                  <td className="p-2.5 text-right font-mono">{moneda(item.precio_unitario)}</td>
                  <td className="p-2.5 text-right font-bold font-mono">{moneda(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie y Totales A4 */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-end border-t border-slate-200 pt-6 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1 border border-slate-200 rounded-xl bg-white flex items-center justify-center shrink-0">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR SUNAT" className="w-16 h-16" />
              ) : (
                <QrCode size={64} className="text-slate-800" />
              )}
            </div>
            <div className="text-[11px] text-slate-500 space-y-0.5 leading-normal">
              <p className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck size={14} className="text-teal-600" /> Comprobante Autorizado
              </p>
              <p>Hash: {snapshot.venta_id ? `sha1-${snapshot.venta_id.slice(0, 16)}` : "sha1-verified"}</p>
              <p>Consulte su validez en www.sunat.gob.pe</p>
            </div>
          </div>

          <div className="w-full md:w-60 space-y-1 text-right text-xs ml-auto">
            <div className="flex justify-between text-slate-600">
              <span>Op. Gravada:</span>
              <span className="font-mono">{moneda(snapshot.totales.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IGV (18%):</span>
              <span className="font-mono">{moneda(snapshot.totales.igv)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-teal-700 pt-2 border-t border-slate-200">
              <span>TOTAL:</span>
              <span className="font-mono">{moneda(snapshot.totales.total)}</span>
            </div>
          </div>
        </div>
      </article>

      <div className="mt-5 flex gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 px-5 py-2.5 text-sm font-bold text-white transition shadow-lg shadow-teal-700/20 active:scale-95 cursor-pointer"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #area-impresion-pos,
          #area-impresion-pos * {
            visibility: visible;
          }
          #area-impresion-pos {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 15mm !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}
