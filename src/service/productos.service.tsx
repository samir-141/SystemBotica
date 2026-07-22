const API_URL = import.meta.env.VITE_API_URL;

export const productosService = {
    // 1. Verificar si el producto comercial o presentación existe por SKU o filtro en el Wizard
    async verificarPorCodigo(barcode: string, sucursalId: string) {
        try {
            // Ajustado al endpoint del Paso 2 del Wizard
            const response = await fetch(
                `${API_URL}/wizard-productos/productos-comerciales/search?q=${encodeURIComponent(barcode)}`
            );

            if (response.status === 404) return null;
            if (!response.ok) throw new Error('Error al consultar el producto');

            const data = await response.json();
            // Si la búsqueda retorna un array con coincidencias, devolvemos el primer registro hallado
            return Array.isArray(data) && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error("Error en verificarPorCodigo:", error);
            return null;
        }
    },

    // 2. Guardar el payload estructurado dentro de la transacción atómica de Prisma
    async guardarInventario(payload: any) {
        // Apunta al POST del controlador ProductosWizardController
        const response = await fetch(`${API_URL}/wizard-productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                Array.isArray(errorData.message)
                    ? errorData.message.join(', ') // Si es una lista de errores de class-validator
                    : errorData.message || 'Error al guardar en el inventario'
            );
        }

        return await response.json();
    }
};