import { useState, useEffect, useMemo } from 'react';
import { ProductFilters } from './ver/ProductFilters';
import { ProductCard } from './ver/ProductCard';
import { Plus } from 'lucide-react';
import type { Producto } from './types/types';
import { FindProducts } from '../../config/api.data';
// Mock tipado con la interfaz Producto
import { ProductFormModal } from './agregar/ProductFormModal'

export default function ProductDashboard() {

    const [products, setProducts] = useState<Producto[]>([]);
    const [search, setSearch] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);

    const sucursalId = localStorage.getItem('sucursalId') || '';
    console.log(sucursalId);
    useEffect(() => {
        FindProducts().then((data) => {
            setProducts(data);
        });
    }, []);
    // Extraer categorías de forma segura
    const categories = useMemo<string[]>(() => {
        const allCats = products.map(p => p.categorias?.nombre).filter((name): name is string => !!name);
        return [...new Set(allCats)];
    }, [products]);

    // Filtrado reactivo y seguro
    const filteredProducts = useMemo<Producto[]>(() => {
        return products.filter((product) => {
            const matchesSearch =
                product.nombre_comercial.toLowerCase().includes(search.toLowerCase()) ||
                product.sku.toLowerCase().includes(search.toLowerCase()) ||
                product.medicamentos?.principios_activos?.nombre.toLowerCase().includes(search.toLowerCase());

            const matchesCategory = categoryFilter === '' || product.categorias?.nombre === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, categoryFilter]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventario de Productos</h1>
                        <p className="text-sm text-slate-500">Listado general y control de existencias del POS.</p>
                    </div>
                    <button onClick={() => setIsProductFormModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center">
                        <Plus size={18} /> Nuevo Producto
                    </button>

                    <ProductFormModal
                        isOpen={isProductFormModalOpen}
                        onClose={() => setIsProductFormModalOpen(false)}
                        sucursalId={sucursalId}
                        onSave={(data) => {
                            console.log("Datos enviados desde el modal:", data);
                            // Aquí luego llamarás a tu servicio de guardado
                        }}
                    />
                </div>

                <ProductFilters
                    search={search}
                    setSearch={setSearch}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    categories={categories}
                />

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                        <p className="text-slate-500 text-sm">No se encontraron productos con los criterios seleccionados.</p>
                    </div>
                )}

            </div>
        </div>
    );
}