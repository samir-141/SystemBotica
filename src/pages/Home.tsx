
import PestañaVenta from '../pages/Venta';

export default function Home() {
    return (
        <div className="flex h-screen w-screen bg-slate-100 overflow-hidden">

            <main className="flex-1 h-full overflow-hidden">
                <PestañaVenta />
            </main>
        </div>
    );
}