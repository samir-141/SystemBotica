import { useState, useCallback } from "react";
import { productosService, type Producto } from '../export/export.module';

export interface ProductFormData {
    // Paso 1: Medicamento
    principio_activo_id: string;
    forma_farmaceutica_id: string;
    concentracion: string;
    unidad_concentracion: string;
    via_administracion: string;

    // Paso 2: Producto Comercial
    nombre_comercial: string;
    sku: string;
    codigo_interno: string;
    laboratorio_id: string;
    categoria_id: string;
    unidad_base_id: string;

    // Paso 3: Presentación
    unidad_presentacion_id: string;
    cantidad_unidad_base: string;
    codigo_barras: string;
    precio_actual: string;

    // Lote / Stock
    numero_lote: string;
    stock_actual: string;
    fecha_vencimiento: string;
    precio_compra_unidad_base: string;
}

const initialFormData: ProductFormData = {
    principio_activo_id: "",
    forma_farmaceutica_id: "",
    concentracion: "",
    unidad_concentracion: "mg",
    via_administracion: "ORAL",

    nombre_comercial: "",
    sku: "",
    codigo_interno: "",
    laboratorio_id: "",
    categoria_id: "",
    unidad_base_id: "",

    unidad_presentacion_id: "",
    cantidad_unidad_base: "1",
    codigo_barras: "",
    precio_actual: "",

    numero_lote: "",
    stock_actual: "",
    fecha_vencimiento: "",
    precio_compra_unidad_base: ""
};

export const useProductForm = (sucursalId: string) => {
    const [identificador, setIdentificadorState] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [busquedaIntentada, setBusquedaIntentada] = useState(false);
    const [historialEncontrado, setHistorialEncontrado] = useState<Producto | null>(null);
    const [formData, setFormData] = useState<ProductFormData>(initialFormData);

    // Resetea el formulario completo
    const resetForm = useCallback(() => {
        setIdentificadorState("");
        setHistorialEncontrado(null);
        setBusquedaIntentada(false);
        setFormData(initialFormData);
    }, []);

    // Handler para el identificador con auto-limpieza
    const setIdentificador = useCallback((value: string) => {
        setIdentificadorState(value);
        if (!value.trim()) {
            setHistorialEncontrado(null);
            setBusquedaIntentada(false);
            setFormData(initialFormData);
        }
    }, []);

    // Búsqueda en el backend
    const verificarHistorial = async () => {
        const term = identificador.trim();
        if (!term) return;

        try {
            setIsSearching(true);
            const resultado = await productosService.verificarPorCodigo(term, sucursalId);

            setBusquedaIntentada(true);

            if (resultado) {
                // Extrae la entidad base comercial independientemente de cómo responda el endpoint
                const productoBase: Producto = resultado.productos_comerciales || resultado;

                setHistorialEncontrado(productoBase);

                // Pre-llenado de datos del catálogo
                setFormData(prev => ({
                    ...prev,
                    nombre_comercial: productoBase.nombre_comercial || "",
                    sku: productoBase.sku || "",
                    codigo_interno: productoBase.codigo_interno || "",
                    codigo_barras: resultado.codigo_barras || term,

                    // Mapeo de UUIDs del medicamento
                    principio_activo_id: productoBase.medicamentos?.principios_activos?.id || "",
                    forma_farmaceutica_id: productoBase.medicamentos?.formas_farmaceuticas?.id || "",
                    concentracion: productoBase.medicamentos?.concentracion?.toString() || "",
                    unidad_concentracion: productoBase.medicamentos?.unidad_concentracion || "mg",
                    via_administracion: productoBase.medicamentos?.via_administracion || "ORAL",

                    // Mapeo de IDs de tablas maestras
                    laboratorio_id: productoBase.laboratorios?.id || "",
                    categoria_id: productoBase.categorias?.id || "",
                    unidad_base_id: productoBase.unidades_presentacion?.id || "",
                }));
            } else {
                setHistorialEncontrado(null);

                // Si no existe, mantiene el código ingresado en SKU y código de barras
                setFormData({
                    ...initialFormData,
                    codigo_barras: term,
                    sku: term,
                });
            }
        } catch (error) {
            console.error("Error al verificar el código/SKU del producto:", error);
            setHistorialEncontrado(null);
        } finally {
            setIsSearching(false);
        }
    };

    return {
        identificador,
        setIdentificador,
        isSearching,
        historialEncontrado,
        formData,
        setFormData,
        busquedaIntentada,
        verificarHistorial,
        resetForm
    };
};