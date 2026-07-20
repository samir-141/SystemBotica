// src/App.tsx
import React from 'react';
import './css/Venta.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
//import Layout from './components/common/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Barra from './components/barralaterral';
import PestañaVenta from './pages/Venta';
import LoginHero from './components/auth/LoginHero';
const App: React.FC = () => {
  return (
    <PrimeReactProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route element={<Barra />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Módulos vacíos para después */}
                <Route path="/ventas/nueva" element={<PestañaVenta />} />
                <Route path="/ventas/historial" element={<div>Historial de Ventas</div>} />
                <Route path="/productos" element={<div>Catálogo de Productos</div>} />
                <Route path="/inventario/stock" element={<div>Stock</div>} />
                <Route path="/clientes" element={<div>Clientes</div>} />
                <Route path="/reportes/ventas" element={<div>Reporte de Ventas</div>} />
                <Route path="/reportes/inventario" element={<div>Reporte de Inventario</div>} />
                <Route path="/admin/usuarios" element={<div>Gestión de Usuarios</div>} />
                <Route path="/admin/sucursales" element={<div>Gestión de Sucursales</div>} />

                {/* Redirección por defecto */}
                <Route path="/" element={<LoginHero />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<div className="p-4 text-center">
              <h1>404</h1>
              <p>Página no encontrada</p>
            </div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </PrimeReactProvider>
  );
};

export default App;