import express from 'express';
import security from '../middlewares/securityActions.js';
import * as controllerPedido from '../controllers/pedidoController.js';
import * as controllerPlatillo from '../controllers/menuController.js';



const router = express.Router();

const staffRestaurant = security.checkRoles(
    'DUENO_RESTAURANT',
    'STAFF_CAJA',
    'STAFF_COCINA'
);

router.post('/', controllerPedido.registrarPedido);

router.get(
    '/dashboard-metrics',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT', 'STAFF_CAJA'),
    controllerPedido.obtenerMetricasDashboard
);
router.get(
    '/estadisticas-ventas',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT'),
    controllerPedido.obtenerEstadisticasVentas
);
router.get(
    '/caja/:idCaja',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT', 'STAFF_CAJA'),
    controllerPedido.obtenerPedidosCaja
);
router.get(
    '/cocina/:idCocina',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT', 'STAFF_COCINA'),
    controllerPedido.obtenerPendientesCocina
);
router.get('/:id', controllerPlatillo.one);
router.put(
    '/confirmar/:idPedido',
    security.isLogged(),
    security.checkRoles('DUENO_RESTAURANT', 'STAFF_CAJA'),
    controllerPedido.confirmarPago
);
router.put(
    '/confirmar-entrega/:idPedido',
    security.isLogged(),
    staffRestaurant,
    controllerPedido.terminarComanda
);




export default router;
