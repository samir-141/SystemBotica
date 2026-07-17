import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BarcodeScanner from './components/modulos/producto';
import Productos from './pages/Productos';
import './css/Sidebar.css'

export default function App() {

  const buscarProducto = (codigo: string) => {
    console.log("Código leído:", codigo);

    // Aquí buscarás en tu JSON
  };
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal que carga el Layout (Home) */}
        <Route path="/" element={<Home />} />
        {/* Redirección automática al POS al entrar a la app */}

        {/* Sub-rutas secundarias que se renderizarán dentro de Home */}
        <Route path="/pos" element={<Home />} />
        <Route path="/inventario/productos" element={<Productos />} />
        <Route path="/clientes" element={<div>Módulo de Clientes y Seguros</div>} />
        <Route path="/settings" element={<div>Configuración del Sistema</div>} />
        <Route path="/buscar" element={<BarcodeScanner onDetected={buscarProducto} />} />
      </Routes>
    </BrowserRouter>
  );
}