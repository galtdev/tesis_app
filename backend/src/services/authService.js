/* AUTH: Consultas auth, createSuperAdmin, query con usuario/restaurant */
import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

export async function query(consulta) {
    try {
        return await prisma.auth.findFirst({
            where: consulta,
            include: {
                usuario: {
                    include: { restaurant: true },
                },
            },
        });
    } catch (error) {
        console.error("Error en authService query:", error);
        return null;
    }
}

// NUEVA: Para guardar específicamente en la tabla Auth
export async function countSuperAdmins() {
    return prisma.auth.count({ where: { rol: 'SUPER_ADMIN' } });
}

export async function createSuperAdmin({ correo, password }) {
    const exists = await prisma.auth.findUnique({ where: { correo } });
    if (exists) {
        throw Object.assign(new Error('El correo ya está registrado'), { statusCode: 409 });
    }

    const passwordHash = await bcrypt.hash(password.toString(), 10);

    return prisma.auth.create({
        data: {
            correo,
            password: passwordHash,
            rol: 'SUPER_ADMIN',
        },
    });
}

export async function saveAuth(data) {
    return await prisma.auth.upsert({
        where: { id: Number(data.id) },
        update: {
            correo: data.correo,
            password: data.password,
            rol: data.rol || 'admin'
        },
        create: {
            id: Number(data.id),
            correo: data.correo,
            password: data.password,
            rol: data.rol || 'admin'
        }
    });
}