// src/App.tsx
import React from 'react';
import './css/Venta.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useSocketInvalidation } from './hooks/useSocketInvalidation';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/login/common/PrivateRoute';

import LoginForm from './pages/auth/Login';
import VentaPosPage from './pages/ventapos/ventaPos';
import ProductosPageWrapper from './pages/productos/productosPage';
import Nav from './pages/navegacion/Nav';
import HomePage from './pages/homePos/home..page';
import DashboardPage from './components/dashboard/DashboardPage';
import ClientesPage from './components/clientes/ClientesPage';
import ReportesPage from './components/reportes/ReportesPage';
import AdminPage from './components/admin/AdminPage';
import RemoteScannerPage from './pages/escanner/RemoteScannerPage';

// Componente interno para inicializar la escucha de WebSocket dentro del contexto de QueryClient
const SocketSyncListener: React.FC = () => {
  useSocketInvalidation();
  return null;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketSyncListener />
      <PrimeReactProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/escanner-remoto" element={<RemoteScannerPage />} />

            {/* Rutas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route element={<Nav />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Módulos */}
                <Route path="/ventas/nueva" element={<VentaPosPage />} />
                <Route path="/ventas/historial" element={<ReportesPage />} />
                <Route path="/productos" element={<ProductosPageWrapper />} />
                <Route path="/inventario/stock" element={<ProductosPageWrapper />} />
                <Route path="/clientes" element={<ClientesPage />} />

                <Route path="/reportes/ventas" element={<ReportesPage />} />
                <Route path="/reportes/comprobantes" element={<ReportesPage />} />
                <Route path="/reportes/inventario" element={<ReportesPage />} />
                <Route path="/admin/usuarios" element={<AdminPage />} />
                <Route path="/admin/roles" element={<AdminPage />} />
                <Route path="/admin/sucursales" element={<AdminPage />} />


                {/* Redirección por defecto */}
                <Route path="/" element={<HomePage />} />
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
    </QueryClientProvider>
  );
};

export default App;