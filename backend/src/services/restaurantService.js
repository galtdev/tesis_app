/* AUTH: Alta restaurante crea dueño (usuario + auth DUENO_RESTAURANT) con correo/password */
import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

function slugify(text) {
    return String(text)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function ensurePlatform() {
    let platform = await prisma.platform.findFirst({ orderBy: { id: 'asc' } });

    if (!platform) {
        platform = await prisma.platform.create({
            data: { nombre: 'Global' }
        });
    }

    return platform;
}

export async function all() {
    return prisma.restaurant.findMany({
        orderBy: { nombre: 'asc' },
        include: {
            platform: { select: { nombre: true } },
            usuarios: {
                where: {
                    auth: {
                        is: { rol: 'DUENO_RESTAURANT' },
                    },
                },
                take: 1,
                include: { auth: { select: { correo: true, rol: true } } },
            },
        },
    });
}

export async function create(data) {
    const {
        nombre_dueno,
        correo,
        password,
        nombre,
        ubicacion,
        status,
        horario,
        banner,
        slug: slugInput,
    } = data;

    if (!correo?.trim() || !password) {
        throw Object.assign(new Error('Correo y contraseña del dueño son obligatorios'), {
            statusCode: 400,
        });
    }

    if (password.length < 6) {
        throw Object.assign(new Error('La contraseña del dueño debe tener al menos 6 caracteres'), {
            statusCode: 400,
        });
    }

    const correoNorm = correo.trim();
    const existingAuth = await prisma.auth.findUnique({ where: { correo: correoNorm } });
    if (existingAuth) {
        throw Object.assign(new Error('El correo del dueño ya está registrado'), { statusCode: 409 });
    }

    const platform = await ensurePlatform();
    const baseSlug = slugify(slugInput || nombre);

    if (!baseSlug) {
        throw new Error('El slug del restaurante no es válido');
    }

    let slug = baseSlug;
    let suffix = 1;

    while (await prisma.restaurant.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    const passwordHash = await bcrypt.hash(password.toString(), 10);

    return prisma.$transaction(async (tx) => {
        const restaurant = await tx.restaurant.create({
            data: {
                nombre: nombre.trim(),
                status: status || 'activo',
                horario: horario?.trim() || null,
                ubicacion: ubicacion.trim(),
                banner: banner?.trim() || '',
                slug,
                platformId: platform.id,
            },
        });

        const dueno = await tx.usuario.create({
            data: {
                nombre: (nombre_dueno || nombre).trim(),
                status: 'activo',
                restaurantId: restaurant.id,
                auth: {
                    create: {
                        correo: correoNorm,
                        password: passwordHash,
                        rol: 'DUENO_RESTAURANT',
                    },
                },
            },
            include: { auth: { select: { correo: true, rol: true } } },
        });

        return {
            ...restaurant,
            dueno: {
                nombre: dueno.nombre,
                correo: dueno.auth.correo,
            },
        };
    });
}

export async function delet(id) {
    return prisma.restaurant.delete({
        where: { id: Number(id) }
    });
}

export async function resolveRestaurantId(explicitId) {
    if (explicitId != null && explicitId !== '') {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: Number(explicitId) }
        });
        if (restaurant) return restaurant.id;
    }

    const fromEnv = process.env.RESTAURANT_ID;
    if (fromEnv) {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: Number(fromEnv) }
        });
        if (restaurant) return restaurant.id;
    }

    const existing = await prisma.restaurant.findFirst({ orderBy: { id: 'asc' } });
    if (existing) return existing.id;

    const created = await create({
        nombre: 'Mi Restaurante',
        ubicacion: 'Local',
        status: 'activo',
        slug: 'mi-restaurante'
    });

    return created.id;
}
