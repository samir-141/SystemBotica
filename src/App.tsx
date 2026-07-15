import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PestañaVenta from './pages/Venta';
import './css/Sidebar.css'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal que carga el Layout (Home) */}
        <Route path="/" element={<Home />}>
          {/* Redirección automática al POS al entrar a la app */}

          {/* Sub-rutas secundarias que se renderizarán dentro de Home */}
          <Route path="venta" element={<PestañaVenta />} />
          <Route path="inventario" element={<div>Módulo de Inventario / Medicamentos</div>} />
          <Route path="clientes" element={<div>Módulo de Clientes y Seguros</div>} />
          <Route path="settings" element={<div>Configuración del Sistema</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}