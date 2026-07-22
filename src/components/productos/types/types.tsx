export interface PrincipioActivo {
    id: string;
    nombre: string;
}

export interface FormaFarmaceutica {
    id: string;
    nombre: string;
}




export interface Categoria {
    id: string;
    nombre: string;
}

export interface UnidadPresentacion {
    id: string;
    nombre: string;
    abreviatura: string;
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

export interface Medicamento {
    id: string;
    concentracion: number; // Decimal en BD, mapeado a number en JS
    unidad_concentracion: string;
    via_administracion: string;
    requiere_receta: boolean;
    afecto_igv: boolean;
    principios_activos: PrincipioActivo;
    formas_farmaceuticas: FormaFarmaceutica;
    label?: string; // Utilidad opcional para mostrar en el Combobox
}

export interface Laboratorio {
    id: string;
    nombre: string;
    pais?: string | null;
    telefono?: string | null;
    email?: string | null;
}

export interface Categoria {
    id: string;
    nombre: string;
}

export interface UnidadPresentacion {
    id: string;
    nombre: string;
    abreviatura: string;
}

export interface ProductoPresentacion {
    id: string;
    producto_comercial_id?: string;
    unidad_presentacion_id?: string;
    cantidad_unidad_base: number;
    codigo_barras: string | null;
    precio_actual: number; // Manejado como number para inputs tipo decimal
    orden: number;
    unidades_presentacion: UnidadPresentacion;
    precio_por_unidad_base?: number;
}

export interface Lote {
    id: string;
    numero_lote: string;
    stock_actual: number;
    fecha_vencimiento: string;
    precio_compra_unidad_base: number;
}

export interface Producto {
    id: string;
    nombre_comercial: string;
    sku: string | null;
    codigo_interno: string | null;
    registro_sanitario: string | null;
    medicamentos: Medicamento;
    laboratorios: Laboratorio;
    categorias: Categoria;
    unidades_presentacion: UnidadPresentacion; // Corresponde a la unidad_base
    productos_presentaciones: ProductoPresentacion[];
    lotes?: Lote[];
    stock_total?: number;
}

// -------------------------------------------------------------
// DTOs / Payload para enviar los datos al Wizard del Backend
// -------------------------------------------------------------

export interface StepMedicamentoPayload {
    isNew: boolean;
    id?: string;
    principio_activo_id?: string;
    forma_farmaceutica_id?: string;
    concentracion?: number;
    unidad_concentracion?: string;
    via_administracion?: string;
    requiere_receta?: boolean;
    afecto_igv?: boolean;
}

export interface StepProductoComercialPayload {
    isNew: boolean;
    id?: string;
    nombre_comercial?: string;
    sku?: string;
    codigo_interno?: string;
    registro_sanitario?: string;
    laboratorio_id?: string;
    categoria_id?: string;
    unidad_base_id?: string;
}

export interface StepPresentacionPayload {
    unidad_presentacion_id: string;
    cantidad_unidad_base: number;
    codigo_barras?: string;
    precio_actual: number;
}

export interface CreateWizardProductoPayload {
    medicamento: StepMedicamentoPayload;
    productoComercial: StepProductoComercialPayload;
    presentacion: StepPresentacionPayload;
}