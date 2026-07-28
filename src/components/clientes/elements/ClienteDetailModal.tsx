import { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin, Calendar, Receipt, Loader2, FileCheck } from "lucide-react";
import { posApi } from "../../api/api.data";
import type { Cliente } from "../types";

type Props = {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
};

export default function ClienteDetailModal({ open, cliente, onClose }: Props) {
  const [detalle, setDetalle] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !cliente) return;
    setLoading(true);
    posApi.getClienteById(cliente.id)
      .then((data) => setDetalle(data))
      .catch((err) => console.error("Error al cargar detalle del cliente:", err))
      .finally(() => setLoading(false));
  }, [open, cliente]);

  if (!open || !cliente) return null;

  const esJuridico = cliente.tipo_cliente === "JURIDICO" || cliente.tipo_documento === "RUC";
  const esHabido = cliente.condicion_contribuyente === "HABIDO" || !cliente.condicion_contribuyente;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                {cliente.nombre}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-400/30">
                  {cliente.tipo_cliente || (esJuridico ? "JURÍDICO" : "NATURAL")}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {cliente.tipo_documento}: {cliente.numero_documento}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status & SUNAT bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Condición SUNAT</span>
              <span className={`font-bold flex items-center gap-1 ${esHabido ? 'text-emerald-700' : 'text-rose-700'}`}>
                <FileCheck className="w-3.5 h-3.5" />
                {cliente.condicion_contribuyente || "HABIDO"}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado ERP</span>
              <span className="font-bold text-slate-800">
                {cliente.estado || "ACTIVO"}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Límite Crédito</span>
              <span className="font-bold font-mono text-slate-900">
                S/ {(cliente.limite_credito || 0).toFixed(2)}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Deuda Pendiente</span>
              <span className={`font-bold font-mono ${(cliente.saldo_actual || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                S/ {(cliente.saldo_actual || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Contacto & Redes</span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" /> {cliente.whatsapp || cliente.telefono || "Sin teléfono"}
              </p>
              <p className="text-slate-500 truncate flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {cliente.email || "Sin email registrado"}
              </p>
              <p className="text-slate-600 flex items-start gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{cliente.direccion || "Sin dirección registrada"}</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Empresa & B2B</span>
              <p className="font-medium text-slate-700">
                <strong>Representante:</strong> {cliente.representante_legal || "N/A"}
              </p>
              <p className="font-medium text-slate-700">
                <strong>Contacto Principal:</strong> {cliente.contacto_principal || "N/A"} {cliente.cargo_contacto ? `(${cliente.cargo_contacto})` : ""}
              </p>
              {cliente.observaciones && (
                <p className="text-slate-500 italic pt-1 border-t border-slate-200 mt-1">
                  "{cliente.observaciones}"
                </p>
              )}
            </div>
          </div>

          {/* Historial de Compras */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-teal-600" />
              Historial de Compras Recientes
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> Cargando historial...
              </div>
            ) : !detalle?.ventas || detalle.ventas.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                Este cliente no registra compras aún en el POS.
              </div>
            ) : (
              <div className="space-y-2">
                {detalle.ventas.map((v: any) => (
                  <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex justify-between items-center hover:border-teal-300 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">Venta #{v.id.slice(0, 8)}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                          {v.estado || "COMPLETADO"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(v.fecha).toLocaleDateString("es-PE")} {new Date(v.fecha).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-teal-700 block">S/ {Number(v.total).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400">
                        {v.detalles_ventas?.length || 0} productos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
