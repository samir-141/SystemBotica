interface FiltrosProps {
    icon: React.ReactNode;
    categoriaFiltro: string;
    setCategoriaFiltro: (value: string) => void;
    porCategoriaRaw: any[];
}
export default function Filtros({ icon, categoriaFiltro, setCategoriaFiltro, porCategoriaRaw }: FiltrosProps) {
    return (
        <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
                {icon}
                <span className="font-medium">Filtros:</span>
            </div>

            <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="all">Todas las categorías</option>
                {porCategoriaRaw.map(cat => (
                    <option key={cat.categoria} value={cat.categoria}>{cat.categoria}</option>
                ))}
            </select>
        </div>
    )
}