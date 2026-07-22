import React from 'react';
import { Layers, Beaker, ShieldAlert, BarChart3, Tag } from 'lucide-react';
import type { Producto } from '../types/types';

interface ProductCardProps {
    product: Producto;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const {
        nombre_comercial,
        sku,
        medicamentos,
        laboratorios,
        categorias,
        stock_total = 0,
        productos_presentaciones
    } = product;

    const isLowStock = stock_total < 50;
    const primerPresentacion = productos_presentaciones?.[0];

    // Formateo seguro para evitar crash si precio_actual viene como string, null o undefined
    const precioFormateado = React.useMemo(() => {
        if (!primerPresentacion?.precio_actual) return '0.00';
        const precio = Number(primerPresentacion.precio_actual);
        return isNaN(precio) ? '0.00' : precio.toFixed(2);
    }, [primerPresentacion?.precio_actual]);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                        {categorias?.nombre || 'Sin Categoría'}
                    </span>
                    {isLowStock && (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <ShieldAlert size={12} /> Stock Bajo
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                    {nombre_comercial}
                </h3>
                {sku && <p className="text-xs text-slate-500 font-mono mb-3">{sku}</p>}

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                        <Beaker size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">
                            <strong className="font-medium text-slate-700">
                                {medicamentos?.principios_activos?.nombre || 'N/A'}
                            </strong>
                            {` (${medicamentos?.concentracion ?? ''}${medicamentos?.unidad_concentracion ?? ''} - ${medicamentos?.formas_farmaceuticas?.nombre ?? ''})`}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Layers size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate text-xs">
                            {laboratorios?.nombre || 'Laboratorio N/A'}
                            {laboratorios?.pais && (
                                <span className="text-slate-400"> ({laboratorios.pais})</span>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mb-0.5">
                            <Tag size={12} /> Precio Ref.
                        </span>
                        <span className="text-xl font-extrabold text-slate-900">
                            S/ {precioFormateado}
                        </span>
                        {primerPresentacion && (
                            <span className="text-[10px] text-slate-400 block">
                                x {primerPresentacion.cantidad_unidad_base}{' '}
                                {primerPresentacion.unidades_presentacion?.abreviatura}
                            </span>
                        )}
                    </div>

                    <div className="text-right">
                        <span className="text-xs text-slate-400 flex items-center gap-1 justify-end mb-0.5">
                            <BarChart3 size={12} /> Disp.
                        </span>
                        <span
                            className={`text-base font-bold ${isLowStock ? 'text-amber-600' : 'text-emerald-600'
                                }`}
                        >
                            {stock_total} u.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};