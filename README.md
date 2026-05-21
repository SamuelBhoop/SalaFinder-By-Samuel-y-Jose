# SalaFinder — Frontend

Cliente web (SPA) para **reserva de salas, laboratorios y canchas** en entornos universitarios. Consume la API REST del backend [SalaFinders](https://github.com/zhinfenix/SalaFinders).

**Repositorio backend:** [zhinfenix/SalaFinders](https://github.com/zhinfenix/SalaFinders)  
**Documentación completa:** [`DOCUMENTACION.md`](./DOCUMENTACION.md)

---

## Stack

| Tecnología | Uso |
|------------|-----|
| React 19 | UI y componentes |
| Vite 8 | Dev server y build |
| Tailwind CSS 4 | Estilos responsivos |
| React Router 7 | Rutas y navegación SPA |

---

## Requisitos

- Node.js 18+
- API **SalaFinders** en ejecución (por defecto `http://localhost:5155`)

---

## Instalación y desarrollo

```bash
npm install
cp .env.example .env   # o crea .env manualmente
npm run dev
```

Abre **http://localhost:5173** (o el puerto que indique Vite).

### Variables de entorno

| Variable | Valor en desarrollo |
|----------|---------------------|
| `VITE_API_URL` | `/api` (proxy Vite) |
| `VITE_BACKEND_URL` | `http://localhost:5155` |

El proxy en `vite.config.js` reenvía `/api` → `VITE_BACKEND_URL`.

### Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |

---

## Usuarios de prueba

Requieren el backend con seed aplicado:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@salafinders.com | Admin123! | Admin |
| staff@salafinders.com | Staff123! | Staff |
| student1@salafinders.com | Student123! | Student |

---

## Funcionalidades

- **Estudiante:** registro, login, catálogo de espacios, reservas, calendario, cancelación, carrera académica (`/profile/program`)
- **Staff / Admin:** aprobar y rechazar reservas pendientes, marcar **no-show**
- **Admin:** CRUD de espacios, consulta de **auditoría**
- **Bloqueo por no-show:** banner, botones deshabilitados y mensajes si el usuario está bloqueado (2 no-shows → 7 días; lo aplica el backend)

---

## Rutas

| Ruta | Acceso |
|------|--------|
| `/login`, `/register` | Público |
| `/spaces`, `/spaces/:id/reserve`, `/my-reservations`, `/calendar`, `/profile/program` | Autenticado |
| `/admin/reservations`, `/admin/no-show` | Admin, Staff |
| `/admin/spaces`, `/admin/audit` | Solo Admin |

---

## Estructura del proyecto

```
src/
├── api/                    # Cliente HTTP hacia el backend
│   ├── auth.js
│   ├── reservations.js
│   ├── spaces.js
│   └── audit.js
├── components/
│   ├── common/             # Button, Spinner, EmptyState, ErrorMessage
│   ├── BlockedNotice.jsx
│   ├── ProtectedRoute.jsx
│   ├── RoleRoute.jsx
│   ├── SpaceCard.jsx
│   └── ReservationCard.jsx
├── context/
│   └── AuthContext.jsx     # JWT, refreshUser, bloqueo
├── layouts/
│   ├── AuthLayout.jsx
│   └── MainLayout.jsx
├── lib/
│   └── http.js             # fetch + Bearer + errores API
├── pages/                  # Login, Register, Spaces, Admin*, etc.
├── utils/
│   ├── authUser.js
│   └── spaceImages.js      # Iconos por tipo Room/Lab/Court
├── App.jsx
└── main.jsx
```

La carpeta `src/data/` contiene JSON de referencia; **la app en runtime usa la API**, no mocks.

---

## Autores

Samuel Bhoop y José — proyecto académico SalaFinder.
