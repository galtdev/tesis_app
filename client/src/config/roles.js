export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  DUENO_RESTAURANT: 'DUENO_RESTAURANT',
  STAFF_CAJA: 'STAFF_CAJA',
  STAFF_COCINA: 'STAFF_COCINA',
};

const LEGACY_MAP = {
  admin: ROLES.DUENO_RESTAURANT,
  caja: ROLES.STAFF_CAJA,
  cocina: ROLES.STAFF_COCINA,
};

export function normalizeRol(rol) {
  return LEGACY_MAP[rol] || rol;
}

export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', roles: [ROLES.DUENO_RESTAURANT, ROLES.STAFF_CAJA] },
  { to: '/admin/estadisticas', label: 'Estadísticas', roles: [ROLES.DUENO_RESTAURANT] },
  { to: '/admin/usuarios', label: 'Usuarios', roles: [ROLES.DUENO_RESTAURANT] },
  { to: '/admin/menu', label: 'Menú', roles: [ROLES.DUENO_RESTAURANT] },
  { to: '/admin/caja', label: 'Caja', roles: [ROLES.DUENO_RESTAURANT, ROLES.STAFF_CAJA] },
  { to: '/admin/cocina', label: 'Cocina', roles: [ROLES.DUENO_RESTAURANT, ROLES.STAFF_COCINA] },
];

export function getDefaultAdminPath(rol) {
  const r = normalizeRol(rol);
  if (r === ROLES.STAFF_CAJA) return '/admin/caja';
  if (r === ROLES.STAFF_COCINA) return '/admin/cocina';
  return '/admin/dashboard';
}

export function canAccessRoute(rol, allowedRoles) {
  if (!allowedRoles?.length) return true;
  return allowedRoles.includes(normalizeRol(rol));
}
