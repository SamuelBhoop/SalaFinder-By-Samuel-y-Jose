# SalaFinder — Documentación del Proyecto

## Descripción General

**SalaFinder** es una aplicación web de reserva de espacios (salas, laboratorios, canchas) para entornos universitarios. Permite a los estudiantes buscar y reservar espacios disponibles, y al personal administrativo aprobar o rechazar las solicitudes.

---

## Arquitectura

```
┌─────────────────┐       HTTPS/JSON        ┌──────────────────────┐        SQL        ┌──────────────┐
│  Frontend       │ ────────────────────────▶│  Backend             │ ────────────────▶ │  SQL Server  │
│  React + Vite   │                          │  ASP.NET Core (.NET) │                   │  Database    │
│  Tailwind CSS   │ ◀────────────────────────│  JWT Auth            │ ◀──────────────── │              │
└─────────────────┘       Respuestas JSON    └──────────────────────┘                   └──────────────┘
```

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, React Router 7
- **Backend**: ASP.NET Core (.NET 10), Entity Framework Core, SQL Server
- **Autenticación**: JWT Bearer tokens (3 horas de duración)

---

## Roles del Sistema

| Rol       | Permisos |
|-----------|----------|
| Student   | Registrarse, buscar espacios, crear reservas, ver/cancelar sus propias reservas, ver calendario semanal |
| Staff     | Todo lo de Student + aprobar/rechazar reservas pendientes, marcar no-show |
| Admin     | Todo lo de Staff + crear/editar/eliminar espacios, ver logs de auditoría |

---

## Frontend (React)

### Stack tecnológico

| Tecnología       | Versión | Uso |
|------------------|---------|-----|
| React            | 19.2    | UI reactiva con componentes funcionales y hooks |
| Vite             | 8.0     | Bundler y servidor de desarrollo |
| React Router DOM | 7.14    | Navegación SPA con rutas protegidas |
| Tailwind CSS     | 4.2     | Estilos utilitarios |
| prop-types       | 15.8    | Validación de props en desarrollo |

### Estructura de carpetas

```
src/
├── api/                  # Funciones de llamada al backend
│   ├── auth.js           # Login y registro
│   ├── reservations.js   # CRUD de reservas + aprobación
│   └── spaces.js         # Consulta de espacios y disponibilidad
├── components/           # Componentes reutilizables
│   ├── common/           # Button, Spinner, ErrorMessage, EmptyState
│   ├── ProtectedRoute.jsx    # Protege rutas para usuarios autenticados
│   ├── RoleRoute.jsx         # Protege rutas por rol (Admin/Staff)
│   ├── SpaceCard.jsx         # Tarjeta visual de un espacio
│   └── ReservationCard.jsx   # Tarjeta visual de una reserva
├── context/
│   └── AuthContext.jsx   # Estado global de autenticación
├── layouts/
│   ├── MainLayout.jsx    # Barra de navegación + contenido (usuarios autenticados)
│   └── AuthLayout.jsx    # Layout minimalista para login/registro
├── lib/
│   └── http.js           # Cliente HTTP centralizado (fetch + JWT)
├── pages/                # Páginas completas
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── SpacesPage.jsx
│   ├── ReservationFormPage.jsx
│   ├── MyReservationsPage.jsx
│   ├── CalendarPage.jsx
│   └── AdminReservationsPage.jsx
├── utils/
│   └── spaceImages.js    # Iconos SVG y colores por tipo de espacio
├── App.jsx               # Definición de rutas
└── main.jsx              # Punto de entrada
```

### Rutas

| Ruta                   | Página                   | Acceso            |
|------------------------|--------------------------|--------------------|
| `/login`               | LoginPage                | Público             |
| `/register`            | RegisterPage             | Público             |
| `/spaces`              | SpacesPage               | Autenticado         |
| `/spaces/:id/reserve`  | ReservationFormPage      | Autenticado         |
| `/my-reservations`     | MyReservationsPage       | Autenticado         |
| `/calendar`            | CalendarPage             | Autenticado         |
| `/admin/reservations`  | AdminReservationsPage    | Admin o Staff       |

### Páginas — Qué hace cada una

- **LoginPage**: formulario de email y contraseña. Llama a la API de login, guarda el token JWT en localStorage y redirige a `/spaces`.
- **RegisterPage**: formulario de registro (nombre, email, contraseña, confirmar contraseña). Crea una cuenta con rol Student, hace login automático y redirige a `/spaces`.
- **SpacesPage**: lista los espacios disponibles con búsqueda por nombre y filtro por tipo (Sala, Laboratorio, Cancha). Cada espacio se muestra como una tarjeta con botón para reservar.
- **ReservationFormPage**: formulario para reservar un espacio específico. Incluye fecha, hora inicio/fin, propósito y cantidad de asistentes. Valida que la hora de fin sea posterior al inicio.
- **MyReservationsPage**: muestra las reservas del usuario con pestañas de estado (Todas, Pendientes, Aprobadas, Rechazadas, Canceladas). Permite cancelar reservas pendientes o aprobadas.
- **CalendarPage**: calendario semanal que muestra las reservas del usuario en formato de grilla por día.
- **AdminReservationsPage**: solo para Admin/Staff. Lista las reservas pendientes de aprobación con botones para aprobar o rechazar (con opción de escribir razón de rechazo).

### Flujo de autenticación

1. El usuario entra a `/login` o `/register`
2. Se envía la solicitud al backend (`POST /api/auth/login` o `POST /api/auth/register`)
3. El backend devuelve un JWT
4. El frontend guarda el token en `localStorage` y obtiene el perfil del usuario (`GET /api/auth/me`)
5. `AuthContext` provee el usuario a toda la app
6. Todas las llamadas API incluyen el header `Authorization: Bearer <token>`
7. Si el backend responde con 401, el frontend limpia la sesión y redirige a `/login`

### Cliente HTTP (`http.js`)

Módulo centralizado que envuelve `fetch()` y agrega:
- Header `Authorization` automático si hay token
- Manejo de errores (401 → cierre de sesión, otros → extrae mensaje del body JSON)
- Métodos: `http.get()`, `http.post()`, `http.patch()`, `http.delete()`

---

## Backend (ASP.NET Core)

### Stack tecnológico

| Tecnología                   | Versión | Uso |
|------------------------------|---------|-----|
| ASP.NET Core                 | .NET 10 | Framework web |
| Entity Framework Core        | 10.0    | ORM para SQL Server |
| ASP.NET Identity             | 10.0    | Gestión de usuarios y roles |
| JWT Bearer Authentication    | 10.0    | Autenticación por tokens |
| Scalar                       | 2.0     | Documentación interactiva de API (solo dev) |

### Estructura de carpetas

```
SalaFinders/
├── Controllers/
│   ├── AuthController.cs         # Registro, login, perfil
│   ├── SpacesController.cs       # CRUD de espacios + disponibilidad
│   ├── ReservationsController.cs # Crear, cancelar, aprobar, rechazar reservas
│   └── AuditController.cs       # Consulta de logs de auditoría
├── Data/
│   ├── ApplicationDbContext.cs   # Configuración de EF Core + relaciones
│   └── DbSeeder.cs              # Datos iniciales (usuarios demo, reservas)
├── Interfaces/                   # Contratos de servicios
├── Models/
│   ├── ApplicationUser.cs        # Usuario (extiende IdentityUser)
│   ├── Space.cs                  # Espacio reservable
│   ├── Reservation.cs            # Reserva con estado
│   ├── AuditLog.cs               # Registro de auditoría
│   └── DTOs/                     # Objetos de transferencia
├── Services/                     # Implementación de lógica de negocio
├── Migrations/                   # Migraciones de EF Core
└── Program.cs                    # Configuración y pipeline
```

### Endpoints de la API

#### Autenticación (`/api/auth`)

| Método | Ruta              | Auth | Descripción |
|--------|--------------------|------|-------------|
| POST   | `/api/auth/register` | No   | Registrar nuevo usuario |
| POST   | `/api/auth/login`    | No   | Iniciar sesión, devuelve JWT |
| GET    | `/api/auth/me`       | Sí   | Obtener perfil y roles del usuario actual |

#### Espacios (`/api/spaces`)

| Método | Ruta                      | Auth     | Descripción |
|--------|----------------------------|----------|-------------|
| GET    | `/api/spaces`              | No       | Listar espacios (con filtros opcionales) |
| GET    | `/api/spaces/{id}`         | No       | Detalle de un espacio |
| GET    | `/api/spaces/availability` | No       | Disponibilidad semanal (slots de 30 min) |
| POST   | `/api/spaces`              | Admin    | Crear espacio |
| PUT    | `/api/spaces/{id}`         | Admin    | Actualizar espacio |
| DELETE | `/api/spaces/{id}`         | Admin    | Eliminar espacio |

#### Reservas (`/api/reservations`)

| Método | Ruta                              | Auth        | Descripción |
|--------|-------------------------------------|-------------|-------------|
| POST   | `/api/reservations`                | Autenticado | Crear reserva |
| GET    | `/api/reservations/{id}`           | Autenticado | Ver detalle de una reserva |
| GET    | `/api/reservations/my`             | Autenticado | Mis reservas |
| GET    | `/api/reservations/pending`        | Admin/Staff | Reservas pendientes de aprobación |
| POST   | `/api/reservations/{id}/approve`   | Admin/Staff | Aprobar reserva |
| POST   | `/api/reservations/{id}/reject`    | Admin/Staff | Rechazar reserva (con razón opcional) |
| POST   | `/api/reservations/{id}/cancel`    | Autenticado | Cancelar mi reserva |
| POST   | `/api/reservations/{id}/no-show`   | Admin/Staff | Marcar como no-show |

#### Auditoría (`/api/audit`)

| Método | Ruta         | Auth  | Descripción |
|--------|--------------|-------|-------------|
| GET    | `/api/audit` | Admin | Consultar logs de auditoría |

### Modelo de datos

```
┌─────────────────┐     1:N     ┌──────────────────┐     N:1     ┌─────────────────┐
│  ApplicationUser │────────────│    Reservation     │────────────│      Space       │
│                 │             │                    │             │                 │
│  Id (string)    │             │  Id (int)          │             │  Id (int)       │
│  FullName       │             │  SpaceId           │             │  Name           │
│  Email          │             │  UserId            │             │  Type           │
│  NoShowCount    │             │  Date              │             │  Capacity       │
│  BlockedUntil   │             │  StartTime         │             │  Building       │
│  (+ Identity)   │             │  EndTime           │             │  Resources      │
└─────────────────┘             │  Purpose           │             │  AllowedPrograms│
                                │  AttendeeCount     │             │  RequiresApproval│
                                │  Status (enum)     │             └─────────────────┘
                                │  CreatedAt         │
                                │  RejectedReason    │
                                │  IsNoShow          │
                                └──────────────────┘

┌─────────────────┐
│    AuditLog      │
│  Id             │
│  EntityType     │
│  EntityId       │
│  Action         │
│  UserId         │
│  OldValues      │
│  NewValues      │
│  Timestamp      │
└─────────────────┘
```

#### Estados de una reserva (`ReservationStatus`)

| Estado    | Descripción |
|-----------|-------------|
| Pending   | Esperando aprobación de Admin/Staff |
| Approved  | Aprobada y confirmada |
| Rejected  | Rechazada por Admin/Staff |
| Cancelled | Cancelada por el usuario |

### Lógica de negocio destacada

- **Creación de reserva**: si el espacio tiene `RequiresApproval = true`, la reserva se crea como `Pending`. Si no, se aprueba automáticamente.
- **Validación de conflictos**: al crear o aprobar una reserva, se verifica que no haya solapamiento con otras reservas aprobadas del mismo espacio.
- **Política de no-show**: si un usuario acumula 2+ no-shows, queda bloqueado por 7 días y no puede hacer nuevas reservas.
- **Auditoría**: todas las operaciones sobre reservas (crear, aprobar, rechazar, cancelar, no-show) generan un registro en `AuditLog`.

### Datos iniciales (Seed)

El sistema viene pre-configurado con:

| Tipo | Datos |
|------|-------|
| Roles | Admin, Staff, Student |
| Espacios | 6 espacios (2 salas, 2 laboratorios, 1 cancha, 1 sala adicional) |
| Usuarios demo | admin@salafinders.com (Admin), staff@salafinders.com (Staff), student1–13@salafinders.com (Student) |
| Contraseñas demo | Admin123!, Staff123!, Student123! |

### Configuración (`appsettings.json`)

```json
{
  "Jwt": {
    "Key": "<clave secreta>",
    "Issuer": "SalaFinders",
    "Audience": "UsuariosSalaFinders"
  },
  "ConnectionStrings": {
    "DefaultConnection": "<connection string de SQL Server>"
  },
  "Cors": {
    "Origins": ["http://localhost:5173"]
  }
}
```

En producción, las variables sensibles se configuran como Application Settings en Azure App Service.

---

## Despliegue

| Componente | Plataforma | URL |
|------------|------------|-----|
| Frontend   | Vercel     | https://TU-PROYECTO.vercel.app |
| Backend    | Azure App Service (.NET 10) | https://TU-API.azurewebsites.net |
| Base de datos | Azure SQL Database | Accesible solo desde App Service |

### Variables de entorno en producción

**Vercel (Frontend):**
- `VITE_API_URL` = `https://TU-API.azurewebsites.net/api`

**Azure App Service (Backend):**
- `ConnectionStrings__DefaultConnection` = connection string de Azure SQL
- `Jwt__Key` = clave secreta de producción
- `Jwt__Issuer` = SalaFinders
- `Jwt__Audience` = UsuariosSalaFinders
- `Cors__Origins__0` = https://TU-PROYECTO.vercel.app

---

## Cómo ejecutar en desarrollo

### Frontend

```bash
cd mi-proyecto
npm install
npm run dev
```

Acceder a `http://localhost:5173`

### Backend

```bash
cd SalaFinders/SalaFinders
dotnet run
```

El backend corre en `http://localhost:5155` (o el puerto que indique la consola).

### Requisitos previos

- Node.js 18+
- .NET SDK 10
- SQL Server (local o Express)
- La base de datos se crea automáticamente al iniciar el backend (migrations + seed)
