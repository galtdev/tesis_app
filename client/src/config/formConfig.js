/* AUTH: camposLogin, camposRegistroSuperAdmin, dueño en camposRestaurant — CHANGELOG-AUTH.md */
// Login (restaurante y super admin)
export const camposLogin = [
  { name: 'correo', label: 'Correo electrónico', type: 'email', placeholder: 'correo@ejemplo.com', required: true },
  { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', required: true },
];

export const camposRegistroSuperAdmin = [
  { name: 'correo', label: 'Correo electrónico', type: 'email', placeholder: 'admin@plataforma.com', required: true },
  { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres', required: true },
  { name: 'password_confirm', label: 'Confirmar contraseña', type: 'password', placeholder: 'Repite la contraseña', required: true },
];


export const camposUsuario = [
  { name: 'nombre', label: 'Nombre Completo', placeholder: 'Ej: Galanton', required: true },
  { name: 'correo', label: 'Correo Electrónico', type: 'email', placeholder: 'correo@ejemplo.com', required: true },
  { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••', required: true },
  { 
    name: 'rol', 
    label: 'Rol del Usuario en el sistema', 
    type: 'select', 
    required: true,
    options: [
      { value: 'admin', label: 'Administrador' },
      { value: 'caja', label: 'Caja' },
      { value: 'cocina', label: 'Cocina' }
    ]
  }
];


// Agrega esto al final de tu archivo formConfig.js

export const camposConfirmarPago = [
  { 
    name: 'metodo', 
    label: 'Método de Pago', 
    type: 'select', 
    options: [
      { value: 'Transferencia', label: 'Transferencia Bancaria' },
      { value: 'Pago Movil', label: 'Pago Móvil' },
      { value: 'Efectivo', label: 'Efectivo' },
      { value: 'Punto de Venta', label: 'Punto de Venta' }
    ],
    required: true 
  },
  { 
    name: 'referencia', 
    label: 'Número de Referencia', 
    placeholder: 'Ej: 123456', 
    required: true 
  },
  { 
    name: 'monto', 
    label: 'Monto Total', 
    type: 'number', 
    placeholder: '0.00', 
    required: true 
  }
];

export const camposRestaurant = [
  { name: 'nombre', label: 'Nombre del restaurante', placeholder: 'Ej: Pizzería Pepe', required: true },
  { name: 'nombre_dueno', label: 'Nombre del dueño / administrador', placeholder: 'Ej: Juan Pérez', required: true },
  { name: 'correo', label: 'Correo de acceso al panel', type: 'email', placeholder: 'dueno@pizzeria.com', required: true },
  { name: 'password', label: 'Contraseña inicial', type: 'password', placeholder: 'Mínimo 6 caracteres', required: true },
  { name: 'ubicacion', label: 'Ubicación', placeholder: 'Ej: Av. Principal #12', required: true },
  {
    name: 'slug',
    label: 'Slug (URL)',
    placeholder: 'Ej: pizzeria-pepe',
    required: false
  },
  {
    name: 'status',
    label: 'Estado',
    type: 'select',
    required: true,
    options: [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ]
  },
  { name: 'horario', label: 'Horario', placeholder: 'Ej: Lun-Vie 8:00 - 22:00', required: false },
  {
    name: 'banner',
    label: 'URL del banner',
    placeholder: 'https://...',
    required: false
  }
];

export const camposMenu = [
    { name: 'nombre_platillo', label: 'Nombre del platillo', placeholder:'Introduzca nombre', required: true },
    { name: 'precio', label: 'Precio del platillo', placeholder:'Introduzca precio', required: true },
    { name: 'contenido', label: 'Contenido del platillo', placeholder:'Introduzca contenido', required: true },
    { name: 'category', label: 'Categoría', placeholder:'ej: comida, bebida', required: false },
    { name: 'imagen', label: 'Imagen del producto', type: 'file', required: true }
];


export const camposEditMenu = [
    { name: 'nombre_platillo', label: 'Nombre del platillo', placeholder:'Introduzca nombre', required: false },
    { name: 'precio', label: 'Precio del platillo', placeholder:'Introduzca precio', required: false },
    { name: 'contenido', label: 'Contenido del platillo', placeholder:'Introduzca contenido', required: false },
    { name: 'category', label: 'Categoría', placeholder:'ej: comida, bebida', required: false },
    { name: 'imagen', label: 'Actualizar imagen', type: 'file', required: false }
];



export const camposPedido = [
  { name: 'nombre_cliente', label: 'Nombre del cliente', placeholder: 'Nombre', required: true },
  { name: 'cedula', label: 'Cédula', placeholder: 'Ej: 12345678', required: true },
  { 
    name: 'telefono', 
    label: 'Teléfono de contacto', 
    type: 'tel', 
    placeholder: 'Ej. 04125556677', 
    required: true 
  },
  { 
    name: 'numero_mesa', 
    label: 'Número de Mesa', 
    type: 'number', 
    placeholder: 'Ej. 5', 
    required: true 
  },
  { 
    name: 'tipo_servicio', 
    label: '¿Cómo desea su pedido?', 
    type: 'select', 
    options: [
      { value: 'comedor', label: 'Comer en el sitio' },
      { value: 'llevar', label: 'Para llevar' }
    ],
    required: true 
  }
];



export const camposPago = [
  { 
    name: 'metodo', 
    label: 'Método de Pago', 
    type: 'select', 
    options: [
      { value: 'Transferencia', label: 'Transferencia Bancaria' },
      { value: 'Pago Móvil', label: 'Pago Móvil' },
      { value: 'Efectivo', label: 'Efectivo (Dólares/Soberanos)' },
      { value: 'Punto de Venta', label: 'Punto de Venta' }
    ],
    required: true 
  },
  { 
    name: 'referencia', 
    label: 'Número de Referencia', 
    type: 'text', 
    placeholder: 'Ej. REF-998877', 
    required: true 
  }
];

