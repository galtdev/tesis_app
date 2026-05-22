import * as db from '../services/userService.js';
import * as resp from '../red/response.js';
import * as auth from '../auth/controllerAuth.js';

async function all(req, res, next) {
    try {
        const restaurantId = req.user?.restaurantId ?? null;
        const items = await db.all(restaurantId);
        resp.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
}

async function one(req, res, next) {
    try {
        const item = await db.one(req.params.id);
        if (item) {
            resp.success(req, res, { msj: 'item encontrado', data: item }, 200);
        } else {
            resp.error(req, res, 'No se encontró ningún registro', 404);
        }
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const { correo, password, rol, ...datosUsuario } = req.body;
        const authData = correo || password ? { correo, password, rol } : null;

        if (req.user?.restaurantId) {
            datosUsuario.restaurantId = req.user.restaurantId;
        }

        const userSave = await db.save(datosUsuario, authData);

        resp.success(req, res, { msj: 'Registro exitoso', data: userSave }, 201);
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const item = await db.save(req.body);       
        resp.success(req, res, { msj: 'Registro actualizado con éxito', data: item }, 200);       
    } catch (err) {
        next(err);
    }
}

async function delet(req, res, next) {
    try {
        await db.delet(req.params.id);
        resp.success(req, res, 'Eliminado satisfactoriamente', 200);
    } catch (err) {
        resp.error(req, res, 'No se pudo eliminar el registro o no existe', 404);
    }
}


export {
    all,
    one,
    delet,
    create,
    update
};