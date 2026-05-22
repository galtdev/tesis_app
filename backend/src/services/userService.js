/* AUTH: Staff del restaurante — roles Prisma, restaurantId obligatorio, caja/cocina */
import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import { normalizeRol } from '../utils/roles.js';

export async function all(restaurantId = null) {
    return await prisma.usuario.findMany({
        where: restaurantId ? { restaurantId: Number(restaurantId) } : undefined,
        include: {
            auth: true,
        },
    });
}

export async function one(id) {
    return await prisma.usuario.findUnique({
        where: { id: Number(id) } 
    });
}



export async function save(data, authData) {
    
    const { id, ...rest } = data;

    if (id) {
        return await prisma.usuario.update({
            where: { id: Number(id) },
            data: rest 
        });
    } 


    return await prisma.$transaction(async (tx) => {
        let passwordHasheada = null;
        if (authData && authData.password) {
            passwordHasheada = await bcrypt.hash(authData.password.toString(), 10);
        }

        const prismaRol = authData?.rol ? normalizeRol(authData.rol) : undefined;
        const restaurantId = Number(rest.restaurantId);

        if (!restaurantId) {
            throw new Error('restaurantId es obligatorio para crear usuarios');
        }

        const newUser = await tx.usuario.create({
            data: {
                ...rest,
                restaurantId,
                auth: authData
                    ? {
                          create: {
                              correo: authData.correo,
                              password: passwordHasheada,
                              rol: prismaRol,
                          },
                      }
                    : undefined,
            },
        });

        if (prismaRol === 'STAFF_COCINA') {
            await tx.cocina.create({
                data: { usuarioId: newUser.id, restaurantId },
            });
        } else if (prismaRol === 'STAFF_CAJA') {
            await tx.caja.create({
                data: { usuarioId: newUser.id, restaurantId },
            });
        }

        return newUser;
    });
}


export async function delet(id) {
    return await prisma.usuario.delete({
        where: { id: Number(id) }
    });
}

