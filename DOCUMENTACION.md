# SalaFinder — Documentación del Proyecto

**Última actualización:** mayo 2026  
**Repositorios:** Frontend `SalaFinder-By-Samuel-y-Jose` · Backend `SalaFinders` (zhinfenix)

---

## Descripción General

**SalaFinder** es una aplicación web de reserva de espacios (salas, laboratorios, canchas) para entornos universitarios. Los estudiantes buscan y reservan espacios; Admin y Staff aprueban solicitudes, marcan no-shows y gestionan el catálogo; Admin además consulta auditoría.

---

## Arquitectura

```
┌─────────────────┐       HTTPS/JSON        ┌──────────────────────┐        SQL        ┌──────────────┐
│  Frontend       │ ────────────────────────▶│  Backend             │ ────────────────▶ │  SQL Server  │
│  React + Vite   │                          │  ASP.NET Core (.NET) │                   │  Database    │
│  Tailwind CSS   │ ◀────────────────────────│  JWT Auth            │ ◀──────────────── │              │
└─────────────────┘       Respuestas JSON    └──────────────────────┘                   └──────────────┘
```

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend | ASP.NET Core (.NET 10), Entity Framework Core, SQL Server |
| Auth | JWT Bearer (3 h), ASP.NET Identity |
| Dev proxy | Vite redirige `/api` → `http://localhost:5155` |

---

## Roles y permisos

| Rol | Permisos |
|-----|----------|
| **Student** | Registro, login, listar espacios, crear/cancelar sus reservas, calendario y “Mis reservas” |
| **Staff** | Todo lo de Student + aprobar/rechazar pendientes + marcar **no-show** |
| **Admin** | Todo lo de Staff + **CRUD de espacios** + **logs de auditoría** |

### Navegación en el frontend (MainLayout)

| Enlace | Roles |
|--------|-------|
| Espacios, Calendario, Mis Reservas | Todos autenticados |
| Aprobar, No-show | Admin, Staff |
| Espacios (admin), Auditoría | Solo Admin |

---

## Política de no-show y bloqueo

### Backend

| Regla | Valor |
|-------|--------|
| Umbral | 2 no-shows acumulados |
| Bloqueo | 7 días (`BlockedUntil`) |
| Marcar no-show | Solo reservas con estado **Approved** y `IsNoShow = false` |
| Login bloqueado | Si `BlockedUntil > ahora`, no se emite JWT |
| Crear reserva bloqueada | Respuesta 409 con mensaje explicativo |

Al marcar no-show: incrementa `NoShowCount`, setea `IsNoShow = true`, registra auditoría `MarkedNoShow`.

### Frontend

| Comportamiento | Dónde |
|----------------|--------|
| Perfil con `isBlocked`, `noShowCount`, `blockedUntil` | `GET /auth/me` → `normalizeUser()` |
| Refresco de perfil al cargar app y al entrar al layout | `AuthContext.refreshUser()` |
| Banner naranja si está bloqueado | `BlockedNotice` en `MainLayout` |
| Botón “Reservas suspendidas” deshabilitado | `SpaceCard` |
| Formulario de reserva bloqueado | `ReservationFormPage` |
| Mensaje claro en login si cuenta bloqueada | `LoginPage` |

---

## Frontend (React)

### Estructura de carpetas

```
src/
├── api/
│   ├── auth.js           # login, register, getMe
│   ├── reservations.js   # reservas, aprobación, no-show
│   ├── spaces.js         # consulta y CRUD (admin)
│   └── audit.js          # logs (admin)
├── components/
│   ├── common/           # Button, Spinner, ErrorMessage, EmptyState
│   ├── BlockedNotice.jsx # aviso de cuenta bloqueada
│   ├── ProtectedRoute.jsx
│   ├── RoleRoute.jsx
│   ├── SpaceCard.jsx
│   └── ReservationCard.jsx
├── context/
│   └── AuthContext.jsx   # sesión, refreshUser
├── layouts/
│   ├── MainLayout.jsx
│   └── AuthLayout.jsx
├── lib/
│   └── http.js           # fetch + JWT + errores
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── SpacesPage.jsx
│   ├── ReservationFormPage.jsx
│   ├── MyReservationsPage.jsx
│   ├── CalendarPage.jsx
│   ├── AdminReservationsPage.jsx   # aprobar / rechazar
│   ├── AdminNoShowPage.jsx         # marcar no-show
│   ├── AdminSpacesPage.jsx         # CRUD espacios (admin)
│   └── AdminAuditPage.jsx          # auditoría (admin)
├── utils/
│   ├── authUser.js       # normalizeUser, formatBlockedUntil
│   └── spaceImages.js    # iconos por tipo Room/Lab/Court
├── App.jsx
└── main.jsx
```

### Rutas

| Ruta | Página | Acceso |
|------|--------|--------|
| `/login` | LoginPage | Público |
| `/register` | RegisterPage | Público |
| `/spaces` | SpacesPage | Autenticado |
| `/spaces/:id/reserve` | ReservationFormPage | Autenticado (bloqueado si `isBlocked`) |
| `/my-reservations` | MyReservationsPage | Autenticado |
| `/calendar` | CalendarPage | Autenticado |
| `/admin/reservations` | AdminReservationsPage | Admin, Staff |
| `/admin/no-show` | AdminNoShowPage | Admin, Staff |
| `/admin/spaces` | AdminSpacesPage | Solo Admin |
| `/admin/audit` | AdminAuditPage | Solo Admin |

### Páginas — resumen

| Página | Función |
|--------|---------|
| **LoginPage** | Login; mensaje específico si la cuenta está bloqueada por no-show |
| **RegisterPage** | Alta con rol Student y login automático |
| **SpacesPage** | Listado, búsqueda y filtros; tarjetas con icono por tipo |
| **ReservationFormPage** | Crear reserva; bloqueada si el usuario tiene `isBlocked` |
| **MyReservationsPage** | Mis reservas por pestañas; cancelar si pending/approved |
| **CalendarPage** | Vista semanal de reservas propias |
| **AdminReservationsPage** | Cola de pendientes; aprobar o rechazar (motivo opcional) |
| **AdminNoShowPage** | Reservas aprobadas en rango de fechas; botón “No asistió” con confirmación |
| **AdminSpacesPage** | Tabla de espacios; crear, editar, eliminar (solo Admin) |
| **AdminAuditPage** | Tabla de logs con filtros por entidad, ID y límite |

### API del frontend (módulos)

**auth.js:** `login`, `register`, `getMe`  
**reservations.js:** `getMyReservations`, `createReservation`, `cancelReservation`, `getPendingReservations`, `approveReservation`, `rejectReservation`, `getNoShowCandidates`, `markNoShow`, `getReservationById`  
**spaces.js:** `getSpaces`, `getSpaceById`, `getSpacesAvailability`, `createSpace`, `updateSpace`, `deleteSpace`  
**audit.js:** `getAuditLogs({ entityType, entityId, limit })`

### Variables de entorno (frontend)

| Variable | Desarrollo | Producción |
|----------|------------|------------|
| `VITE_API_URL` | `/api` (proxy Vite) | `https://TU-API.azurewebsites.net/api` |
| `VITE_BACKEND_URL` | `http://localhost:5155` | (solo dev, proxy) |

### Cliente HTTP (`http.js`)

- Base URL desde `VITE_API_URL`
- Header `Authorization: Bearer <token>`
- 401 → limpia sesión y redirige a `/login`
- Errores: lee `message` o `Message` del JSON
- Métodos: `get`, `post`, `put`, `patch`, `delete`

---

## Backend (ASP.NET Core)

### Endpoints de la API

#### Autenticación — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | No | Registrar usuario |
| POST | `/login` | No | JWT (falla si usuario bloqueado) |
| GET | `/me` | Sí | Perfil: `fullName`, `roles`, `noShowCount`, `blockedUntil`, `isBlocked` |

#### Espacios — `/api/spaces`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | No | Listar (filtros opcionales) |
| GET | `/{id}` | No | Detalle |
| GET | `/availability` | No | Slots semanales 30 min (08:00–20:00) |
| POST | `/` | Admin | Crear |
| PUT | `/{id}` | Admin | Actualizar |
| DELETE | `/{id}` | Admin | Eliminar |

#### Reservas — `/api/reservations`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/` | Autenticado | Crear (rechaza si bloqueado o conflicto) |
| GET | `/{id}` | Autenticado | Detalle |
| GET | `/my` | Autenticado | Mis reservas |
| GET | `/pending` | Admin, Staff | Pendientes de aprobación |
| GET | `/no-show-candidates` | Admin, Staff | Aprobadas sin no-show en rango de fechas |
| POST | `/{id}/approve` | Admin, Staff | Aprobar |
| POST | `/{id}/reject` | Admin, Staff | Rechazar (`reason` opcional) |
| POST | `/{id}/cancel` | Autenticado | Cancelar (propietario) |
| POST | `/{id}/no-show` | Admin, Staff | Marcar no-show |

#### Auditoría — `/api/audit`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Admin | Logs (`entityType`, `entityId`, `limit`) |

### Modelo de datos (resumen)

- **ApplicationUser:** `FullName`, `NoShowCount`, `BlockedUntil` + campos Identity  
- **Space:** `Name`, `Type` (Room/Lab/Court), `Capacity`, `Building`, `Resources`, `AllowedPrograms`, `RequiresApproval`  
- **Reservation:** fechas/horas, `Status` (Pending/Approved/Rejected/Cancelled), `IsNoShow`, `RejectedReason`  
- **AuditLog:** `EntityType`, `EntityId`, `Action`, `UserId`, `OldValues`, `NewValues`, `Timestamp`

### CORS

Orígenes configurables en `appsettings.json` → sección `Cors:Origins`. En producción incluir la URL de Vercel.

### Datos demo (seed)

| Usuario | Rol | Contraseña |
|---------|-----|------------|
| admin@salafinders.com | Admin | Admin123! |
| staff@salafinders.com | Staff | Staff123! |
| student1@salafinders.com … student13 | Student | Student123! |

6 espacios precargados (salas, laboratorios, cancha).

---

## Despliegue (planificado)

| Componente | Plataforma |
|------------|------------|
| Frontend | Vercel |
| Backend | Azure App Service (.NET 8/10) |
| Base de datos | Azure SQL Database |

**Vercel:** `VITE_API_URL=https://TU-API.azurewebsites.net/api`  
**Azure:** `ConnectionStrings__DefaultConnection`, `Jwt__*`, `Cors__Origins__0`

---

## Cómo ejecutar en desarrollo

### 1. Backend

```bash
cd C:\Users\User\.vscode\SalaFinders\SalaFinders
dotnet run
```

URL típica: `http://localhost:5155`

### 2. Frontend

```bash
cd mi-proyecto
npm install
npm run dev
```

URL: `http://localhost:5173` (o 5174 si 5173 está ocupado)

### 3. Archivo `.env` (frontend)

```
VITE_API_URL=/api
VITE_BACKEND_URL=http://localhost:5155
```

### Requisitos

- Node.js 18+
- .NET SDK 10
- SQL Server local (o la connection string configurada en el backend)
- Migraciones y seed al arrancar el backend

---

## Flujos de prueba rápidos

1. **Estudiante:** login → Espacios → Reservar → Mis reservas / Calendario  
2. **Staff:** Aprobar reservas pendientes → No-show en reservas aprobadas pasadas  
3. **Admin:** Gestionar espacios (crear/editar/borrar) → Auditoría  
4. **Bloqueo:** marcar 2 no-shows a un estudiante → recargar su sesión → banner + sin reservas; login bloqueado hasta `BlockedUntil`

---

## Historial de cambios recientes (frontend + API)

- Registro de usuarios (`/register`) y capa API unificada (`http.js`, `AuthContext`)
- Aprobación/rechazo de reservas (Admin/Staff)
- No-show: listado de candidatos + marcado + bloqueo 7 días en UI
- CRUD de espacios y vista de auditoría (solo Admin)
- Iconos por tipo de espacio (`spaceImages.js`) sin dependencia de URLs externas
- CORS configurable en backend para despliegue
- Documentación ampliada (este archivo)

---

*Documento generado para el proyecto SalaFinder. Para copia local: `DOCUMENTACION.md` en la raíz del repositorio frontend.*
