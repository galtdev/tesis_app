import respuesta from "./response.js";

function errors(err, req, res, next) {
    console.error('[error]', err);

    const mensaje = err.message || 'Error interno';
    const status = err.statusCode || err.status || 500;

    // Ahora respuesta.error funcionará porque 'respuesta' es el objeto default
    respuesta.error(req, res, mensaje, status);
}

export default errors;
