import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function LoginPage() {
  const navigate = useNavigate()
  const { saveSession } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'El correo es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Ingresa un correo válido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    setApiError('')
    try {
      const { token, user } = await login(form.email, form.password)
      saveSession(user, token)
      navigate('/spaces')
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('bloqueado')) {
        setApiError(
          'Tu cuenta está bloqueada por acumular no-shows. No puedes iniciar sesión hasta que termine el período de suspensión.'
        )
      } else {
        setApiError(msg || 'Credenciales incorrectas. Verifica tu correo y contraseña.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = form.email && form.password

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SalaFinder</h1>
          <p className="text-gray-500 mt-1 text-sm">Inicia sesión para continuar</p>
        </div>

        {apiError && <ErrorMessage message={apiError} className="mb-4" />}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-teal-500'
              }`}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-teal-500'
              }`}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" disabled={!isFormValid || loading} className="w-full">
            {loading && <Spinner size="sm" className="mr-2" />}
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
            Crea una aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
