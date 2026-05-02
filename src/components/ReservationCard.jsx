import PropTypes from 'prop-types'
import Button from './common/Button'

const statusConfig = {
  confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada', className: 'bg-red-100 text-red-700' },
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
}

export default function ReservationCard({ reservation, onCancel }) {
  const status = statusConfig[reservation.status] || statusConfig.pending

  const formattedDate = new Date(reservation.date + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{reservation.spaceName}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="capitalize">{formattedDate}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {reservation.startTime} – {reservation.endTime}
          </span>
        </div>

        {reservation.purpose && (
          <p className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Motivo:</span> {reservation.purpose}
          </p>
        )}
      </div>

      {reservation.status === 'confirmed' && onCancel && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => onCancel(reservation.id)}
          className="flex-shrink-0"
        >
          Cancelar
        </Button>
      )}
    </article>
  )
}

ReservationCard.propTypes = {
  reservation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    spaceName: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['confirmed', 'cancelled', 'pending']).isRequired,
    purpose: PropTypes.string,
  }).isRequired,
  onCancel: PropTypes.func,
}
