// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { Toast } from 'primereact/toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useSocketInvalidation } from './hooks/useSocketInvalidation';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/login/common/PrivateRoute';
import RoleRoute from './components/login/common/RoleRoute';
import { ROLES } from './components/navegacion/config/perimisos';

import LoginForm from './pages/auth/Login';
import VentaPos from './components/venta/venta';
import ProductosPage from './components/productos/ProductosPage';
import Nav from './pages/navegacion/Nav';
import HomePage from './pages/homePos/home..page';
import DashboardPage from './components/dashboard/DashboardPage';
import ClientesPage from './components/clientes/ClientesPage';
import ReportesPage from './components/reportes/ReportesPage';
import AdminPage from './components/admin/AdminPage';
import RemoteScannerPage from './pages/escanner/RemoteScannerPage';
import GastosPage from './components/gastos/GastosPage';
import ComprobantePublicoPage from './pages/comprobantes/ComprobantePublicoPage';

import { SocketProvider } from './contexts/SocketContext';
import RealtimeNotifications from './components/notifications/RealtimeNotifications';

const AppContent: React.FC = () => {
  useSocketInvalidation();
  return (
    <div className="marifarma-app min-h-full">
      <Toast />
      <RealtimeNotifications />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/escanner-remoto" element={<RemoteScannerPage />} />
        <Route path="/c/:token" element={<ComprobantePublicoPage />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route element={<Nav />}>
            <Route element={<RoleRoute roles={[...ROLES.SUPERVISION]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Módulos */}
            <Route element={<RoleRoute roles={[...ROLES.OPERACION]} />}>
              <Route path="/ventas/nueva" element={<VentaPos />} />
            </Route>
            <Route element={<RoleRoute roles={[...ROLES.SUPERVISION]} />}>
              <Route path="/ventas/historial" element={<ReportesPage />} />
            </Route>
            <Route element={<RoleRoute roles={[...ROLES.OPERACION]} />}>
              <Route path="/productos" element={<ProductosPage />} />
            </Route>
            <Route element={<RoleRoute roles={[...ROLES.OPERACION]} />}>
              <Route path="/inventario/stock" element={<ProductosPage />} />
            </Route>
            <Route element={<RoleRoute roles={[...ROLES.OPERACION]} />}>
              <Route path="/clientes" element={<ClientesPage />} />
            </Route>

            <Route element={<RoleRoute roles={[...ROLES.SUPERVISION]} />}>
              <Route path="/reportes/ventas" element={<ReportesPage />} />
            </Route>
            <Route element={<RoleRoute roles={[...ROLES.SUPERVISION]} />}>
              <Route path="/reportes/comprobantes" element={<ReportesPage />} />
            </Route>
            <Route element={<RoleRoute roles={[...ROLES.SUPERVISION]} />}>
              <Route path="/reportes/inventario" element={<ReportesPage />} />
            </Route>
            <Route element={<RoleRoute roles={[...ROLES.ADMINISTRACION]} />}>
                <Route path="/gastos" element={<GastosPage />} />
                <Route path="/admin/usuarios" element={<AdminPage />} />
                <Route path="/admin/roles" element={<AdminPage />} />
                <Route path="/admin/sucursales" element={<AdminPage />} />
                <Route path="/admin/catalogos" element={<AdminPage />} />
                <Route path="/admin/facturacion" element={<AdminPage />} />
                <Route path="/admin/diagnosticos" element={<AdminPage />} />
                <Route path="/admin/series-documentos" element={<AdminPage />} />
            </Route>


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
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </PrimeReactProvider>
    </QueryClientProvider>
  );
};

export default App;
