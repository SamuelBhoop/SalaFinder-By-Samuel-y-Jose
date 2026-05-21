import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProgram } from '../api/auth'
import ProgramSelect from '../components/ProgramSelect'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'

export default function ProfileProgramPage() {
  const navigate = useNavigate()
  const { user, saveSession } = useAuth()
  const [program, setProgram] = useState(user?.program ?? '')
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setProgram(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!program) {
      setError('Selecciona tu carrera')
      return
    }
    setLoading(true)
    setApiError('')
    try {
      const updated = await updateProgram(program)
      const token = localStorage.getItem('token')
      saveSession(updated, token)
      navigate('/spaces')
    } catch (err) {
      setApiError(err.message || 'No se pudo guardar la carrera.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tu carrera</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {user?.program
            ? 'Puedes actualizar tu carrera si cambiaste de programa académico.'
            : 'Necesitamos tu carrera para mostrarte los espacios que puedes reservar.'}
        </p>
      </header>

      {apiError && <ErrorMessage message={apiError} className="mb-4" />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <ProgramSelect
          value={program}
          onChange={handleChange}
          error={error}
          hint="Solo verás y podrás reservar espacios permitidos para tu carrera."
        />

        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/spaces')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar carrera'
            )}
          </Button>
        </div>
      </form>
    </section>
  )
}
