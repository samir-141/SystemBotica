// src/App.tsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import { Toast } from "primereact/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/login/common/PrivateRoute";
import RoleRoute from "./components/login/common/RoleRoute";
import { CAPACIDADES } from "./components/navegacion/config/perimisos";

import { SocketProvider } from "./contexts/SocketContext";
import RealtimeNotifications from "./components/notifications/RealtimeNotifications";

const LoginForm = lazy(() => import("./pages/auth/Login"));
const VentaPos = lazy(() => import("./components/venta/venta"));
const ProductosPage = lazy(
  () => import("./components/productos/ProductosPage"),
);
const Nav = lazy(() => import("./pages/navegacion/Nav"));
const HomePage = lazy(() => import("./pages/homePos/home..page"));
const DashboardPage = lazy(
  () => import("./components/dashboard/DashboardPage"),
);
const ClientesPage = lazy(() => import("./components/clientes/ClientesPage"));
const ReportesPage = lazy(() => import("./components/reportes/ReportesPage"));
const AdminPage = lazy(() => import("./components/admin/AdminPage"));
const RemoteScannerPage = lazy(
  () => import("./pages/escanner/RemoteScannerPage"),
);
const GastosPage = lazy(() => import("./components/gastos/GastosPage"));
const ComprasPage = lazy(() => import("./components/compras/ComprasPage"));
const ComprobantePublicoPage = lazy(
  () => import("./pages/comprobantes/ComprobantePublicoPage"),
);

const RouteFallback = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-white"
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-3 text-emerald-950">
      <span
        className="h-9 w-9 animate-spin rounded-full border-4 border-amber-300 border-t-emerald-900"
        aria-hidden="true"
      />
      <span className="text-sm font-extrabold">Cargando módulo…</span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  return (
    <div className="marifarma-app min-h-full">
      <Toast />
      <RealtimeNotifications />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/c/:token" element={<ComprobantePublicoPage />} />

          {/* Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/escanner-remoto" element={<RemoteScannerPage />} />
            <Route element={<Nav />}>
              <Route element={<RoleRoute roles={[...CAPACIDADES.DASHBOARD]} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>

              {/* Módulos */}
              <Route
                element={<RoleRoute roles={[...CAPACIDADES.VENTAS_POS]} />}
              >
                <Route path="/ventas/nueva" element={<VentaPos />} />
              </Route>
              <Route element={<RoleRoute roles={[...CAPACIDADES.REPORTES]} />}>
                <Route path="/ventas/historial" element={<ReportesPage />} />
              </Route>
              <Route
                element={
                  <RoleRoute roles={[...CAPACIDADES.INVENTARIO_GESTION]} />
                }
              >
                <Route path="/productos" element={<ProductosPage />} />
              </Route>
              <Route
                element={
                  <RoleRoute roles={[...CAPACIDADES.INVENTARIO_GESTION]} />
                }
              >
                <Route path="/inventario/stock" element={<ProductosPage />} />
              </Route>
              <Route element={<RoleRoute roles={[...CAPACIDADES.CLIENTES]} />}>
                <Route path="/clientes" element={<ClientesPage />} />
              </Route>

              <Route element={<RoleRoute roles={[...CAPACIDADES.REPORTES]} />}>
                <Route path="/reportes/ventas" element={<ReportesPage />} />
              </Route>
              <Route element={<RoleRoute roles={[...CAPACIDADES.REPORTES]} />}>
                <Route
                  path="/reportes/comprobantes"
                  element={<ReportesPage />}
                />
              </Route>
              <Route element={<RoleRoute roles={[...CAPACIDADES.REPORTES]} />}>
                <Route path="/reportes/inventario" element={<ReportesPage />} />
              </Route>
              <Route element={<RoleRoute roles={[...CAPACIDADES.GASTOS]} />}>
                <Route path="/gastos" element={<GastosPage />} />
              </Route>
              <Route element={<RoleRoute roles={[...CAPACIDADES.COMPRAS]} />}>
                <Route path="/compras" element={<ComprasPage />} />
              </Route>
              <Route
                element={<RoleRoute roles={[...CAPACIDADES.ADMINISTRACION]} />}
              >
                <Route path="/admin/usuarios" element={<AdminPage />} />
                <Route path="/admin/roles" element={<AdminPage />} />
                <Route path="/admin/sucursales" element={<AdminPage />} />
                <Route path="/admin/catalogos" element={<AdminPage />} />
                <Route path="/admin/facturacion" element={<AdminPage />} />
                <Route path="/admin/diagnosticos" element={<AdminPage />} />
                <Route
                  path="/admin/series-documentos"
                  element={<AdminPage />}
                />
                <Route
                  path="/admin/impresion"
                  element={<AdminPage />}
                />
              </Route>

              {/* Redirección por defecto */}
              <Route path="/" element={<HomePage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="p-4 text-center">
                <h1>404</h1>
                <p>Página no encontrada</p>
              </div>
            }
          />
        </Routes>
      </Suspense>
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
