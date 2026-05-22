import express from 'express';
import security from '../middlewares/securityActions.js';
import * as controller from '../controllers/userController.js';
import * as controllerAuth from '../auth/controllerAuth.js';

const router = express.Router();

router.post('/login', controllerAuth.login);
router.get('/register-super-admin/status', controllerAuth.registerSuperAdminStatus);
router.post('/register-super-admin', controllerAuth.registerSuperAdmin);
router.get('/me', security.isLogged(), controllerAuth.me);

router.get(
    '/',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT', 'SUPER_ADMIN'),
    controller.all
);
router.post(
    '/',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT'),
    controller.create
);
router.post(
    '/update',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT'),
    controller.update
);
router.get(
    '/:id',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT', 'SUPER_ADMIN'),
    controller.one
);
router.delete(
    '/:id',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT'),
    controller.delet
);

export default router;