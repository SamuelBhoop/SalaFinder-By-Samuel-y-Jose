import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSpaceById } from '../api/spaces'
import { createReservation } from '../api/reservations'
import { getSpaceConfig } from '../utils/spaceImages'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import BlockedNotice from '../components/BlockedNotice'

export default function ReservationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [space, setSpace] = useState(null)
  const [spaceLoading, setSpaceLoading] = useState(true)
  const [spaceError, setSpaceError] = useState('')

  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', purpose: '', attendeeCount: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const data = await getSpaceById(id)
        setSpace(data)
      } catch {
        setSpaceError('No se encontró el espacio solicitado.')
      } finally {
        setSpaceLoading(false)
      }
    }
    fetchSpace()
  }, [id])

  const validate = () => {
    const errs = {}
    const today = new Date().toISOString().split('T')[0]
    if (!form.date) errs.date = 'La fecha es requerida'
    else if (form.date < today) errs.date = 'La fecha debe ser hoy o futura'
    if (!form.startTime) errs.startTime = 'La hora de inicio es requerida'
    if (!form.endTime) errs.endTime = 'La hora de fin es requerida'
    else if (form.endTime <= form.startTime) errs.endTime = 'La hora de fin debe ser mayor a la de inicio'
    if (!form.purpose.trim()) errs.purpose = 'El motivo es requerido'
    if (!form.attendeeCount || parseInt(form.attendeeCount) < 1) errs.attendeeCount = 'Indica al menos 1 asistente'
    else if (space && parseInt(form.attendeeCount) > space.capacity)
      errs.attendeeCount = `Máximo ${space.capacity} personas para este espacio`
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
    setSubmitting(true)
    setSubmitError('')
    try {
      // userId is derived from JWT on server side — only send the space + time data
      await createReservation({
        spaceId: parseInt(id),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        attendeeCount: parseInt(form.attendeeCount),
      })
      setSuccess(true)
      setTimeout(() => navigate('/my-reservations'), 2500)
    } catch (err) {
      setSubmitError(err.message || 'No se pudo crear la reserva. Inténtalo nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = form.date && form.startTime && form.endTime && form.purpose.trim() && form.attendeeCount

  if (user?.isBlocked) {
    return (
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <BlockedNotice user={user} variant="full" />
        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate('/spaces')}>
            Volver a espacios
          </Button>
        </div>
      </section>
    )
  }

  if (spaceLoading) {
    return (
      <div className="flex items-center justify-center py-20" role="status">
        <Spinner size="lg" />
      </div>
    )
  }

  if (spaceError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ErrorMessage message={spaceError} />
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/spaces')}>
          Volver a espacios
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center" role="status">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva enviada!</h2>
        <p className="text-gray-500 text-sm">Tu solicitud está pendiente de aprobación por un administrador.</p>
        <p className="text-gray-400 text-xs mt-1">Redirigiendo a tus reservas en unos segundos...</p>
      </div>
    )
  }

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li>
            <button onClick={() => navigate('/spaces')} className="hover:text-teal-600 transition-colors">
              Espacios
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-700 font-medium truncate">{space?.name}</li>
        </ol>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservar espacio</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Completa los datos para reservar <strong>{space?.name}</strong>
        </p>
      </header>

      {/* Space summary */}
      <div className="bg-teal-50 rounded-xl p-4 mb-6 flex items-center gap-4 border border-teal-100">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getSpaceConfig(space?.type).gradient}`}>
          <svg className="w-6 h-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={getSpaceConfig(space?.type).icon} />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{space?.name}</p>
          <p className="text-sm text-gray-500">
            {space?.building} · {space?.capacity} personas
          </p>
        </div>
      </div>

      {/* Approval notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-800">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
        Las reservas quedan <strong className="mx-1">pendientes de aprobación</strong> por un administrador o staff.
      </div>

      {submitError && <ErrorMessage message={submitError} className="mb-4" />}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.date ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p id="date-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.date}
            </p>
          )}
        </div>

        {/* Time range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
              Hora inicio <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="startTime"
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              aria-invalid={!!errors.startTime}
              aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.startTime ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.startTime && (
              <p id="startTime-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.startTime}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
              Hora fin <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="endTime"
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              aria-invalid={!!errors.endTime}
              aria-describedby={errors.endTime ? 'endTime-error' : undefined}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.endTime ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.endTime && (
              <p id="endTime-error" className="mt-1 text-xs text-red-600" role="alert">
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        {/* Attendee count */}
        <div>
          <label htmlFor="attendeeCount" className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de asistentes <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="attendeeCount"
            type="number"
            name="attendeeCount"
            value={form.attendeeCount}
            onChange={handleChange}
            min={1}
            max={space?.capacity ?? 999}
            placeholder={space ? `Máximo ${space.capacity}` : ''}
            aria-invalid={!!errors.attendeeCount}
            aria-describedby={errors.attendeeCount ? 'attendeeCount-error' : undefined}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.attendeeCount ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.attendeeCount && (
            <p id="attendeeCount-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.attendeeCount}
            </p>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
            Motivo de la reserva <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <textarea
            id="purpose"
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            rows={3}
            placeholder="Ej: Reunión de equipo, Presentación de proyecto..."
            aria-invalid={!!errors.purpose}
            aria-describedby={errors.purpose ? 'purpose-error' : undefined}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
              errors.purpose ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.purpose && (
            <p id="purpose-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.purpose}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate('/spaces')} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={!isFormValid || submitting} className="flex-1">
            {submitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Enviando...
              </>
            ) : (
              'Enviar solicitud'
            )}
          </Button>
        </div>
      </form>
    </section>
  )
}
