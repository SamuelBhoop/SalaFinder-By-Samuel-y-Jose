import PropTypes from 'prop-types'
import { STUDENT_PROGRAMS } from '../constants/programs'

export default function ProgramSelect({
  id = 'program',
  value,
  onChange,
  disabled = false,
  error,
  required = true,
  label = 'Carrera',
  hint,
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <select
        id={id}
        name="program"
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300'
        }`}
      >
        <option value="">Selecciona tu carrera</option>
        {STUDENT_PROGRAMS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

ProgramSelect.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  required: PropTypes.bool,
  label: PropTypes.string,
  hint: PropTypes.string,
}
