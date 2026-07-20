// src/config/types.ts

// ===========================================================================
// 1. ENTIDADES DEL CATÁLOGO (Reflejo exacto del DDL y los Includes de Prisma)
// ===========================================================================

export interface MenuItemType {

    label: string;
    icon: React.ReactNode;
    url?: string;
    submenu?: {
        url: string;
        label: string;
    }[];
}

export interface Categoria {
    id: string;
    nombre: string;
}

export interface Laboratorio {
    id: string;
    nombre: string;
    pais?: string;
    telefono?: string;
    email?: string;
}

export interface PrincipioActivo {
    id: string;
    nombre: string;
    descripcion?: string;
}

export interface FormaFarmaceutica {
    id: string;
    nombre: string;
}

export interface UnidadPresentacion {
    id: string;
    nombre: string;
    abreviatura: string;
}

export interface Medicamento {
    id: string;
    principio_activo_id: string;
    forma_farmaceutica_id: string;
    concentracion: number;
    unidad_concentracion: string;
    via_administracion: string;
    requiere_receta: boolean;
    afecto_igv: boolean;
    // Includes de Prisma:
    principios_activos?: PrincipioActivo;
    formas_farmaceuticas?: FormaFarmaceutica;
}


export interface ProductoPresentacion {
    id: string;
    cantidad_unidad_base: number;
    codigo_barras: string;
    precio_actual: string;
    orden: number;
    unidades_presentacion: {
        id: string;
        nombre: string;
        abreviatura: string;
    }
}

export interface Lote {
    id: string;
    producto_comercial_id: string;
    detalle_compra_id?: string;
    sucursal_id: string;
    numero_lote: string;
    fecha_fabricacion?: string;
    fecha_vencimiento: string;
    precio_compra_unidad_base: number;
    stock_actual: number;
    fecha_ingreso: string;
    // Includes opcionales:
    productos_comerciales?: ProductoItem;
}

export interface UsuarioItem {
    id: string;
    nombre: string;
    correo: string;
    estado: 'ACTIVO' | 'INACTIVO';
    roles: string[];
}

// ===========================================================================
// 2. TIPOS ESPECÍFICOS PARA VENTAS
// ===========================================================================

export interface Moneda {
    nombre: string;
    simbolo: string;
    tipoCambio: number;
}

export interface ItemCarrito extends ProductoItem {
    cantidad: number;
}

// ===========================================================================
// 3. INTERFACES PARA REPORTES Y GRÁFICOS
// ===========================================================================

export interface VentaGrafico {
    fecha: string;
    total: number;
    cantidad_ventas: number;
    promedio_ventas: number;
}

export interface TopProducto {
    id: string;
    nombre: string;
    cantidad: number;
    total: number;
}

export interface VentaPorCategoria {
    categoria: string;
    total: number;
    cantidad: number;
}

export interface VentaPorCajero {
    cajero: string;
    total: number;
}

export interface MetodoPagoStats {
    metodo: string;
    monto: number;
}

// src/config/types.ts

export interface PrincipioActivo {
    id: string;
    nombre: string;
    descripcion?: string;
}

export interface FormaFarmaceutica {
    id: string;
    nombre: string;
}

export interface Medicamento {
    id: string;
    principio_activo_id: string;
    forma_farmaceutica_id: string;
    concentracion: number;
    unidad_concentracion: string;
    via_administracion: string;
    requiere_receta: boolean;
    afecto_igv: boolean;
    principios_activos?: PrincipioActivo;
    formas_farmaceuticas?: FormaFarmaceutica;
}

export interface Laboratorio {
    id: string;
    nombre: string;
    pais?: string;
}

export interface UnidadPresentacion {
    id: string;
    nombre: string;
    abreviatura: string;
}

// ==================== TIPO PRINCIPAL PARA VENTAS ====================
export interface ProductoItem {
    id: string;
    medicamento_id: string;
    laboratorio_id: string;
    categoria_id?: string;
    unidad_base_id: string;
    sku?: string;
    nombre_comercial: string;
    registro_sanitario?: string;
    codigo_interno?: string;
    estado: string;
    // Relaciones
    medicamentos?: Medicamento;
    laboratorios?: Laboratorio;
    unidades_presentacion?: UnidadPresentacion;
    // Campo útil para ventas
    productos_presentaciones?: ProductoPresentacion[];
    // lo puedes agregar después si quieres
}

// Tipo para el carrito
export interface ItemCarrito extends ProductoItem {
    cantidad: number;
}

export interface Moneda {
    nombre: string;
    simbolo: string;
    tipoCambio: number;
}