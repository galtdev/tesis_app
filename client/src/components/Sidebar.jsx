import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ADMIN_NAV, normalizeRol } from '../config/roles.js';
import '../styles/styles.css';

export default function Sidebar() {
  const { user, logout, rol } = useAuth();
  const navigate = useNavigate();
  const userRol = normalizeRol(rol);

  const visibleLinks = ADMIN_NAV.filter((item) => item.roles.includes(userRol));

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className="sidebar">
      <h2>Panel Restaurante</h2>
      {user?.restaurantNombre && (
        <p className="sidebar-role">{user.restaurantNombre}</p>
      )}
      {user?.nombre && <p className="sidebar-role">{user.nombre}</p>}
      <nav className="sidebar-nav">
        {visibleLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
            }
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink to="/menu" className="sidebar-link">
          Menú compra (cliente)
        </NavLink>
        <button type="button" className="sidebar-link sidebar-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </nav>
    </aside>
  );
}
