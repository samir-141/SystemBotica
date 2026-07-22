import { Search, CheckCircle, AlertCircle } from 'lucide-react';
import type { Producto } from '../types/types';

interface FindSkuProps {
    identificador: string;
    isSearching: boolean;
    busquedaIntentada: boolean;
    historialEncontrado: Producto | null;
    verificarHistorial: () => void;
    setIdentificador: (identificador: string) => void;
}

export default function FindSku({ identificador, isSearching, busquedaIntentada, historialEncontrado, verificarHistorial, setIdentificador }: FindSkuProps) {
    return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Escanear Código de Barras o ingresar SKU
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Ej: 67512345678 o SKU-PARA-500MK"
                        value={identificador}
                        onChange={(e) => setIdentificador(e.target.value)}
                        disabled={busquedaIntentada && !!historialEncontrado}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="button"
                    onClick={verificarHistorial}
                    disabled={isSearching || !identificador}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {isSearching ? 'Verificando...' : 'Verificar'}
                </button>
            </div>

            {/* Avisos de Estado del Historial */}
            {busquedaIntentada && (
                <div className="mt-3">
                    {historialEncontrado ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                            <CheckCircle size={16} />
                            <span><strong>¡Historial Encontrado!</strong> El medicamento base ya existe. Solo debes ingresar los datos del lote y stock.</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                            <AlertCircle size={16} />
                            <span><strong>Producto Nuevo:</strong> No se encontraron coincidencias. Por favor rellena el catálogo completo.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}