import { useState, useRef } from "react";
import type { ProductoItem } from "../elementosglobales/types";

interface Props {
    item: ProductoItem;
    setModal: (value: boolean) => void;
}

export default function EditarModulo({ item, setModal }: Props) {
    const [productoEditado, setProductoEditado] = useState<ProductoItem>({ ...item });
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        const camposNumericos = [
            "precio_compra",
            "precio_venta",
            "stock_total",
            "stock_minimo",
            "cantidad",
        ];

        setProductoEditado((prev) => ({
            ...prev,
            [name]: camposNumericos.includes(name) ? Number(value) : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        setProductoEditado((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const cerrarModal = () => setModal(false);

    const guardarCambios = () => {
        console.log(productoEditado); // Aquí irá tu petición al backend
        setModal(false);
    };

    return (
        <div
            ref={overlayRef}
            onClick={(e) => {
                if (e.target === overlayRef.current) cerrarModal();
            }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">
                        Editar Producto
                    </h2>

                    <button
                        onClick={cerrarModal}
                        className="text-2xl text-gray-500 hover:text-red-500"
                    >
                        ×
                    </button>
                </div>

                {/* Contenido */}
                <div className="grid grid-cols-2 gap-4">

                    <div className="col-span-2">
                        <label className="font-semibold">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={productoEditado.nombre}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="font-semibold">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={productoEditado.descripcion}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg p-2"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Precio Compra</label>
                        <input
                            type="number"
                            name="precio_compra"
                            value={productoEditado.precio_compra}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Precio Venta</label>
                        <input
                            type="number"
                            name="precio_venta"
                            value={productoEditado.precio_venta}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Stock</label>
                        <input
                            type="number"
                            name="stock_total"
                            value={productoEditado.stock_total}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg p-2"
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-7">
                        <input
                            type="checkbox"
                            name="activo"
                            checked={productoEditado.activo}
                            onChange={handleCheckboxChange}
                        />
                        <label>Activo</label>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={cerrarModal}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={guardarCambios}
                        className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                    >
                        Guardar
                    </button>
                </div>

            </div>
        </div>
    );
}