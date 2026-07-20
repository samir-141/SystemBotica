import { useState } from "react";
import { X, Save, AlertTriangle } from "lucide-react";
import type { ProductoItem, Lote } from "../elementosglobales/types";

interface Props {
    item: ProductoItem;
    lotes: Lote[];                    // Lotes del producto
    setModal: (value: boolean) => void;
}

export default function EditarModulo({ item, lotes, setModal }: Props) {
    const [productoEditado, setProductoEditado] = useState<ProductoItem>({ ...item });
    const [lotesEditados, setLotesEditados] = useState<Lote[]>([...lotes]);

    const handleProductoChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const camposNumericos = ["precio_compra", "precio_venta"];

        setProductoEditado((prev) => ({
            ...prev,
            [name]: camposNumericos.includes(name) ? Number(value) : value,
        }));
    };

    const handleLoteChange = (index: number, field: keyof Lote, value: string | number) => {
        const nuevosLotes = [...lotesEditados];
        nuevosLotes[index] = {
            ...nuevosLotes[index],
            [field]: field === "stock_actual" ? Number(value) : value,
        };
        setLotesEditados(nuevosLotes);
    };

    const cerrarModal = () => setModal(false);

    const guardarCambios = () => {
        console.log("Producto actualizado:", productoEditado);
        console.log("Lotes actualizados:", lotesEditados);
        // Aquí iría tu llamada al API / backend
        setModal(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-800">Editar Medicamento</h2>
                        <span className="text-sm text-slate-500 font-mono">#{item.sku}</span>
                    </div>
                    <button
                        onClick={cerrarModal}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6 space-y-8">

                    {/* Información Básica del Producto */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-slate-700">Información General</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre del Producto</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={productoEditado.nombre_comercial}
                                    onChange={handleProductoChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={productoEditado.estado}
                                    onChange={handleProductoChange}
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Precio de Compra</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="precio_compra"
                                    value={Number(productoEditado.productos_presentaciones[0].precio_actual)}
                                    onChange={handleProductoChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Precio de Venta</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="precio_venta"
                                    value={Number(productoEditado.productos_presentaciones[0].precio_actual)}
                                    onChange={handleProductoChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Unidad</label>
                                <input
                                    type="text"
                                    name="unidad"
                                    value={productoEditado.unidad_base_id}
                                    onChange={handleProductoChange}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-8">
                                <input
                                    type="checkbox"
                                    name="estado"
                                    checked={productoEditado.estado === "ACTIVO"}
                                    onChange={(e) => setProductoEditado(prev => ({ ...prev, estado: e.target.checked ? 'ACTIVO' : 'INACTIVO' }))}
                                    className="w-5 h-5 accent-teal-600"
                                />
                                <label className="font-medium text-slate-700">Producto Activo</label>
                            </div>
                        </div>
                    </div>

                    {/* Gestión de Lotes */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4 text-slate-700 flex items-center gap-2">
                            Gestión de Lotes
                            {lotesEditados.length === 0 && <AlertTriangle className="text-amber-500" size={20} />}
                        </h3>

                        {lotesEditados.length > 0 ? (
                            <div className="space-y-4">
                                {lotesEditados.map((lote, index) => (
                                    <div key={lote.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500">N° Lote</label>
                                                <input
                                                    type="text"
                                                    value={lote.numero_lote}
                                                    onChange={(e) => handleLoteChange(index, "numero_lote", e.target.value)}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">Vencimiento</label>
                                                <input
                                                    type="date"
                                                    value={lote.fecha_vencimiento}
                                                    onChange={(e) => handleLoteChange(index, "fecha_vencimiento", e.target.value)}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">Stock Actual</label>
                                                <input
                                                    type="number"
                                                    value={lote.stock_actual}
                                                    onChange={(e) => handleLoteChange(index, "stock_actual", e.target.value)}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">Stock Mínimo</label>
                                                <input
                                                    type="number"
                                                    value={lote.stock_actual}
                                                    onChange={(e) => handleLoteChange(index, "stock_actual", e.target.value)}
                                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-amber-600 text-sm italic">No hay lotes registrados para este producto.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-6 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={cerrarModal}
                        className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardarCambios}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                    >
                        <Save size={18} />
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}