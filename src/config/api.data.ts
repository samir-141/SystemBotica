// src/services/api.ts
import type { UsuarioItem } from "../components/elementosglobales/types";
import type { Producto } from "../components/productos/types/types";
const API_BASE_URL = import.meta.env.VITE_API_URL; // La URL de tu servidor NestJS

// 1. Obtener Productos desde la Base de Datos
export async function FindProducts(): Promise<Producto[]> {
    const response = await fetch(`${API_BASE_URL}/productos/todos?sucursalId=b2222222-2222-2222-2222-222222222222`);
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
}

// 2. Obtener Usuarios
export async function FindUser(id: string): Promise<UsuarioItem> {
    const response = await fetch(`${API_BASE_URL}/usuarios/usuario/` + id);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
}






/*
// 3. Obtener Datos para el Gráfico de Ventas (Ya agrupados por el Backend)
export const getVentasData = async (): Promise<VentaGrafico[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/ventas-grafico`);
    if (!response.ok) throw new Error('Error al obtener datos de ventas');

    const data = await response.json();
    // Si tu backend ya devuelve la fecha formateada, la mapeas directo
    return data.map((v: any) => ({
        ...v,
        fecha: new Date(v.fecha).toLocaleDateString('es-PE'),
    }));
};

// 4. Obtener el Top de Productos más vendidos (El backend ya hizo el conteo y ordenamiento)
export const getTopProductos = async (): Promise<TopProducto[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/top-productos`);
    if (!response.ok) throw new Error('Error al obtener el top de productos');
    return response.json();
};
// prisma.service.ts (NestJS)

export const getVentasPorCajero = async () => {
    const response = await fetch(`${API_BASE_URL}/reportes/ventas-por-cajero`);
    if (!response.ok) throw new Error('Error al obtener ventas por cajero');
    return response.json();
}

// 5. Obtener Ventas por Categoría (El backend devuelve el JSON listo para el gráfico de torta)
export const getVentasPorCategoria = async (): Promise<VentaPorCategoria[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/ventas-categoria`);
    if (!response.ok) throw new Error('Error al obtener ventas por categoría');
    return response.json();
};

// 6. Obtener Métodos de Pago
export const getMetodosPago = async () => {
    const response = await fetch(`${API_BASE_URL}/reportes/metodos-pago`);
    if (!response.ok) throw new Error('Error al obtener métodos de pago');
    return response.json();
};*/