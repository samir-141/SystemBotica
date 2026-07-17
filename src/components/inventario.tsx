import { useState } from "react";
import {
    Plus,
    Trash2,
    Search,
    PackageMinus,
    Barcode
} from "lucide-react";
import ProductoElemento from "./ProductoElemento";
import type { ProductoItem } from "./elementosglobales/types";

interface InventarioProps {
    data: {
        productos: ProductoItem[];
    };
}

export default function Inventario({ data }: InventarioProps) {
    const [busqueda, setBusqueda] = useState("");

    // Fallback seguro en caso de que data o productos no vengan definidos
    const listaProductos = data?.productos || [];

    // Filtrado rápido para buscar en el inventario
    const productosFiltrados = listaProductos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">

            {/* PANEL IZQUIERDO: Buscador y Lista de Productos (75%) */}
            <div className="w-3/4 p-6 flex flex-col h-full border-r border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Control de Inventario</h1>
                        <p className="text-xs text-slate-500 mt-1">Gestión interna de medicamentos y existencias</p>
                    </div>

                    {/* Buscador Integrado */}
                    <div className="relative w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar en almacén..."
                            className="w-full pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid Responsivo de Productos o Tabla */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {productosFiltrados.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                            No se encontraron medicamentos en el inventario.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {productosFiltrados.map((item: ProductoItem) => (
                                <ProductoElemento key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PANEL DERECHO: Herramientas del Administrador (25%) */}
            <div className="w-1/4 bg-white p-6 flex flex-col justify-between h-full shadow-lg">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
                        Herramientas de Stock
                    </h2>

                    {/* Botonera de Acciones rápidas */}
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-xl text-sm transition-all">
                            <span className="p-1.5 bg-teal-500 text-white rounded-lg"><Plus size={16} /></span>
                            Agregar Producto
                        </button>

                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition-all">
                            <span className="p-1.5 bg-slate-200 text-slate-600 rounded-lg"><Barcode size={16} /></span>
                            Escanear Codigo De Barras
                        </button>

                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-sm transition-all">
                            <span className="p-1.5 bg-rose-500 text-white rounded-lg"><PackageMinus size={16} /></span>
                            Ajuste de Merma / Baja
                        </button>
                    </div>
                </div>

                {/* Acción de Peligro aislada abajo */}
                <div className="border-t border-slate-100 pt-4">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 hover:bg-rose-50 text-rose-500 hover:text-rose-600 font-bold rounded-xl text-sm transition-all">
                        <Trash2 size={16} />
                        Eliminar Registro
                    </button>
                </div>
            </div>

        </div>
    );
}