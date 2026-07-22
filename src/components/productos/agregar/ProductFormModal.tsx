import React, { useState } from 'react';
import {
    CabeceraModulo,
    FindSku,
    FormModulo,
    productosService
} from './export/export.module';
import { useProductForm } from './hooks/useProductForm';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    sucursalId: string;
    onSave?: (result: any) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    isOpen,
    onClose,
    sucursalId,
    onSave
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        identificador,
        setIdentificador,
        isSearching,
        historialEncontrado,
        formData,
        setFormData,
        verificarHistorial,
        busquedaIntentada,
        resetForm
    } = useProductForm(sucursalId);

    const handleClose = () => {
        resetForm();
        setErrorMessage(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const payload = {
                sucursal_id: sucursalId,
                medicamento: {
                    isNew: !historialEncontrado,
                    id: historialEncontrado?.medicamentos?.id || undefined,
                    principio_activo_id: formData.principio_activo_id,
                    forma_farmaceutica_id: formData.forma_farmaceutica_id,
                    concentracion: Number(formData.concentracion) || 0,
                    unidad_concentracion: formData.unidad_concentracion || 'mg',
                    via_administracion: formData.via_administracion || 'ORAL',
                },
                productoComercial: {
                    isNew: !historialEncontrado,
                    id: historialEncontrado?.id || undefined,
                    nombre_comercial: formData.nombre_comercial,
                    sku: formData.sku || undefined,
                    codigo_interno: formData.codigo_interno || undefined,
                    laboratorio_id: formData.laboratorio_id,
                    categoria_id: formData.categoria_id,
                    unidad_base_id: formData.unidad_base_id,
                },
                presentacion: {
                    unidad_presentacion_id: formData.unidad_presentacion_id,
                    cantidad_unidad_base: Number(formData.cantidad_unidad_base) || 1,
                    codigo_barras: formData.codigo_barras || undefined,
                    precio_actual: Number(formData.precio_actual) || 0,
                },
                lote: {
                    numero_lote: formData.numero_lote,
                    fecha_vencimiento: formData.fecha_vencimiento,
                    stock_actual: Number(formData.stock_actual) || 0,
                    precio_compra_unidad_base: Number(formData.precio_compra_unidad_base) || 0,
                }
            };

            const response = await productosService.guardarInventario(payload);

            if (onSave) {
                onSave(response);
            }
            handleClose();
        } catch (error: any) {
            console.error('Error al guardar el producto:', error);
            setErrorMessage(error.message || 'Ocurrió un error inesperado al guardar el inventario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <CabeceraModulo onClose={handleClose} />

                <form
                    onSubmit={handleSubmit}
                    className={`p-6 overflow-y-auto space-y-6 ${isSubmitting ? 'pointer-events-none opacity-70' : ''}`}
                >
                    {errorMessage && (
                        <div className="p-3 text-xs font-semibold bg-red-50 border border-red-200 text-red-600 rounded-lg">
                            {errorMessage}
                        </div>
                    )}

                    <FindSku
                        identificador={identificador}
                        setIdentificador={setIdentificador}
                        isSearching={isSearching}
                        busquedaIntentada={busquedaIntentada}
                        historialEncontrado={historialEncontrado}
                        verificarHistorial={verificarHistorial}
                    />

                    <FormModulo
                        busquedaIntentada={busquedaIntentada}
                        historialEncontrado={historialEncontrado}
                        formData={formData}
                        setFormData={setFormData}
                        onClose={handleClose}
                    />
                </form>
            </div>
        </div>
    );
};