import { X } from "lucide-react"
interface CabeceraModuloProps {
    onClose: () => void;
}

export default function CabeceraModulo({ onClose }: CabeceraModuloProps) {
    return (
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Ingreso de Inventario</h2>
                <p className="text-xs text-slate-500">Paso 1: Verificar duplicados mediante SKU o Código de Barras</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X size={20} />
            </button>
        </div>)
}