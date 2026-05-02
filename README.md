# SalaFinder

Aplicación web SPA para la **reserva de salas y espacios de trabajo**, desarrollada con React 19, Vite y Tailwind CSS v4.

---

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI y componentes |
| Vite | 8 | Bundler y servidor de desarrollo |
| Tailwind CSS | v4 | Estilos responsivos |
| React Router | v7 | Navegación SPA |
| PropTypes | 15 | Tipado de props |

---

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## Credenciales de prueba

| Usuario | Email | Contraseña |
|---|---|---|
| Carlos Mendoza | admin@salafinder.com | 123456 |
| María López | maria@salafinder.com | 123456 |

---

## Estructura del proyecto

```
src/
├── api/                  # Servicios simulados (mock de fetch)
│   ├── auth.js           # login / logout
│   ├── spaces.js         # getSpaces / getSpaceById
│   └── reservations.js   # getReservationsByUser / createReservation / cancelReservation
├── components/
│   ├── common/           # Button, Spinner, EmptyState, ErrorMessage (con PropTypes)
│   ├── SpaceCard.jsx     # Tarjeta de espacio (con PropTypes)
│   └── ReservationCard.jsx # Tarjeta de reserva (con PropTypes)
├── data/                 # JSONs locales (users, spaces, reservations)
├── layouts/              # AuthLayout, MainLayout (nav + logout)
├── pages/                # LoginPage, SpacesPage, ReservationFormPage,
│                         # MyReservationsPage, CalendarPage
└── App.jsx               # Rutas con React Router
```

---

## Criterios de evaluación cubiertos

### ✅ HTML semántico
Uso de `<section>`, `<header>`, `<article>`, `<nav>`, `<main>`, `<form>`, `<table>` con atributos ARIA (`aria-label`, `aria-invalid`, `aria-describedby`, `role="alert"`, `role="tab"`, `role="grid"`, etc.) y `<label htmlFor>` en todos los inputs.

### ✅ Tailwind CSS — diseño responsive
Clases responsivas (`sm:`, `md:`, `lg:`) en todas las páginas. Grid de 1/2/3 columnas según breakpoint. Menú hamburguesa en móvil.

### ✅ Componentización React con PropTypes
Componentes reutilizables con props definidas mediante `PropTypes`: `Button` (4 variantes, 3 tamaños), `SpaceCard`, `ReservationCard`, `Spinner`, `EmptyState`, `ErrorMessage`.

### ✅ Manejo de estado con useState
Cada página gestiona múltiples estados: datos, loading, error, formularios, filtros, tabs y confirmación de éxito.

### ✅ React Router y navegación SPA
`BrowserRouter` con `Routes` anidadas, `NavLink` con estado activo, `useParams` para rutas dinámicas (`/spaces/:id/reserve`), `useNavigate` para redirecciones y `ProtectedRoute` para rutas privadas.

### ✅ Renderizado dinámico de listas
`.map()` con `key` único en: tarjetas de espacios, tarjetas de reservas, amenidades, tabs, semana del calendario. Filtrado reactivo con `.filter()` por búsqueda, capacidad y disponibilidad.

### ✅ Estructura de servicios API
Carpeta `/api` con funciones `async` que simulan llamadas a backend con `delay()`. Retornan DTOs estructurados consumidos desde el JSON local.

---

## Páginas

| Ruta | Descripción | Protegida |
|---|---|---|
| `/login` | Formulario de autenticación con validación | No |
| `/spaces` | Catálogo con búsqueda y filtros | Sí |
| `/spaces/:id/reserve` | Formulario de reserva con validación | Sí |
| `/my-reservations` | Lista de reservas con tabs y cancelación | Sí |
| `/calendar` | Vista semanal tipo agenda | Sí |
