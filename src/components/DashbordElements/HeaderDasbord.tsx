type PeriodoType = "1" | "7" | "30" | "90" | "all";

interface HeaderDasbordProps {
    calendario: React.ReactNode;
    Dowloand: React.ReactNode;
    periodo: PeriodoType; // Ajustado
    setPeriodo: React.Dispatch<React.SetStateAction<PeriodoType>>; // Ajustado para hacer match perfecto
}
export default function HeaderDasbord({ Dowloand, calendario, periodo, setPeriodo }: HeaderDasbordProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    📊 Dashboard de Ventas
                </h1>
                <p className="text-gray-600 mt-1">Botica - Resumen en tiempo real</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white rounded-lg border px-4 py-2">
                    {calendario}
                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value as any)}
                        className="bg-transparent focus:outline-none text-sm font-medium"
                    >
                        <option value="1">Último día</option>
                        <option value="7">Últimos 7 días</option>
                        <option value="30">Últimos 30 días</option>
                        <option value="90">Últimos 90 días</option>
                        <option value="all">Todo el período</option>
                    </select>
                </div>

                <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                    {Dowloand}
                    Exportar
                </button>
            </div>
        </div>

    )
}