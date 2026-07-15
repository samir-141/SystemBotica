
import { Plus } from "lucide-react";

interface ItemProps {
    item: {
        sku: string;
        nombre: string;
        precio_venta: number;
    };
    monedas: any[];
    monedaActivaIdx: number;
    onAgregar: () => void; // Nueva prop agregada
}

export default function Item({ item, monedas, monedaActivaIdx, onAgregar }: ItemProps) {
    const monedaActual = monedas[monedaActivaIdx] || { simbolo: "$" };

    return (
        <tr className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
            <td className="p-4 text-xs font-mono font-semibold text-slate-500 tracking-wider">
                {item.sku}
            </td>
            <td className="p-4 text-sm font-medium text-slate-800">
                {item.nombre}
            </td>
            <td className="p-4 text-sm font-bold text-slate-900 text-right">
                <span className="text-xs text-teal-600 mr-1">{monedaActual.simbolo}</span>
                {item.precio_venta.toFixed(2)}
            </td>
            <td className="p-4 text-center">
                <button
                    onClick={onAgregar}
                    className="p-1.5 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white transition-all mx-auto flex items-center gap-1 text-xs font-semibold"
                >
                    <Plus size={14} />
                    Añadir
                </button>
            </td>
        </tr>
    );
}