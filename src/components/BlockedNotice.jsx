import PropTypes from 'prop-types'
import { formatBlockedUntil } from '../utils/authUser'

export default function BlockedNotice({ user, variant = 'banner' }) {
  if (!user?.isBlocked) return null

  const untilText = formatBlockedUntil(user.blockedUntil)
  const count = user.noShowCount ?? 0

  if (variant === 'full') {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        role="alert"
      >
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Reservas suspendidas</h2>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Tu cuenta está temporalmente bloqueada por acumular {count} no-show{count !== 1 ? 's' : ''}.
          {untilText ? (
            <> Podrás reservar de nuevo a partir del <strong>{untilText}</strong>.</>
          ) : (
            ' Contacta al administrador si necesitas ayuda.'
          )}
        </p>
      </div>
    )
  }

  return (
    <div
      className="bg-orange-50 border-b border-orange-200 px-4 py-3"
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex gap-3 items-start">
        <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-orange-900">
          <span className="font-semibold">No puedes crear reservas</span>
          {' '}por política de no-show ({count} registro{count !== 1 ? 's' : ''}).
          {untilText ? (
            <> El bloqueo termina el <strong>{untilText}</strong>.</>
          ) : null}
          {' '}Puedes seguir viendo el calendario y tus reservas anteriores.
        </p>
      </div>
    </div>
  )
}

BlockedNotice.propTypes = {
  user: PropTypes.shape({
    isBlocked: PropTypes.bool,
    blockedUntil: PropTypes.string,
    noShowCount: PropTypes.number,
  }),
  variant: PropTypes.oneOf(['banner', 'full']),
}
