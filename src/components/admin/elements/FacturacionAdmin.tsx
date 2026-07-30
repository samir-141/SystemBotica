// src/components/admin/elements/FacturacionAdmin.tsx
import { useState } from "react";
import { FileText, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { posApi } from "../../api/api.data";

type Props = {};

export default function FacturacionAdmin(_props: Props) {
  const [emitiendo, setEmitiendo] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmitir = async () => {
    setEmitiendo(true);
    setError(null);
    try {
      const payload = {
        tipoDocumento: "03",
        serie: "B001",
        correlativo: 1,
        fechaEmision: new Date().toISOString(),
        moneda: "PEN",
        cliente: {
          tipoDocumento: "1",
          numeroDocumento: "72456189",
          razonSocial: "CLIENTE VARIOS",
          direccion: "Lima, Perú",
        },
        items: [
          {
            codigoProducto: "PROD-001",
            descripcion: "Producto de prueba",
            unidadMedida: "NIU",
            cantidad: 1,
            valorUnitario: 10,
            precioUnitario: 11.8,
            subtotal: 10,
            igv: 1.8,
            total: 11.8,
            tipoAfectacionIgv: "10",
          },
        ],
        totalGravadas: 10,
        totalExoneradas: 0,
        totalInafectas: 0,
        totalIgv: 1.8,
        importeTotal: 11.8,
      };
      const res = await posApi.emitirComprobante(payload);
      setUltimoResultado(res);
    } catch (err: any) {
      setError(err.message || "Error al emitir comprobante");
    } finally {
      setEmitiendo(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900">Emisión de Comprobantes</h2>
          <p className="text-[10px] text-slate-400 font-medium">Prueba el flujo de facturación electrónica SUNAT</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {ultimoResultado && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Comprobante emitido exitosamente
          </div>
          <pre className="text-[10px] bg-white/60 p-2 rounded-lg overflow-x-auto">
            {JSON.stringify(ultimoResultado, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={handleEmitir}
        disabled={emitiendo}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer disabled:bg-slate-200"
      >
        {emitiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {emitiendo ? "Emitiendo..." : "Emitir Comprobante de Prueba"}
      </button>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <p className="font-bold text-slate-700">Nota:</p>
        <p>El backend actual devuelve un stub. La integración completa con SUNAT (firma digital, envío, CDR, PDF) está planificada.</p>
      </div>
    </div>
  );
}
