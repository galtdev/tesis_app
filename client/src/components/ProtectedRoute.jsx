import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { canAccessRoute, getDefaultAdminPath, normalizeRol, ROLES } from '../config/roles.js';

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  loginPath = '/admin/login',
}) {
  const { isAuthenticated, loading, user, rol } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Verificando sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length && !canAccessRoute(rol, allowedRoles)) {
    const fallback =
      normalizeRol(user?.rol) === ROLES.SUPER_ADMIN
        ? '/super-admin/restaurantes'
        : getDefaultAdminPath(user?.rol);

    return <Navigate to={fallback} replace />;
  }

  return children;
}
