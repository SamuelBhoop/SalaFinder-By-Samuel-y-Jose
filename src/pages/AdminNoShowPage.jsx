import { useState, useEffect, useCallback } from 'react'
import { getNoShowCandidates, markNoShow } from '../api/reservations'
import { getSpaceConfig } from '../utils/spaceImages'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

function formatDateInput(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function defaultRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 14)
  return { from: formatDateInput(from), to: formatDateInput(to) }
}

export default function AdminNoShowPage() {
  const initialRange = defaultRange()
  const [fromDate, setFromDate] = useState(initialRange.from)
  const [toDate, setToDate] = useState(initialRange.to)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchCandidates = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await getNoShowCandidates(fromDate, toDate)
      setReservations(data)
    } catch {
      setError('No se pudieron cargar las reservas aprobadas.')
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const handleMarkNoShow = async (id) => {
    setActionLoading(id)
    try {
      await markNoShow(id)
      setReservations((prev) => prev.filter((r) => r.id !== id))
      setConfirmId(null)
    } catch (err) {
      setError(err.message || 'No se pudo marcar como no-show.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">No-show</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Marca cuando el usuario no asistió a una reserva aprobada. Tras 2 no-shows el usuario queda bloqueado 7 días.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex-1">
          <label htmlFor="fromDate" className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
          <input
            id="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="toDate" className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
          <input
            id="toDate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-end">
          <Button variant="secondary" onClick={fetchCandidates} disabled={loading}>
            Actualizar
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchCandidates} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center py-20" role="status">
          <Spinner size="lg" />
        </div>
      ) : reservations.length === 0 && !error ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No hay reservas aprobadas pendientes de marcar en este rango de fechas.
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const spaceConfig = getSpaceConfig(r.space?.type)
            const isProcessing = actionLoading === r.id

            return (
              <article
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${spaceConfig.gradient}`}>
                  <svg className="w-6 h-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={spaceConfig.icon} />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{r.spaceName}</h3>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium flex-shrink-0">
                      Aprobada
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>
                      <span className="font-medium text-gray-700">Usuario:</span>{' '}
                      {r.userDisplayName}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Fecha:</span> {r.date} · {r.startTime} – {r.endTime}
                    </p>
                    {r.purpose && (
                      <p>
                        <span className="font-medium text-gray-700">Motivo:</span> {r.purpose}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 sm:justify-center flex-shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => setConfirmId(r.id)}
                  >
                    No asistió
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {confirmId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" role="dialog" aria-modal="true" aria-label="Confirmar no-show">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar no-show</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Confirmas que el usuario no asistió a esta reserva? Se incrementará su contador de no-shows y podría quedar bloqueado temporalmente.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={actionLoading === confirmId}
                onClick={() => handleMarkNoShow(confirmId)}
              >
                {actionLoading === confirmId ? <Spinner size="sm" /> : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
