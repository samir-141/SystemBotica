import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { comprobantesService } from "../../services/comprobantes.service";
import type { PublicReceiptResponse } from "../../types/api.types";

const moneda = (value: number) => `S/ ${Number(value || 0).toFixed(2)}`;

export default function ComprobantePublicoPage() {
  const { token } = useParams();
  const [data, setData] = useState<PublicReceiptResponse | null>(null);
  const [error, setError] = useState("");

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
        if (caught?.name === "CanceledError" || caught?.name === "AbortError" || (caught instanceof DOMException && caught.name === "AbortError")) return;
        setError(caught?.message || "No se pudo cargar el comprobante.");
      }
    };

    void loadReceipt();
    return () => controller.abort();
  }, [token]);

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
  return (
    <main className="receipt-public-background min-h-screen p-3 sm:p-8">
      <article className="mx-auto max-w-[210mm] bg-white p-6 shadow-sm sm:p-10 print:shadow-none print:p-0">
        <header className="border-b-2 border-slate-900 pb-4">
          <h1 className="text-xl font-black">{snapshot.emisor?.razon_social || snapshot.emisor?.nombre}</h1>
          <p className="text-sm">RUC: {snapshot.emisor?.ruc || "—"}</p>
          <p className="text-xs text-slate-500">{snapshot.emisor?.direccion || ""}</p>
          <h2 className="mt-4 text-right text-lg font-black">{snapshot.tipo_comprobante}</h2>
          <p className="text-right text-xs">Emisión: {new Date(snapshot.emitido_at).toLocaleString("es-PE")}</p>
        </header>
        <section className="my-5 text-sm">
          <b>Cliente:</b> {snapshot.cliente?.nombre || "CLIENTE VARIOS"}<br/>
          <span className="text-slate-500">{snapshot.cliente?.documento || ""}</span>
        </section>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-slate-300 text-left">
                <th className="py-2">Descripción</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">P. unit.</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.items.map((item, index) => (
                <tr key={item.id || `${item.descripcion}-${index}`} className="border-b border-slate-100">
                  <td className="py-2">{item.descripcion}<span className="block text-xs text-slate-500">{item.presentacion}</span></td>
                  <td className="py-2 text-right">{item.cantidad}</td>
                  <td className="py-2 text-right">{moneda(item.precio_unitario)}</td>
                  <td className="py-2 text-right">{moneda(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="ml-auto mt-5 w-56 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><b>{moneda(snapshot.totales.subtotal)}</b></p>
          <p className="flex justify-between"><span>IGV</span><b>{moneda(snapshot.totales.igv)}</b></p>
          <p className="mt-2 flex justify-between border-t-2 border-slate-900 pt-2 text-lg"><span>Total</span><b>{moneda(snapshot.totales.total)}</b></p>
        </section>
        <footer className="mt-10 text-center text-xs text-slate-500">Documento verificable · Diseño {data.plantilla_version}</footer>
      </article>
      <div className="mx-auto mt-4 flex max-w-[210mm] justify-center gap-2 print:hidden">
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white">
          Imprimir / Guardar PDF
        </button>
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-public-background,
          .receipt-public-background * {
            visibility: visible;
          }
          .receipt-public-background {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
          }
          .receipt-public-background article {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}
