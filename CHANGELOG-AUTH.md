# Changelog — Autenticación y roles

Documento de referencia para ubicar los cambios de auth en el proyecto.
El backend ya tenía JWT y login; este trabajo **conectó el frontend**, **protegió rutas** y **completó altas** (super admin y dueño de restaurante).

---

## Resumen

| Área | Estado anterior | Estado actual |
|------|-----------------|---------------|
| Login API | `POST /api/auth/login` → solo `{ token }` | `{ token, user }` + validación por `tipo` |
| Frontend | Sin pantallas de login ni token en peticiones | `AuthContext`, login, rutas protegidas |
| Rutas API | `securityActions` existía pero casi no se usaba | Menú, usuarios, restaurantes, pedidos admin protegidos |
| Alta restaurante | Solo datos del comercio | Crea dueño (`DUENO_RESTAURANT`) con correo y contraseña |
| Super admin | Sin registro en UI | `/super-admin/registro` + endpoints dedicados |

---

## Flujos de uso

### 1. Primera vez — plataforma (super admin)

```
/super-admin/registro  →  primera cuenta (si no hay ningún SUPER_ADMIN)
/super-admin/login     →  sesión de plataforma
/super-admin/restaurantes  →  alta de comercios
```

### 2. Alta de restaurante (super admin)

En el formulario de restaurante se pide:

- Nombre del restaurante, ubicación, slug, etc.
- **Nombre del dueño**
- **Correo de acceso** (login del panel)
- **Contraseña inicial**

Se crean en transacción: `restaurant` + `usuario` + `auth` (rol `DUENO_RESTAURANT`).

### 3. Panel del restaurante

```
/admin/login  →  correo/contraseña del dueño o staff
/admin/dashboard, /menu, /usuarios, /caja, /cocina  →  según rol
```

### 4. Staff (caja / cocina)

El **dueño** logueado crea usuarios en `/admin/usuarios` (roles `admin` / `caja` / `cocina` en el formulario; el backend los mapea a enums Prisma).

### 5. Menú cliente

`/menu/*` sigue **sin login** (pedidos públicos).

---

## Roles (Prisma `enum Rol`)

| Enum | Uso en UI / form | Acceso típico |
|------|------------------|---------------|
| `SUPER_ADMIN` | Plataforma | `/super-admin/*` |
| `DUENO_RESTAURANT` | `admin` en form usuarios | Casi todo `/admin/*` |
| `STAFF_CAJA` | `caja` | Dashboard, caja |
| `STAFF_COCINA` | `cocina` | Cocina |
| `CLIENTE` | — | Menú público (futuro) |

Mapeo legacy → Prisma: `backend/src/utils/roles.js` y `client/src/config/roles.js`.

---

## API — endpoints de auth

| Método | Ruta | Auth | Body / notas |
|--------|------|------|----------------|
| POST | `/api/auth/login` | No | `{ correo, password, tipo?: "super-admin" \| "restaurant" }` |
| GET | `/api/auth/me` | Bearer | Refresca `user` en sesión |
| GET | `/api/auth/register-super-admin/status` | No | `{ hasSuperAdmin, requiresAuth, canRegister }` |
| POST | `/api/auth/register-super-admin` | No* | `{ correo, password, password_confirm? }` |
| POST | `/api/restaurant` | Super admin | Incluye `nombre_dueno`, `correo`, `password` |
| CRUD | `/api/user` | Dueño / super admin | Staff del restaurante del token |

\* Si ya existe un super admin, requiere Bearer de otro `SUPER_ADMIN`.

Respuesta estándar del backend: `{ error, status, body }`. El token va en `Authorization: Bearer <token>`.

---

## Archivos — Backend

### Auth core

| Archivo | Descripción |
|---------|-------------|
| `backend/src/auth/index.js` | Genera y verifica JWT; inyecta `req.user` |
| `backend/src/auth/controllerAuth.js` | `login`, `me`, `registerSuperAdmin`, `create` |
| `backend/src/services/authService.js` | Query auth + usuario/restaurant; `createSuperAdmin` |
| `backend/src/utils/roles.js` | `normalizeRol()`, mapeo admin/caja/cocina |

### Middleware y rutas

| Archivo | Descripción |
|---------|-------------|
| `backend/src/middlewares/securityActions.js` | `isLogged()`, `checkRoles(...)` |
| `backend/src/routes/userRutas.js` | Login, me, registro super admin, CRUD usuarios |
| `backend/src/routes/restaurantRouter.js` | Solo `SUPER_ADMIN` |
| `backend/src/routes/adminRouter.js` | Menú admin protegido por rol |
| `backend/src/routes/webRouter.js` | Pedido público POST `/`; resto con roles |
| `backend/src/red/errors.js` | Respeta `err.statusCode` (400, 401, 403, 409) |

### Negocio

| Archivo | Descripción |
|---------|-------------|
| `backend/src/services/restaurantService.js` | Alta restaurante + dueño con correo |
| `backend/src/controllers/restaurantController.js` | Valida correo/password; respuesta con `duenoCorreo` |
| `backend/src/services/userService.js` | Usuarios por `restaurantId`; roles Prisma; caja/cocina |
| `backend/src/controllers/userController.js` | `restaurantId` desde `req.user` al crear |

### Utilidad

| Archivo | Descripción |
|---------|-------------|
| `backend/scripts/seedAuth.js` | Usuarios de prueba (opcional): `node scripts/seedAuth.js` |

---

## Archivos — Frontend

### Sesión y rutas

| Archivo | Descripción |
|---------|-------------|
| `client/src/context/AuthContext.jsx` | Token en `localStorage`, login, logout, registerSuperAdmin |
| `client/src/services/api.js` | Header `Authorization`; errores desde `body` |
| `client/src/config/roles.js` | Roles, `ADMIN_NAV`, `getDefaultAdminPath()` |
| `client/src/components/ProtectedRoute.jsx` | Guard de rutas por autenticación y rol |
| `client/src/App.jsx` | Rutas login, super-admin, admin por rol |
| `client/src/main.jsx` | `<AuthProvider>` envuelve la app |

### Pantallas auth

| Ruta | Archivo |
|------|---------|
| `/admin/login` | `client/src/pages/auth/LoginPage.jsx` (`variant="restaurant"`) |
| `/super-admin/login` | `LoginPage.jsx` (`variant="super-admin"`) |
| `/super-admin/registro` | `client/src/pages/auth/SuperAdminRegisterPage.jsx` |
| Estilos | `client/src/styles/login.css` |

### Config y UI

| Archivo | Descripción |
|---------|-------------|
| `client/src/config/formConfig.js` | `camposLogin`, `camposRegistroSuperAdmin`, dueño en `camposRestaurant` |
| `client/src/config/tableConfig.js` | Columna correo dueño en tabla restaurantes |
| `client/src/components/Sidebar.jsx` | Nav por rol + cerrar sesión |
| `client/src/components/SuperAdminSidebar.jsx` | Restaurantes, nuevo super admin, logout |
| `client/src/pages/superadmin/RestaurantPage.jsx` | Mensaje con correo tras alta |

---

## localStorage (cliente)

| Clave | Contenido |
|-------|-----------|
| `auth_token` | JWT |
| `auth_user` | JSON con `correo`, `rol`, `restaurantId`, `restaurantNombre`, etc. |

---

## Restaurantes creados antes de este cambio

No tienen fila en `auth` para el dueño. Opciones:

1. Registrar de nuevo el restaurante con correo y contraseña, o  
2. Crear dueño manualmente en BD / futura pantalla “Asignar dueño”.

---

## Orden sugerido para leer el código

1. `client/src/App.jsx`
2. `client/src/context/AuthContext.jsx`
3. `backend/src/auth/controllerAuth.js`
4. `backend/src/services/restaurantService.js`
5. `backend/src/routes/userRutas.js`
6. `backend/src/middlewares/securityActions.js`

---

## Buscar comentarios en el código

En archivos clave hay marcadores `// AUTH:` o `/* AUTH: */` para saltar a las secciones relacionadas con autenticación.

```bash
# En la raíz del proyecto (PowerShell / rg)
rg "AUTH:" backend client
```

---

*Última actualización: conversación de implementación auth + roles + registro super admin y dueño de restaurante.*
