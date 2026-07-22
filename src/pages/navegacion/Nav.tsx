
import { Outlet } from 'react-router-dom';
import NavLateral from '../../components/navegacion/NavLateral'; // O la ruta donde tengas tu barra lateral

export default function Nav() {
    return (
        /* 1. El contenedor Padre DEBE ser flex, h-screen, w-screen y overflow-hidden */
        <div className="flex h-screen w-screen bg-slate-100 overflow-hidden">

            {/* 2. BARRA LATERAL A LA IZQUIERDA */}
            <NavLateral />

            {/* 3. ÁREA PRINCIPAL A LA DERECHA */}
            {/* Es CRUCIAL que tenga: flex-1, flex, flex-col, min-w-0, h-full y overflow-hidden */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                {/* Aquí se renderizarán todas tus páginas hijas (VentaPosPage, Dashboard, etc.) */}
                <main className="flex-1 overflow-auto min-w-0 bg-slate-100">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}