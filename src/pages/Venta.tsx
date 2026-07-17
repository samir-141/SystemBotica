import { useState } from "react";
import { Search, ShoppingCart, Trash2, CreditCard, RotateCcw, Coins } from "lucide-react";

import { FindProducts } from "../config/api.data";
import Item from "../components/item";
import type { ProductoItem, ItemCarrito, Moneda } from "../components/elementosglobales/types"; // Ajusta la ruta

export default function PestañaVenta() {
    // 1. Estados principales
    const [productos] = useState<ProductoItem[]>(FindProducts());

    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [busqueda, setBusqueda] = useState<string>("");
    const [monedaActiva, setMonedaActiva] = useState<number>(1); // 0: Dólar, 1: Soles (Default)

    // Configuración estructurada de monedas con factor de conversión
    const monedas: Moneda[] = [
        { nombre: "Dólar", simbolo: "$", tipoCambio: 0.27 }, // Conversión aprox (1 Sol = 0.27 USD)
        { nombre: "Soles", simbolo: "S/", tipoCambio: 1.0 }
    ];

    const monedaActual = monedas[monedaActiva];

    // 2. Filtrado de productos para la búsqueda rápida
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase())
    );

    // 3. Acciones del Carrito de Ventas
    const agregarAlCarrito = (producto: ProductoItem) => {
        setCarrito(prevCarrito => {
            const existe = prevCarrito.find(item => item.id === producto.id);
            if (existe) {
                // Validación opcional: No exceder el stock disponible

            }
            return [...prevCarrito, { ...producto, cantidad: 1 }];
        });
    };

    const actualizarCantidad = (id: string, nuevaCantidad: number) => {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(id);
            return;
        }
        setCarrito(prev => prev.map(item =>
            item.id === id ? { ...item, cantidad: nuevaCantidad } : item
        ));
    };

    const eliminarDelCarrito = (id: string) => {
        setCarrito(prev => prev.filter(item => item.id !== id));
    };

    const vaciarCarrito = () => {
        setCarrito([]);
    };

    // 4. Cálculos Financieros en Tiempo Real
    // Calcula los totales en la moneda base (Soles) y luego los convierte a la moneda seleccionada
    const subtotalSoles = carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
    const totalConvertido = subtotalSoles * monedaActual.tipoCambio;
    const igvOiva = totalConvertido * 0.18; // 18% impuesto regulado
    const netoAPagar = totalConvertido + igvOiva;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">

            {/* SECCIÓN IZQUIERDA: Búsqueda y Selección de Productos (60%) */}
            <div className="w-3/5 p-6 flex flex-col h-full border-r border-slate-200">

                {/* Header e Input de Búsqueda */}
                <div className="flex items-center justify-between mb-4 gap-4">
                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por descripción o código SKU..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition-all"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Selector de Monedas */}
                    <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        {monedas.map((mon, idx) => (
                            <button
                                key={mon.nombre}
                                onClick={() => setMonedaActiva(idx)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${monedaActiva === idx
                                    ? "bg-teal-500 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                <Coins size={12} />
                                {mon.nombre} ({mon.simbolo})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabla de Productos */}
                <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-slate-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                                <th className="p-4">SKU</th>
                                <th className="p-4">Medicamento</th>
                                <th className="p-4 text-right">Precio ({monedaActual.simbolo})</th>
                                <th className="p-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {productosFiltrados.map((item) => (
                                <Item
                                    key={item.id}
                                    // Pasamos el objeto mapeando el precio de venta según la tasa de cambio seleccionada
                                    item={{
                                        ...item,
                                        precio_venta: item.precio_venta * monedaActual.tipoCambio
                                    }}
                                    monedas={monedas}
                                    monedaActivaIdx={monedaActiva}
                                    onAgregar={() => agregarAlCarrito(item)} // Callback para interactuar con la tabla
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECCIÓN DERECHA: Detalle del Cobro y Carrito Activo (40%) */}
            <div className="w-2/5 bg-white flex flex-col h-full shadow-lg">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingCart className="text-teal-500" size={20} />
                        Venta en Progreso
                    </h2>
                    {carrito.length > 0 && (
                        <button
                            onClick={vaciarCarrito}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
                        >
                            <RotateCcw size={14} />
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Lista de Items en el Carrito */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {carrito.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCart size={48} className="mb-2 stroke-1" />
                            <p className="text-sm">Agrega productos para iniciar</p>
                        </div>
                    ) : (
                        carrito.map((item) => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 hover:shadow-sm transition-all">
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold text-slate-800 truncate">{item.nombre}</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Precio Unit: {monedaActual.simbolo} {(item.precio_venta * monedaActual.tipoCambio).toFixed(2)}
                                    </p>
                                </div>

                                {/* Controles de cantidad */}
                                <div className="flex items-center gap-2 mx-4">
                                    <button
                                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                        className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-100"
                                    >
                                        -
                                    </button>
                                    <span className="text-sm font-bold w-6 text-center text-slate-800">{item.cantidad}</span>
                                    <button
                                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                        className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-100"
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="text-right flex items-center gap-3">
                                    <span className="font-bold text-sm text-slate-900">
                                        {monedaActual.simbolo} {((item.precio_venta * item.cantidad) * monedaActual.tipoCambio).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => eliminarDelCarrito(item.id)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Resumen Financiero y Botonera */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    <div className="space-y-2 mb-4 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{monedaActual.simbolo} {totalConvertido.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Impuesto (18%):</span>
                            <span>{monedaActual.simbolo} {igvOiva.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-extrabold text-slate-950 border-t border-slate-200 pt-2">
                            <span>TOTAL:</span>
                            <span className="text-teal-600">{monedaActual.simbolo} {netoAPagar.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button

                            className="w-full py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            Escanear Codigo De Barras
                        </button>
                        <button
                            disabled={carrito.length === 0}
                            onClick={vaciarCarrito}
                            className="w-full py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={carrito.length === 0}
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md shadow-teal-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                        >
                            <CreditCard size={18} />
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}