/* AUTH: Mapa de rutas — login público, /super-admin (SUPER_ADMIN), /admin por rol.
   Ver CHANGELOG-AUTH.md */
import { Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import PageUser from './pages/admin/UsuariosPage';
import MenuPage from './pages/admin/MenuPage';
import RestaurantPage from './pages/superadmin/RestaurantPage';
import Dashboard from './pages/admin/DashboardPage';
import EstadisticasPage from './pages/admin/EstadisticasPage';
import CajaPage from './pages/admin/CajaPage';
import CocinaPage from './pages/admin/CocinaPage';
import LoginPage from './pages/auth/LoginPage';
import SuperAdminRegisterPage from './pages/auth/SuperAdminRegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES, getDefaultAdminPath } from './config/roles';
import { useAuth } from './context/AuthContext.jsx';

function AdminIndexRedirect() {
  const { rol } = useAuth();
  const segment = getDefaultAdminPath(rol).replace(/^\/admin\/?/, '') || 'dashboard';
  return <Navigate to={segment} replace />;
}

import MenuClientLayout from './layouts/ClientMenuLayout';
import MenuClient from './pages/menu/MenuClientPage';
import ResumenPedido from './pages/menu/ResumenPage';
import PedidoData from './pages/menu/DataPedidoPage';
import PedidoPago from './pages/menu/DataPagoPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      <Route path="/admin/login" element={<LoginPage variant="restaurant" />} />
      <Route path="/super-admin/login" element={<LoginPage variant="super-admin" />} />
      <Route path="/super-admin/registro" element={<SuperAdminRegisterPage />} />

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute
            allowedRoles={[ROLES.SUPER_ADMIN]}
            loginPath="/super-admin/login"
          >
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="restaurantes" replace />} />
        <Route path="restaurantes" element={<RestaurantPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRoles={[ROLES.DUENO_RESTAURANT, ROLES.STAFF_CAJA, ROLES.STAFF_COCINA]}
            loginPath="/admin/login"
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminIndexRedirect />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.DUENO_RESTAURANT, ROLES.STAFF_CAJA]}
              loginPath="/admin/login"
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="estadisticas"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DUENO_RESTAURANT]} loginPath="/admin/login">
              <EstadisticasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DUENO_RESTAURANT]} loginPath="/admin/login">
              <PageUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="menu"
          element={
            <ProtectedRoute allowedRoles={[ROLES.DUENO_RESTAURANT]} loginPath="/admin/login">
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="caja"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.DUENO_RESTAURANT, ROLES.STAFF_CAJA]}
              loginPath="/admin/login"
            >
              <CajaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cocina"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.DUENO_RESTAURANT, ROLES.STAFF_COCINA]}
              loginPath="/admin/login"
            >
              <CocinaPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/menu" element={<MenuClientLayout />}>
        <Route path="" element={<MenuClient />} />
        <Route path="resumen" element={<ResumenPedido />} />
        <Route path="datos" element={<PedidoData />} />
        <Route path="pago" element={<PedidoPago />} />
      </Route>
    </Routes>
  );
}

export default App;
