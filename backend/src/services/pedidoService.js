import prisma from '../config/prisma.js';

// 1. REGISTRAR EL PEDIDO (ESTADO INICIAL)
// 1. REGISTRAR EL PEDIDO (Versión corregida para Verificación)
export async function procesarPedido(data) {
    return await prisma.$transaction(async (tx) => {
        
        const nuevoPedido = await tx.pedido.create({
            data: {
                mesa: data.mesa || "Barra",
                tipo_pedido: data.tipo_pedido || "Local",
                status: "ESPERANDO_PAGO", // Se queda aquí hasta que caja confirme
                status_pago: data.status_pago || "PENDIENTE",  
                caja: { connect: { id: Number(data.cajaId) } },
                cliente: {
                    connectOrCreate: {
                        where: { cedula: String(data.cedula) },
                        create: {
                            cedula: String(data.cedula),
                            nombre: data.nombre_cliente || "Cliente General",
                            telefono: data.telefono || "0000"
                        }
                    }
                }
            }
        });

        const listaProductos = data.productos || [];
        
        const detallesPromises = listaProductos.map(p => {
            return tx.detallePedido.create({
                data: {
                    nombre_platillo: p.nombre_platillo,
                    precio: Number(p.precio),
                    status: 'ESPERANDO_PAGO', // BLOQUEADO para cocina
                    platillo: { connect: { id: Number(p.id) } },
                    cocina: { connect: { id: Number(data.cocinaId) } },
                    pedido: { connect: { id: nuevoPedido.id } }
                }
            });
        });

        await Promise.all(detallesPromises);

        // Si el cliente envía datos de pago (Transferencia, etc.)
        // Registramos el intento de pago, pero NO cambiamos los status a "PAGADO" ni "EN_PREPARACION"
        if (data.pago) {
            await tx.pago.create({
                data: {
                    monto: Number(data.pago.monto),
                    metodo_pago: data.pago.metodo || "Efectivo",
                    referencia: String(data.pago.referencia || "S/N"),
                    pedido: { connect: { id: nuevoPedido.id } }
                }
            });
            
            // Opcional: Asegurarnos de que el status sea POR_VERIFICAR si hay datos de pago
            await tx.pedido.update({
                where: { id: nuevoPedido.id },
                data: { status_pago: "POR_VERIFICAR" }
            });
        }

        return nuevoPedido;
    });
}
// 2. CONFIRMAR PAGO (DISPARADOR PARA COCINA)
export async function confirmarPedidoEnCaja(pedidoId, datosPago) {
    return await prisma.$transaction(async (tx) => {
        // 1. Si el pago ya existía (POR_VERIFICAR), podrías actualizarlo. 
        // Si no existía, lo creas.
        
        await tx.pedido.update({
            where: { id: Number(pedidoId) },
            data: { 
                status: 'CONFIRMADO', 
                status_pago: 'PAGADO' // 👈 Aquí se libera
            }
        });

        return await tx.detallePedido.updateMany({
            where: { pedidoId: Number(pedidoId) },
            data: { status: 'EN_PREPARACION' } // 👈 Ahora el Chef lo ve
        });
    });
}



export async function consultarPedidosPorCaja(cajaId) {
    return await prisma.pedido.findMany({
        where: {
            cajaId: Number(cajaId),
            status_pago: {
                in: ["PENDIENTE", "POR_VERIFICAR"] // 👈 Trae ambos tipos
            }
        },
        include: {
            cliente: true,
            detalles: true,
            pago: true // 👈 Importante para que el cajero vea la referencia/monto que mandó el cliente
        },
        orderBy: { id: 'desc' }
    });
}

// 4. CONSULTA PARA LA COCINA (LO PAGADO LISTO PARA COCINAR)
export async function consultarPedidosCocina(cocinaId) {
    return await prisma.detallePedido.findMany({
        where: {
            cocinaId: Number(cocinaId),
            status: 'EN_PREPARACION' // 👈 Solo lo que ya se pagó
        },
        include: {
            pedido: {
                select: {
                    mesa: true,
                    tipo_pedido: true,
                    id: true 
                }
            }
        },
        orderBy: { id: 'asc' }
    });
}


// En pedidoController.js
export async function finalizarPreparacion(pedidoId) {
    return await prisma.$transaction(async (tx) => {
        // 1. Actualizamos todos los platos de ese pedido de golpe
        const detallesActualizados = await tx.detallePedido.updateMany({
            where: {
                pedidoId: Number(pedidoId),
                status: 'EN_PREPARACION' // Solo los que están en cocina
            },
            data: {
                status: 'COMPLETADO',
                fechaComplecion: new Date()
            }
        });

        // 2. Actualizamos el estado general del pedido a ENTREGADO
        await tx.pedido.update({
            where: { id: Number(pedidoId) },
            data: { status: 'ENTREGADO' }
        });

        return detallesActualizados;
    });
}

export async function consultarMetricasDashboard() {
    try {
        const inicioHoy = new Date();
        inicioHoy.setHours(0, 0, 0, 0);

        // 1. Ejecutamos los conteos (Caja, Cocina y Menú)
        const [enCaja, enCocina, totalPlatillos] = await Promise.all([
            prisma.pedido.count({
                where: { status_pago: { in: ["PENDIENTE", "POR_VERIFICAR"] } }
            }),
            prisma.detallePedido.count({
                where: { status: "EN_PREPARACION" }
            }),
            prisma.platillo.count(),
        ]);

        // 2. RECAUDACIÓN: Sumamos los platos marcados como COMPLETADO hoy
        // Buscamos los detalles que cambiaron a COMPLETADO y sumamos su precio
        const platosTerminados = await prisma.detallePedido.findMany({
            where: {
                status: "COMPLETADO",
                pedido: {
                    // Opcional: filtrar por pedidos que se pagaron hoy
                    status_pago: "PAGADO"
                }
            },
            select: {
                precio: true
            }
        });

        // 3. Calculamos el total asegurando que sea un número plano (evita el error 500)
        const totalRecaudado = platosTerminados.reduce((acc, item) => {
            const valor = parseFloat(item.precio);
            return acc + (isNaN(valor) ? 0 : valor);
        }, 0);

        return {
            enCaja,
            enCocina,
            totalPlatillos,
            recaudado: totalRecaudado // Enviamos un Number estándar
        };
    } catch (error) {
        console.error("❌ Error en pedidoService (Dashboard):", error.message);
        throw error;
    }
}

function localDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function inicioRangoVentas(dias) {
    const n = Math.min(31, Math.max(1, Number(dias) || 14));
    const fin = new Date();
    fin.setHours(0, 0, 0, 0);
    const desde = new Date(fin);
    desde.setDate(desde.getDate() - (n - 1));
    return { n, desde };
}

export async function consultarVentasPorDia(dias = 14) {
    const { n, desde } = inicioRangoVentas(dias);

    const rows = await prisma.detallePedido.findMany({
        where: {
            status: 'COMPLETADO',
            fechaComplecion: { gte: desde },
            pedido: { status_pago: 'PAGADO' }
        },
        select: { precio: true, fechaComplecion: true }
    });

    const byDay = {};
    for (const r of rows) {
        if (!r.fechaComplecion) continue;
        const key = localDateKey(new Date(r.fechaComplecion));
        byDay[key] = (byDay[key] || 0) + Number(r.precio);
    }

    const serie = [];
    for (let i = 0; i < n; i++) {
        const dt = new Date(desde);
        dt.setDate(desde.getDate() + i);
        const key = localDateKey(dt);
        serie.push({ fecha: key, total: Math.round((byDay[key] || 0) * 100) / 100 });
    }

    return serie;
}

export async function consultarEstadisticasVentas(dias = 14) {
    const { n, desde } = inicioRangoVentas(dias);
    const porDia = await consultarVentasPorDia(dias);

    const detalles = await prisma.detallePedido.findMany({
        where: {
            status: 'COMPLETADO',
            fechaComplecion: { gte: desde },
            pedido: { status_pago: 'PAGADO' }
        },
        select: { nombre_platillo: true, precio: true }
    });

    const totalIngresos = porDia.reduce((acc, r) => acc + r.total, 0);
    const diasConVentas = porDia.filter((r) => r.total > 0).length;
    const promedioDiario = Math.round((totalIngresos / n) * 100) / 100;
    const promedioEnDiasConVenta = diasConVentas
        ? Math.round((totalIngresos / diasConVentas) * 100) / 100
        : 0;

    let mejorDia = null;
    for (const r of porDia) {
        if (r.total <= 0) continue;
        if (!mejorDia || r.total > mejorDia.total) {
            mejorDia = { fecha: r.fecha, total: r.total };
        }
    }

    const byName = {};
    for (const d of detalles) {
        const k = d.nombre_platillo;
        if (!byName[k]) {
            byName[k] = { nombre: k, unidades: 0, monto: 0 };
        }
        byName[k].unidades += 1;
        byName[k].monto += Number(d.precio);
    }
    const topPlatillos = Object.values(byName)
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 10)
        .map((p) => ({
            nombre: p.nombre,
            unidades: p.unidades,
            monto: Math.round(p.monto * 100) / 100
        }));

    return {
        porDia,
        resumen: {
            totalIngresos: Math.round(totalIngresos * 100) / 100,
            promedioDiario,
            promedioEnDiasConVenta,
            diasConVentas,
            diasEnPeriodo: n,
            mejorDia,
            platillosVendidos: detalles.length,
            topPlatillos
        }
    };
}