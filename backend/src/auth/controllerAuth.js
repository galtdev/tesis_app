
import * as dbauth from '../services/authService.js';
import * as resp from '../red/response.js';
import bcrypt from 'bcrypt';
import auth from '../auth/index.js';
import { normalizeRol } from '../utils/roles.js';

function buildSessionPayload(authRecord) {
    const usuario = authRecord.usuario;
    return {
        authId: authRecord.id,
        correo: authRecord.correo,
        rol: authRecord.rol,
        usuarioId: authRecord.usuarioId ?? null,
        restaurantId: usuario?.restaurantId ?? null,
        restaurantNombre: usuario?.restaurant?.nombre ?? null,
        restaurantSlug: usuario?.restaurant?.slug ?? null,
        nombre: usuario?.nombre ?? null,
    };
}

async function login(req, res, next) {
    try {
        const { correo, password, tipo } = req.body;

        if (!correo?.trim() || !password) {
            return next(Object.assign(new Error('Correo y contraseña son obligatorios'), { statusCode: 400 }));
        }

        const usuarioLog = await dbauth.query({ correo: correo.trim() });

        if (!usuarioLog) {
            return next(Object.assign(new Error('Información inválida'), { statusCode: 401 }));
        }

        const comparePass = await bcrypt.compare(password, usuarioLog.password);

        if (!comparePass) {
            return next(Object.assign(new Error('Información inválida'), { statusCode: 401 }));
        }

        const session = buildSessionPayload(usuarioLog);
        const rolNorm = normalizeRol(session.rol);

        if (tipo === 'super-admin' && rolNorm !== 'SUPER_ADMIN') {
            return next(Object.assign(new Error('No tienes acceso a la plataforma'), { statusCode: 403 }));
        }

        if (tipo === 'restaurant' && rolNorm === 'SUPER_ADMIN') {
            return next(Object.assign(new Error('Usa el acceso de plataforma para super administrador'), { statusCode: 403 }));
        }

        if (tipo === 'restaurant' && !['DUENO_RESTAURANT', 'STAFF_CAJA', 'STAFF_COCINA'].includes(rolNorm)) {
            return next(Object.assign(new Error('No tienes acceso al panel del restaurante'), { statusCode: 403 }));
        }

        const token = auth.generateToken({
            id: usuarioLog.id,
            ...session,
        });

        resp.success(req, res, { token, user: session }, 200);
    } catch (err) {
        next(err);
    }
}

async function registerSuperAdminStatus(req, res, next) {
    try {
        const total = await dbauth.countSuperAdmins();
        resp.success(
            req,
            res,
            {
                canRegister: true,
                requiresAuth: total > 0,
                hasSuperAdmin: total > 0,
            },
            200
        );
    } catch (err) {
        next(err);
    }
}

async function registerSuperAdmin(req, res, next) {
    try {
        const { correo, password, password_confirm } = req.body;
        const total = await dbauth.countSuperAdmins();

        if (total > 0) {
            try {
                auth.checkToken.confirmToken(req);
            } catch {
                return next(
                    Object.assign(
                        new Error('Debes iniciar sesión como super admin para registrar otro'),
                        { statusCode: 401 }
                    )
                );
            }

            if (normalizeRol(req.user.rol) !== 'SUPER_ADMIN') {
                return next(
                    Object.assign(new Error('Solo un super admin puede crear otro'), { statusCode: 403 })
                );
            }
        }

        if (!correo?.trim() || !password) {
            return next(
                Object.assign(new Error('Correo y contraseña son obligatorios'), { statusCode: 400 })
            );
        }

        if (password.length < 6) {
            return next(
                Object.assign(new Error('La contraseña debe tener al menos 6 caracteres'), {
                    statusCode: 400,
                })
            );
        }

        if (password_confirm !== undefined && password !== password_confirm) {
            return next(Object.assign(new Error('Las contraseñas no coinciden'), { statusCode: 400 }));
        }

        const authRecord = await dbauth.createSuperAdmin({
            correo: correo.trim(),
            password,
        });

        const session = buildSessionPayload(authRecord);
        const token = auth.generateToken({
            id: authRecord.id,
            ...session,
        });

        resp.success(req, res, { token, user: session, msj: 'Super administrador registrado' }, 201);
    } catch (err) {
        next(err);
    }
}

async function me(req, res, next) {
    try {
        const authRecord = await dbauth.query({ id: req.user.id ?? req.user.authId });

        if (!authRecord) {
            return next(Object.assign(new Error('Sesión no válida'), { statusCode: 401 }));
        }

        resp.success(req, res, { user: buildSessionPayload(authRecord) }, 200);
    } catch (err) {
        next(err);
    }
}

async function create(data, authData) {
    try {
        const authData = {
            id: data.id,
            correo: data.correo,
            rol: data.rol 
        };
        
        if (data.password) {
            authData.password = await bcrypt.hash(data.password.toString(), 5);
        }

        return await dbauth.saveAuth(authData);   
            
    } catch (err) {
        throw err;
    }
}

export {
    create,
    login,
    me,
    registerSuperAdmin,
    registerSuperAdminStatus,
};