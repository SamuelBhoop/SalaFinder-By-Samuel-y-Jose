import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navLinks = [
  { to: '/spaces', label: 'Espacios' },
  { to: '/calendar', label: 'Calendario' },
  { to: '/my-reservations', label: 'Mis Reservas' },
]

export default function MainLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-lg">SalaFinder</span>
            </div>

            {/* Nav Desktop */}
            <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User + Logout */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-600 max-w-[150px] truncate">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Salir
              </button>
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <nav aria-label="Menú móvil" className="md:hidden py-3 border-t border-gray-100">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-sm font-medium rounded-lg mb-1 transition-colors ${
                      isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
