/* AUTH: Mapeo admin/caja/cocina → enum Prisma (DUENO_RESTAURANT, STAFF_*) */
const ROL_TO_PRISMA = {
  admin: 'DUENO_RESTAURANT',
  caja: 'STAFF_CAJA',
  cocina: 'STAFF_COCINA',
  DUENO_RESTAURANT: 'DUENO_RESTAURANT',
  STAFF_CAJA: 'STAFF_CAJA',
  STAFF_COCINA: 'STAFF_COCINA',
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLIENTE: 'CLIENTE',
};

export function normalizeRol(rol) {
  return ROL_TO_PRISMA[rol] || rol;
}

export function isRestaurantStaff(rol) {
  const r = normalizeRol(rol);
  return ['DUENO_RESTAURANT', 'STAFF_CAJA', 'STAFF_COCINA'].includes(r);
}
