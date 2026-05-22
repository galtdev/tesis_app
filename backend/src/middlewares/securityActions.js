import auth from '../auth/index.js';
import { error } from '../red/response.js';
import { normalizeRol } from '../utils/roles.js';

const isLogged = () => {
    return (req, res, next) => {
        try {
            auth.checkToken.confirmToken(req);
            next();
        } catch (err) {
            error(req, res, 'Debes iniciar sesión para realizar esta acción', 401);
        }
    };
};

const checkRol = (rolRequired) => {
    return checkRoles(rolRequired);
};

const checkRoles = (...rolesRequired) => {
    const allowed = rolesRequired.flat().map(normalizeRol);

    return (req, res, next) => {
        try {
            const user = auth.checkToken.confirmToken(req);
            const userRol = normalizeRol(user.rol);

            if (!allowed.includes(userRol)) {
                return error(req, res, `Tu rol (${userRol}) no tiene permisos para esta acción`, 403);
            }

            next();
        } catch (err) {
            error(req, res, 'No tienes permisos', 401);
        }
    };
};

export default {
    isLogged,
    checkRol,
    checkRoles,
};

