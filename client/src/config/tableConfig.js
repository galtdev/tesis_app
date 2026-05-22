// src/pages/admin/usuariosConfig.js
export const usuariosColumns = [
  { label: 'Nombre', key: 'nombre' },
  { label: 'Email', key: 'auth.correo' },
  { label: 'Rol', key: 'auth.rol' },
  { label: 'Status', key: 'status' },
  { label: 'Prueba', key: 'prueba' }
];

export const restaurantColumns = [
  { label: 'Nombre', key: 'nombre' },
  { label: 'Correo dueño', key: 'usuarios.0.auth.correo' },
  { label: 'Ubicación', key: 'ubicacion' },
  { label: 'Slug', key: 'slug' },
  { label: 'Estado', key: 'status' },
  { label: 'Horario', key: 'horario' },
  { label: 'Plataforma', key: 'platform.nombre' }
];

export const menuColums = [
  { label: 'Plato', key: 'nombre_platillo' },
  { label: 'Contenido', key: 'contenido' },
  { label: 'Precio', key: 'precio' },
  { label: 'Estado', key: 'status' }
];


// src/config/tableConfig.js
// src/config/tableConfig.js
export const cajaColumns = [
  { label: 'ID', key: 'id' },
  { label: 'Cliente', key: 'cliente.nombre' }, // Nota que es 'cliente.nombre' no 'nombre_cliente'
  { label: 'Mesa', key: 'mesa' },
  { label: 'Tipo', key: 'tipo_pedido' },
  { label: 'Total', key: 'pago.0.monto' },    // Accedemos al índice 0 del array pago
  { label: 'Método', key: 'pago.0.metodo_pago' },  // Accedemos al índice 0 del array pago
  { label: 'Estado', key: 'status_pago' }
];


// src/config/tableConfig.js
export const cocinaColumns = [
  { label: 'Orden #', key: 'pedidoId' },
  { label: 'Mesa', key: 'pedido.mesa' },
  { label: 'Tipo', key: 'pedido.tipo_pedido' },
  { label: 'Platillo', key: 'nombre_platillo' },
  { label: 'Estado', key: 'status' },
  // Si tienes un campo de hora de creación en el pedido:
  // { label: 'Hora', key: 'pedido.createdAt' } 
];


