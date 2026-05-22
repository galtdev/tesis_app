/* AUTH: Panel plataforma — registro super admin, logout → /super-admin/login */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/styles.css';

export default function SuperAdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  return (
    <aside className="sidebar sidebar--super-admin">
      <h2>Plataforma</h2>
      <p className="sidebar-role">Super Admin</p>
      {user?.correo && <p className="sidebar-role">{user.correo}</p>}
      <nav className="sidebar-nav">
        <NavLink
          to="/super-admin/restaurantes"
          className={({ isActive }) =>
            isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
          }
        >
          Restaurantes
        </NavLink>
        <NavLink to="/super-admin/registro" className="sidebar-link">
          Nuevo super admin
        </NavLink>
        <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
