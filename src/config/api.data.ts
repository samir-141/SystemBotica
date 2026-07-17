import type { VentaGrafico, ProductoItem, UsuarioItem, DetalleVenta, Categoria, TopProducto } from "../components/elementosglobales/types"; import data from "./Data.json";


function FindProducts() {
    const productos: ProductoItem[] = data.productos;
    return productos;
}
function FindUsers() {
    const users: UsuarioItem[] = data.usuarios;
    return users;
}
export const getVentasData = (): VentaGrafico[] => {
    return data.ventas.map(v => ({
        id: v.id,
        fecha: new Date(v.fecha).toLocaleDateString('es-PE'),
        total: v.total,
        cantidad_ventas: 1,
        promedio_ventas: v.total,
    }));
};

export const getTopProductos = (): TopProducto[] => {
    const detalle: DetalleVenta[] = data.detalle_venta;
    const productos: ProductoItem[] = data.productos;

    const agrupado = detalle.reduce((acc, det) => {
        const prod = productos.find(p => p.id === det.producto_id);
        if (!prod) return acc;

        if (!acc[det.producto_id]) {
            acc[det.producto_id] = {
                id: det.producto_id,
                nombre: prod.nombre,
                cantidad: 0,
                total: 0
            };
        }
        acc[det.producto_id].cantidad += det.cantidad;
        acc[det.producto_id].total += det.subtotal;
        return acc;
    }, {} as Record<string, TopProducto>);

    return Object.values(agrupado)
        .sort((a, b) => b.total - a.total);
};

export const getVentasPorCategoria = () => {
    const detalle: DetalleVenta[] = data.detalle_venta;
    const productos: ProductoItem[] = data.productos;
    const categorias: Categoria[] = data.categorias;

    const porCategoria = detalle.reduce((acc, det) => {
        const prod = productos.find(p => p.id === det.producto_id);
        if (!prod) return acc;

        const cat = categorias.find(c => c.id === prod.categoria_id);
        const nombreCat = cat?.nombre || "Sin categoría";

        if (!acc[nombreCat]) {
            acc[nombreCat] = { categoria: nombreCat, total: 0, cantidad: 0 };
        }
        acc[nombreCat].total += det.subtotal;
        acc[nombreCat].cantidad += det.cantidad;
        return acc;
    }, {} as Record<string, any>);

    return Object.values(porCategoria);
};

export const getVentasPorCajero = () => {
    const ventas = data.ventas;
    const usuarios: UsuarioItem[] = data.usuarios;

    return ventas.map(v => {
        const user = usuarios.find(u => u.id === v.usuario_id);
        return {
            cajero: user ? `${user.nombres} ${user.apellidos}` : "Desconocido",
            total: v.total
        };
    });
};

export const getMetodosPago = () => {
    const pagos = data.pagos;
    const agrupado = pagos.reduce((acc, p) => {
        acc[p.metodo] = (acc[p.metodo] || 0) + p.monto;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(agrupado).map(([metodo, monto]) => ({
        metodo,
        monto
    }));
};


export { FindProducts, FindUsers }