/**
 * AUTH: Usuarios de prueba (super admin, dueño, caja, cocina).
 * Ejecutar desde /backend: node scripts/seedAuth.js
 * Ver CHANGELOG-AUTH.md
 */
import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma.js';

const PASSWORD = 'admin123';

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  let restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        nombre: 'Restaurante Demo',
        status: 'activo',
        ubicacion: 'Centro',
        banner: '/imagenes/default.jpg',
        slug: 'demo',
      },
    });
    console.log('Restaurante demo creado:', restaurant.slug);
  }

  const superCorreo = 'super@plataforma.com';
  const duenoCorreo = 'dueno@demo.com';
  const cajaCorreo = 'caja@demo.com';
  const cocinaCorreo = 'cocina@demo.com';

  await prisma.auth.upsert({
    where: { correo: superCorreo },
    update: { password: hash, rol: 'SUPER_ADMIN' },
    create: { correo: superCorreo, password: hash, rol: 'SUPER_ADMIN' },
  });

  async function staffUser(correo, nombre, rol, createCajaOrCocina) {
    const existing = await prisma.auth.findUnique({ where: { correo } });
    if (existing) {
      await prisma.auth.update({
        where: { correo },
        data: { password: hash, rol },
      });
      return;
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        status: 'activo',
        restaurantId: restaurant.id,
        auth: {
          create: { correo, password: hash, rol },
        },
      },
    });

    if (createCajaOrCocina === 'caja') {
      await prisma.caja.create({ data: { usuarioId: usuario.id, restaurantId: restaurant.id } });
    }
    if (createCajaOrCocina === 'cocina') {
      await prisma.cocina.create({ data: { usuarioId: usuario.id, restaurantId: restaurant.id } });
    }
  }

  await staffUser(duenoCorreo, 'Dueño Demo', 'DUENO_RESTAURANT', null);
  await staffUser(cajaCorreo, 'Caja Demo', 'STAFF_CAJA', 'caja');
  await staffUser(cocinaCorreo, 'Cocina Demo', 'STAFF_COCINA', 'cocina');

  console.log('\nUsuarios listos (contraseña para todos: %s)\n', PASSWORD);
  console.log('  Super Admin :', superCorreo, '→ /super-admin/login');
  console.log('  Dueño       :', duenoCorreo, '→ /admin/login');
  console.log('  Caja        :', cajaCorreo, '→ /admin/login');
  console.log('  Cocina      :', cocinaCorreo, '→ /admin/login');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
