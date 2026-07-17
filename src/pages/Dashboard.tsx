import Barra from "../components/barralaterral";
import DashboardVentas from "../components/DashbordElements/GraficoVentas";

export default function Home() {
    return (
        <div className="flex h-screen w-screen bg-slate-100">
            {/* Sidebar */}
            <Barra />

            {/* Contenido */}
            <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden">
                <DashboardVentas />
            </main>
        </div>
    );
}