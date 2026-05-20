import express from 'express';
import security from '../middlewares/securityActions.js';
import * as controllerPedido from '../controllers/pedidoController.js';
import * as controllerPlatillo from '../controllers/menuController.js';



const router = express.Router();

router.get('/dashboard-metrics', controllerPedido.obtenerMetricasDashboard);
router.get('/estadisticas-ventas', controllerPedido.obtenerEstadisticasVentas);
router.post('/', controllerPedido.registrarPedido);
router.get('/caja/:idCaja', controllerPedido.obtenerPedidosCaja);
router.get('/cocina/:idCocina', controllerPedido.obtenerPendientesCocina);
router.get('/:id', controllerPlatillo.one);
router.put('/confirmar/:idPedido', controllerPedido.confirmarPago);
router.put('/confirmar-entrega/:idPedido', controllerPedido.terminarComanda);




export default router;
