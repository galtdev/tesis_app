import * as pedidoService from '../services/pedidoService.js';
import resp from '../red/response.js';

export async function registrarPedido(req, res, next) {
    try {
        const result = await pedidoService.procesarPedido(req.body);
        const data = {
            msj: "Pedido registrado. Pendiente de pago para pasar a cocina.",
            id_pedido: result.id
        }
        resp.success(req, res, data, 201);
    } catch (err) {
        console.error(err);
        resp.error(req, res, "Error al procesar el pedido", 500);
    }
}

// NUEVA: Esta es la que "mueve" el pedido de Caja a Cocina
export async function confirmarPago(req, res, next) {
    try {
        const { idPedido } = req.params;
        const datosPago = req.body; // Espera { monto, metodo, referencia }

        const result = await pedidoService.confirmarPedidoEnCaja(idPedido, datosPago);
        
        resp.success(req, res, { msj: "Pago confirmado. Enviado a cocina.", data: result }, 200);
    } catch (err) {
        console.error(err);
        resp.error(req, res, "No se pudo confirmar el pago", 500);
    }
}

export async function obtenerPedidosCaja(req, res, next) {
    try {
        const { idCaja } = req.params; 
        const pedidos = await pedidoService.consultarPedidosPorCaja(idCaja);

        // Si devuelve un array vacío, enviamos el array vacío con 200 (es normal que no haya pendientes)
        resp.success(req, res, pedidos || [], 200);
    } catch (err) {
        next(err);
    }
}

export async function obtenerPendientesCocina(req, res, next) {
    try {
        const { idCocina } = req.params;
        const pendientes = await pedidoService.consultarPedidosCocina(idCocina);

        resp.success(req, res, pendientes || [], 200);
    } catch (err) {
        next(err);
    }
}

export async function terminarComanda(req, res, next) {
    try {
        const { idPedido } = req.params; // El ID que viene de la URL de la card
        
        const result = await pedidoService.finalizarPreparacion(idPedido);
        
        resp.success(req, res, { 
            msj: "Comanda terminada. Los platos han sido marcados como completados.", 
            data: result 
        }, 200);
    } catch (err) {
        console.error(err);
        resp.error(req, res, "No se pudo finalizar la comanda en cocina", 500);
    }
}


// controllers/pedidoController.js
export async function obtenerMetricasDashboard(req, res, next) {
    try {
        const metrics = await pedidoService.consultarMetricasDashboard();
        resp.success(req, res, metrics, 200);
    } catch (err) {
        // ESTO ES CLAVE: Imprime el error exacto de Prisma en tu terminal
        console.log("MENSAJE DE PRISMA:", err.message); 
        resp.error(req, res, err.message, 500); 
    }
}

export async function obtenerEstadisticasVentas(req, res, next) {
    try {
        const data = await pedidoService.consultarEstadisticasVentas(req.query.dias);
        resp.success(req, res, data, 200);
    } catch (err) {
        console.log("MENSAJE DE PRISMA:", err.message);
        resp.error(req, res, err.message, 500);
    }
}