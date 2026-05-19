import { useState, useEffect, useCallback } from 'react'
import { getPendingReservations, approveReservation, rejectReservation } from '../api/reservations'
import { getSpaceConfig } from '../utils/spaceImages'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const fetchPending = useCallback(async () => {
    setError('')
    try {
      const data = await getPendingReservations()
      setReservations(data)
    } catch {
      setError('No se pudieron cargar las reservas pendientes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPending() }, [fetchPending])

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await approveReservation(id)
      setReservations((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message || 'No se pudo aprobar la reserva.')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (reservation) => {
    setRejectModal(reservation)
    setRejectReason('')
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setActionLoading(rejectModal.id)
    try {
      await rejectReservation(rejectModal.id, rejectReason)
      setReservations((prev) => prev.filter((r) => r.id !== rejectModal.id))
      setRejectModal(null)
    } catch (err) {
      setError(err.message || 'No se pudo rechazar la reserva.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" role="status">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservas pendientes</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Aprueba o rechaza las solicitudes de reserva de los usuarios.
        </p>
      </header>

      {error && <ErrorMessage message={error} onRetry={fetchPending} className="mb-4" />}

      {reservations.length === 0 && !error ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Todo al día</h2>
          <p className="text-gray-500 text-sm">No hay reservas pendientes de aprobación.</p>
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
                {/* Space icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${spaceConfig.gradient}`}>
                  <svg className="w-6 h-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={spaceConfig.icon} />
                  </svg>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{r.spaceName}</h3>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-xs font-medium flex-shrink-0">
                      Pendiente
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 space-y-0.5">
                    <p>
                      <span className="font-medium text-gray-700">Solicitante:</span>{' '}
                      {r.user?.fullName ?? r.user?.email ?? r.userId}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Fecha:</span> {r.date}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Horario:</span> {r.startTime} – {r.endTime}
                    </p>
                    {r.purpose && (
                      <p>
                        <span className="font-medium text-gray-700">Motivo:</span> {r.purpose}
                      </p>
                    )}
                    {r.attendeeCount > 0 && (
                      <p>
                        <span className="font-medium text-gray-700">Asistentes:</span> {r.attendeeCount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 sm:justify-center flex-shrink-0">
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleApprove(r.id)}
                  >
                    {isProcessing ? <Spinner size="sm" /> : 'Aprobar'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => openRejectModal(r)}
                  >
                    Rechazar
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" role="dialog" aria-modal="true" aria-label="Rechazar reserva">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Rechazar reserva</h3>
            <p className="text-sm text-gray-500 mb-4">
              {rejectModal.spaceName} — {rejectModal.date}, {rejectModal.startTime} – {rejectModal.endTime}
            </p>

            <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del rechazo <span className="text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Ej: Espacio en mantenimiento, horario no disponible..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
            />

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setRejectModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={actionLoading === rejectModal.id}
                onClick={handleReject}
              >
                {actionLoading === rejectModal.id ? <Spinner size="sm" /> : 'Confirmar rechazo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
