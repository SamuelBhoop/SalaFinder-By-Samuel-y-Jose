import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

export default function ProgramSetupBanner({ className = '' }) {
  return (
    <div
      className={`bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 ${className}`}
      role="status"
    >
      <p className="font-medium">Registra tu carrera</p>
      <p className="mt-1 text-amber-800">
        Algunos espacios solo están disponibles para estudiantes de carreras específicas (por ejemplo Ingeniería).
        Indica tu carrera para ver y reservar los espacios que te corresponden.
      </p>
      <Link
        to="/profile/program"
        className="inline-block mt-2 text-teal-700 font-semibold hover:text-teal-800 underline"
      >
        Configurar carrera →
      </Link>
    </div>
  )
}

ProgramSetupBanner.propTypes = {
  className: PropTypes.string,
}
