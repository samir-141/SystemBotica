import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Search,
    PackageMinus,
    Barcode,
    Loader2
} from "lucide-react";
import ProductoElemento from "./ProductoElemento";
import type { ProductoItem } from "./elementosglobales/types";
import { FindProducts } from "../config/api.data";
export default function Inventario() {
    const [busqueda, setBusqueda] = useState("");
    const [productos, setProductos] = useState<ProductoItem[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ==================== FETCH DE PRODUCTOS ====================
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setCargando(true);
                setError(null);

                const data = await FindProducts(); // Cambia la URL según tu entorno
                console.log(data);
                const listaProductos = data;
                setProductos(listaProductos);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'No se pudo cargar el inventario');
            } finally {
                setCargando(false);
            }
        };

        cargarProductos();
    }, []);

    // ==================== FILTRADO ====================
    const productosFiltrados = productos.filter(p =>
        p.nombre_comercial?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (error) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-slate-100">
                <div className="text-center">
                    <p className="text-red-600 mb-2">⚠️ {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-teal-600 hover:underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">

            {/* PANEL IZQUIERDO */}
            <div className="w-3/4 p-6 flex flex-col h-full border-r border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Control de Inventario</h1>
                        <p className="text-xs text-slate-500 mt-1">Gestión interna de medicamentos y existencias</p>
                    </div>

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

                <div className="flex-1 overflow-y-auto pr-2">
                    {cargando ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                        </div>
                    ) : productosFiltrados.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                            No se encontraron medicamentos en el inventario.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {productosFiltrados.map((item) => (
                                <ProductoElemento key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PANEL DERECHO - Herramientas */}
            <div className="w-1/4 bg-white p-6 flex flex-col justify-between h-full shadow-lg">
                {/* ... tu panel derecho se mantiene igual ... */}
                <div>
                    <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-6">
                        Herramientas de Stock
                    </h2>

                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-xl text-sm transition-all">
                            <span className="p-1.5 bg-teal-500 text-white rounded-lg"><Plus size={16} /></span>
                            Agregar Producto
                        </button>

                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm transition-all">
                            <span className="p-1.5 bg-slate-200 text-slate-600 rounded-lg"><Barcode size={16} /></span>
                            Escanear Código De Barras
                        </button>

                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-sm transition-all">
                            <span className="p-1.5 bg-rose-500 text-white rounded-lg"><PackageMinus size={16} /></span>
                            Ajuste de Merma / Baja
                        </button>
                    </div>
                </div>

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