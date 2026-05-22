/* AUTH: Solo SUPER_ADMIN — ver CHANGELOG-AUTH.md */
import express from 'express';
import security from '../middlewares/securityActions.js';
import * as controller from '../controllers/restaurantController.js';

const router = express.Router();

router.get(
    '/',
    security.isLogged(),
    security.checkRoles('SUPER_ADMIN'),
    controller.store
);
router.post(
    '/',
    security.isLogged(),
    security.checkRoles('SUPER_ADMIN'),
    controller.create
);
router.delete(
    '/:id',
    security.isLogged(),
    security.checkRoles('SUPER_ADMIN'),
    controller.delet
);

export default router;
