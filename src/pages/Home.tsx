import React from 'react';
import Barra from '../components/barralaterral'; // Asegúrate de apuntar a tu nueva carpeta modulada
import PestañaVenta from '../pages/Venta';

export default function Home() {
    return (
        <div className="flex h-screen w-screen bg-slate-100 overflow-hidden">
            {/* Sidebar con ancho dinámico */}
            <Barra />

            {/* Contenedor principal para la pestaña de ventas */}
            <main className="flex-1 h-full overflow-hidden">
                <PestañaVenta />
            </main>
        </div>
    );
}