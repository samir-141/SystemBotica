import { useState, useEffect, useMemo } from "react";
import { Search, ShoppingCart, Trash2, CreditCard } from "lucide-react";

import { FindProducts } from "../config/api.data";
import Item from "../components/item";
import type { ProductoItem, ItemCarrito, Moneda } from "../components/elementosglobales/types";

export default function PestañaVenta() {
    const [productos, setProductos] = useState<ProductoItem[]>([]);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [monedaActiva, setMonedaActiva] = useState(1); // 1 = Soles
    const [cargando, setCargando] = useState(true);

    const monedas: Moneda[] = [
        { nombre: "Dólar", simbolo: "$", tipoCambio: 0.27 },
        { nombre: "Soles", simbolo: "S/", tipoCambio: 1.0 }
    ];

    const monedaActual = monedas[monedaActiva];

    // Cargar productos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await FindProducts();
                setProductos(Array.isArray(data) ? data : []);

            } catch (error) {
                console.error(error);
            } finally {
                setCargando(false);
            }
        };
        fetchData();
    }, []);

    // Filtrado
    const productosFiltrados = useMemo(() => {
        return productos.filter(p =>
            p.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase()))
        );
    }, [productos, busqueda]);

    // Acciones Carrito
    const agregarAlCarrito = (producto: ProductoItem) => {
        setCarrito(prev => {
            const existe = prev.find(i => i.id === producto.id);
            if (existe) {
                return prev.map(i => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const actualizarCantidad = (id: string, cantidad: number) => {
        if (cantidad <= 0) return eliminarDelCarrito(id);
        setCarrito(prev => prev.map(i => i.id === id ? { ...i, cantidad } : i));
    };

    const eliminarDelCarrito = (id: string) => {
        setCarrito(prev => prev.filter(i => i.id !== id));
    };

    const vaciarCarrito = () => setCarrito([]);

    // Cálculos
    // Reemplaza tu línea 69 por esta:
    const subtotal = carrito.reduce((acc, item) => acc + (Number(item.productos_presentaciones?.[0]?.precio_actual) || 0) * item.cantidad, 0); const total = subtotal * monedaActual.tipoCambio;
    const igv = total * 0.18;
    const totalFinal = total + igv;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden">
            {/* Lado Izquierdo - Productos */}
            <div className="w-3/5 p-6 flex flex-col border-r">
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar medicamento o SKU..."
                            className="w-full pl-10 py-3 rounded-xl border border-slate-200 focus:ring-teal-500"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-white rounded-xl border">
                        {monedas.map((m, i) => (
                            <button
                                key={i}
                                onClick={() => setMonedaActiva(i)}
                                className={`px-5 py-3 rounded-xl font-medium transition ${monedaActiva === i ? 'bg-teal-600 text-white' : 'hover:bg-slate-100'}`}
                            >
                                {m.simbolo} {m.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Productos - Tabla */}
                <div className="flex-1 overflow-auto bg-white rounded-2xl shadow border border-slate-200">
                    <table className="w-full min-w-full">
                        <thead className="sticky top-0 bg-slate-50 border-b z-10">
                            <tr className="text-xs uppercase text-slate-500">
                                <th className="p-4 text-left">SKU</th>
                                <th className="p-4 text-left">Medicamento</th>
                                <th className="p-4 text-right">Precio</th>
                                <th className="p-4 text-center w-32">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {productosFiltrados.map((item) => (

                                <Item
                                    key={item.id}
                                    item={{
                                        nombre_comercial: item.nombre_comercial,
                                        // Reemplaza ese bloque del objeto por este:
                                        sku: item.sku || "",
                                        precio_venta: Number(item.productos_presentaciones?.[0]?.precio_actual) || 0
                                    }}
                                    monedaActivaIdx={monedaActiva}
                                    monedas={monedas}
                                    onAgregar={() => agregarAlCarrito(item)}
                                />
                            ))}
                        </tbody>
                    </table>

                    {productosFiltrados.length === 0 && !cargando && (
                        <div className="p-12 text-center text-slate-400">
                            No se encontraron productos
                        </div>
                    )}
                </div>
            </div>

            {/* Lado Derecho - Carrito */}
            <div className="w-2/5 bg-white flex flex-col">
                <div className="p-5 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart /> Carrito
                    </h2>
                    {carrito.length > 0 && <button onClick={vaciarCarrito} className="text-rose-500">Limpiar</button>}
                </div>

                <div className="flex-1 p-4 overflow-auto space-y-3">
                    {carrito.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingCart size={70} className="mb-4 opacity-30" />
                            <p>Agrega productos para vender</p>
                        </div>
                    ) : (
                        carrito.map(item => (
                            <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.nombre_comercial}</p>
                                    <p className="text-sm text-slate-500">{item.sku}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex border rounded-lg">
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className="px-3">-</button>
                                        <span className="px-4 py-1 font-semibold">{item.cantidad}</span>
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className="px-3">+</button>
                                    </div>
                                    <button onClick={() => eliminarDelCarrito(item.id)} className="text-rose-500">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-5 border-t bg-slate-50">
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-lg">
                            <span>Total</span>
                            <span className="font-bold">{monedaActual.simbolo} {totalFinal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-2">
                        <CreditCard size={24} />
                        COBRAR
                    </button>
                </div>
            </div>
        </div>
    );
}