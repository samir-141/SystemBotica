import Inventario from "../components/inventario";
import Data from "../config/Data.json";
import Barra from "../components/barralaterral";
export default function Productos() {
    return (
        <div className="flex h-screen w-screen bg-slate-100 overflow-hidden">
            {/* Sidebar con ancho dinámico */}
            <Barra />

            {/* Contenedor principal para la pestaña de ventas */}
            <main className="flex-1 h-full overflow-hidden">
                <Inventario data={Data} />
            </main>
        </div>

    );
}