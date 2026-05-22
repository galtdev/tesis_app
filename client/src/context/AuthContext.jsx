/* AUTH: Sesión global — token en localStorage, login/logout, registerSuperAdmin, GET /api/auth/me */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../services/api.js';
import { getDefaultAdminPath, normalizeRol, ROLES } from '../config/roles.js';

const AuthContext = createContext(null);

const STORAGE_TOKEN = 'auth_token';
const STORAGE_USER = 'auth_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(STORAGE_TOKEN);
    setAuthToken(stored);
    return stored;
  });
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(STORAGE_TOKEN)));

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setAuthToken(nextToken);

    if (nextToken) localStorage.setItem(STORAGE_TOKEN, nextToken);
    else localStorage.removeItem(STORAGE_TOKEN);

    if (nextUser) localStorage.setItem(STORAGE_USER, JSON.stringify(nextUser));
    else localStorage.removeItem(STORAGE_USER);
  }, []);

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const login = useCallback(
    async ({ correo, password, tipo }) => {
      const res = await api.post('/api/auth/login', { correo, password, tipo });

      if (res.error) {
        throw new Error(res.error);
      }

      const { token: newToken, user: sessionUser } = res.data.body;
      persistSession(newToken, sessionUser);
      return sessionUser;
    },
    [persistSession]
  );

  const registerSuperAdmin = useCallback(
    async ({ correo, password, password_confirm }) => {
      const res = await api.post('/api/auth/register-super-admin', {
        correo,
        password,
        password_confirm,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      const { token: newToken, user: sessionUser } = res.data.body;
      persistSession(newToken, sessionUser);
      return sessionUser;
    },
    [persistSession]
  );

  useEffect(() => {
    setAuthToken(token);

    if (!token) {
      setLoading(false);
      return;
    }

    const validate = async () => {
      const res = await api.get('/api/auth/me');

      if (res.error) {
        logout();
      } else {
        const sessionUser = res.data.body.user;
        persistSession(token, sessionUser);
      }

      setLoading(false);
    };

    validate();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      rol: user ? normalizeRol(user.rol) : null,
      login,
      registerSuperAdmin,
      logout,
      getRedirectPath: (tipo) => {
        const rol = user?.rol;
        if (tipo === 'super-admin') return '/super-admin/restaurantes';
        return getDefaultAdminPath(rol);
      },
      isSuperAdmin: normalizeRol(user?.rol) === ROLES.SUPER_ADMIN,
      isRestaurantStaff: [
        ROLES.DUENO_RESTAURANT,
        ROLES.STAFF_CAJA,
        ROLES.STAFF_COCINA,
      ].includes(normalizeRol(user?.rol)),
    }),
    [token, user, loading, login, registerSuperAdmin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
