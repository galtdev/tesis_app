import express from 'express';
import upload from '../middlewares/multer.js';
import security from '../middlewares/securityActions.js';

import * as controllerMenu from '../controllers/menuController.js';

const router = express.Router();

const staffRestaurant = security.checkRoles(
    'DUENO_RESTAURANT',
    'STAFF_CAJA',
    'STAFF_COCINA'
);

router.get('/', security.isLogged(), staffRestaurant, controllerMenu.store);
router.post(
    '/',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT'),
    upload.single('imagen'),
    controllerMenu.create
);
router.delete(
    '/:id',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT'),
    controllerMenu.delet
);

export default router;