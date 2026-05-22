import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import { camposRegistroSuperAdmin } from '../../config/formConfig.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { ROLES, normalizeRol } from '../../config/roles.js';
import '../../styles/login.css';

const initialForm = { correo: '', password: '', password_confirm: '' };

export default function SuperAdminRegisterPage() {
  const { isAuthenticated, user, loading: authLoading, registerSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ loading: true, requiresAuth: false, hasSuperAdmin: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const rol = normalizeRol(user?.rol);
  const isSuperAdminSession = isAuthenticated && rol === ROLES.SUPER_ADMIN;

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/api/auth/register-super-admin/status');
      if (!res.error) {
        setStatus({
          loading: false,
          requiresAuth: res.data.body.requiresAuth,
          hasSuperAdmin: res.data.body.hasSuperAdmin,
        });
      } else {
        setStatus((s) => ({ ...s, loading: false }));
      }
    };
    load();
  }, []);

  if (!authLoading && isSuperAdminSession && !status.requiresAuth) {
    return <Navigate to="/super-admin/restaurantes" replace />;
  }

  if (!status.loading && status.requiresAuth && !isSuperAdminSession) {
    return <Navigate to="/super-admin/login" state={{ from: { pathname: '/super-admin/registro' } }} replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password_confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);

    try {
      await registerSuperAdmin({
        correo: form.correo,
        password: form.password,
        password_confirm: form.password_confirm,
      });
      navigate('/super-admin/restaurantes', { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo registrar');
    } finally {
      setSubmitting(false);
    }
  };

  if (status.loading) {
    return (
      <div className="login-page login-page--platform">
        <p style={{ color: '#fff' }}>Cargando…</p>
      </div>
    );
  }

  return (
    <div className="login-page login-page--platform">
      <div className="login-card">
        <div className="login-card__header">
          <span className="login-badge">Plataforma</span>
          <h1>Registrar super administrador</h1>
          <p>
            {status.hasSuperAdmin
              ? 'Crea otra cuenta con permisos de plataforma.'
              : 'Primera cuenta de la plataforma. Configura el acceso global.'}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {camposRegistroSuperAdmin.map((field) => (
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
                minLength={field.name === 'password' ? 6 : undefined}
                autoComplete={field.name.includes('password') ? 'new-password' : 'email'}
              />
            </div>
          ))}

          {error && <p className="login-error">{error}</p>}

          <Button type="submit" variant="primary" className="login-submit">
            {submitting ? 'Registrando…' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="login-footer">
          <Link to="/super-admin/login">Ya tengo cuenta — iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
