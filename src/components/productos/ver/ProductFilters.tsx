import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ProductFiltersProps {
    search: string;
    setSearch: (value: string) => void;
    categoryFilter: string;
    setCategoryFilter: (value: string) => void;
    categories: string[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    categories,
}) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, SKU o principio activo..."
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700"
                />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Filter size={16} className="text-slate-500" />
                <select
                    value={categoryFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
                    className="w-full md:w-56 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};