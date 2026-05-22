import prisma from '../config/prisma.js';
import { resolveRestaurantId } from './restaurantService.js';


export async function all(){
    return await prisma.platillo.findMany({
        orderBy: {
            nombre_platillo: 'asc'
        }
    });
}

export async function one(id){
    return await prisma.platillo.findUnique({
        where: {id: Number(id)}
    })
}

export async function upsertPlatillo(data) {
    const restaurantId = await resolveRestaurantId(data.restaurantId);

    const platillo = {
        nombre_platillo: data.nombre_platillo,
        precio: Number(data.precio),
        contenido: data.contenido,
        status: data.status ?? "activo",
        category: data.category === "" ? "General" : data.category,
        imagen: data.imagen
    };

    const idSearch = data.id ? Number(data.id) : 0;

    return await prisma.platillo.upsert({
        where: { id: idSearch },
        update: platillo,
        create: {
            ...platillo,
            restaurantId
        }
    });
}


export async function delet(id){

    const idBorrar = Number(id);

    return await prisma.platillo.delete({
        where: { id: idBorrar }
    })
    
}

