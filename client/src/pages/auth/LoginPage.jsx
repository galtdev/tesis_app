/* AUTH: /admin/login y /super-admin/login — tipo restaurant | super-admin */
import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import { camposLogin } from '../../config/formConfig.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDefaultAdminPath, normalizeRol, ROLES } from '../../config/roles.js';
import '../../styles/login.css';

export default function LoginPage({ variant = 'restaurant' }) {
  const isSuperAdmin = variant === 'super-admin';
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canRegisterSuperAdmin, setCanRegisterSuperAdmin] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    api.get('/api/auth/register-super-admin/status').then((res) => {
      if (!res.error && !res.data.body.hasSuperAdmin) {
        setCanRegisterSuperAdmin(true);
      }
    });
  }, [isSuperAdmin]);

  if (!loading && isAuthenticated) {
    const rol = normalizeRol(user?.rol);
    if (isSuperAdmin && rol === ROLES.SUPER_ADMIN) {
      return <Navigate to="/super-admin/restaurantes" replace />;
    }
    if (!isSuperAdmin && rol !== ROLES.SUPER_ADMIN) {
      const target = location.state?.from?.pathname || getDefaultAdminPath(rol);
      return <Navigate to={target} replace />;
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const sessionUser = await login({
        correo: form.correo,
        password: form.password,
        tipo: isSuperAdmin ? 'super-admin' : 'restaurant',
      });

      const redirectTo =
        location.state?.from?.pathname ||
        (isSuperAdmin
          ? '/super-admin/restaurantes'
          : getDefaultAdminPath(sessionUser.rol));

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`login-page ${isSuperAdmin ? 'login-page--platform' : 'login-page--restaurant'}`}>
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-badge">{isSuperAdmin ? 'Plataforma' : 'Restaurante'}</span>
          <h1>{isSuperAdmin ? 'Super Admin' : 'Panel del restaurante'}</h1>
          <p>
            {isSuperAdmin
              ? 'Gestiona restaurantes y configuración global.'
              : 'Usa el correo y contraseña que te dio la plataforma al registrar tu restaurante.'}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {camposLogin.map((field) => (
            <div key={field.name} className="login-field">
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                required={field.required}
                value={form[field.name]}
                onChange={handleChange}
                autoComplete={field.name === 'password' ? 'current-password' : 'email'}
              />
            </div>
          ))}

          {error && <p className="login-error">{error}</p>}

          <Button type="submit" variant="primary" className="login-submit">
            {submitting ? 'Entrando…' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="login-footer">
          {isSuperAdmin ? (
            <>
              {canRegisterSuperAdmin && (
                <>
                  <Link to="/super-admin/registro">Crear primera cuenta de plataforma</Link>
                  <br />
                </>
              )}
              <Link to="/admin/login">Acceso restaurante</Link>
            </>
          ) : (
            <Link to="/super-admin/login">Acceso plataforma (super admin)</Link>
          )}
        </p>
      </div>
    </div>
  );
}
