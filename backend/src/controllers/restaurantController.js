import * as service from '../services/restaurantService.js';
import * as resp from '../red/response.js';

export async function store(req, res, next) {
    try {
        const items = await service.all();
        resp.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
}

export async function create(req, res, next) {
    try {
        const {
            nombre,
            ubicacion,
            status,
            horario,
            banner,
            slug,
            nombre_dueno,
            correo,
            password,
        } = req.body;

        if (!nombre?.trim() || !ubicacion?.trim()) {
            return resp.error(req, res, 'Nombre y ubicación son obligatorios', 400);
        }

        if (!correo?.trim() || !password) {
            return resp.error(req, res, 'Correo y contraseña del dueño son obligatorios', 400);
        }

        const item = await service.create({
            nombre,
            ubicacion,
            status,
            horario,
            banner,
            slug,
            nombre_dueno,
            correo,
            password,
        });

        resp.success(
            req,
            res,
            {
                restaurant: item,
                msj: `Restaurante creado. El dueño entra en /admin/login con ${item.dueno.correo}`,
                loginPath: '/admin/login',
                duenoCorreo: item.dueno.correo,
            },
            201
        );
    } catch (err) {
        next(err);
    }
}

export async function delet(req, res, next) {
    try {
        await service.delet(req.params.id);
        resp.success(req, res, 'Restaurante eliminado', 200);
    } catch (err) {
        next(err);
    }
}
