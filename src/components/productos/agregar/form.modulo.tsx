import React from 'react';
import { Save } from 'lucide-react';
import type { Producto } from '../types/types';
import type { ProductFormData } from './hooks/useProductForm';

interface FormModuloProps {
    busquedaIntentada: boolean;
    historialEncontrado: Producto | null;
    formData: ProductFormData;
    setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
    onClose: () => void;
}

export default function FormModulo({
    busquedaIntentada,
    historialEncontrado,
    formData,
    setFormData,
    onClose,
}: FormModuloProps) {
    if (!busquedaIntentada) return null;

    return (
        <>
            {/* SECCIÓN 1: Datos Base del Producto (Deshabilitado si existe en el catálogo) */}
            <div className={historialEncontrado ? 'opacity-60 pointer-events-none' : ''}>
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase mb-3">
                    1. Información del Catálogo General
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Nombre Comercial
                        </label>
                        <input
                            type="text"
                            required={!historialEncontrado}
                            value={formData.nombre_comercial}
                            onChange={(e) =>
                                setFormData({ ...formData, nombre_comercial: e.target.value })
                            }
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Principio Activo
                        </label>
                        <input
                            type="text"
                            required={!historialEncontrado}
                            value={formData.principio_activo_id}
                            placeholder="Ej: Paracetamol"
                            onChange={(e) =>
                                setFormData({ ...formData, principio_activo_id: e.target.value })
                            }
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">SKU</label>
                        <input
                            type="text"
                            required={!historialEncontrado}
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Código de Barras Presentación
                        </label>
                        <input
                            type="text"
                            required={!historialEncontrado}
                            value={formData.codigo_barras}
                            onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Datos de Lote e Ingreso de Stock (Siempre Obligatorios) */}
            <div className="mt-6">
                <h3 className="text-sm font-bold tracking-wide uppercase mb-3 text-blue-600">
                    2. Datos de Stock y Lote para esta Sucursal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Número de Lote *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: LOTE-A001"
                            value={formData.numero_lote}
                            onChange={(e) => setFormData({ ...formData, numero_lote: e.target.value })}
                            className="w-full border border-blue-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Fecha de Vencimiento *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.fecha_vencimiento}
                            onChange={(e) =>
                                setFormData({ ...formData, fecha_vencimiento: e.target.value })
                            }
                            className="w-full border border-blue-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Cantidad de Unidades Ingresantes *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            placeholder="Ej: 500"
                            value={formData.stock_actual}
                            onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                            className="w-full border border-blue-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Precio de Compra (Unidad Base) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Ej: 0.20"
                            value={formData.precio_compra_unidad_base}
                            onChange={(e) =>
                                setFormData({ ...formData, precio_compra_unidad_base: e.target.value })
                            }
                            className="w-full border border-blue-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Precio de Venta al Público *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Ej: 20.00"
                            value={formData.precio_actual}
                            onChange={(e) => setFormData({ ...formData, precio_actual: e.target.value })}
                            className="w-full border border-blue-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg font-semibold transition-colors shadow-sm"
                >
                    <Save size={16} /> Guardar Inventario
                </button>
            </div>
        </>
    );
}