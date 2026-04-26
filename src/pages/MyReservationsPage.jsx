import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReservationsByUser, cancelReservation } from '../api/reservations'
import ReservationCard from '../components/ReservationCard'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

const TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export default function MyReservationsPage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [cancellingId, setCancellingId] = useState(null)

  const fetchReservations = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getReservationsByUser(user.id)
      setReservations(data)
    } catch {
      setError('No se pudieron cargar tus reservas. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return
    setCancellingId(id)
    try {
      await cancelReservation(id)
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
      )
    } catch {
      setError('No se pudo cancelar la reserva.')
    } finally {
      setCancellingId(null)
    }
  }

  const filteredReservations = reservations.filter(
    (r) => activeTab === 'all' || r.status === activeTab
  )

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
        <p className="text-gray-500 mt-1 text-sm">Gestiona todas tus reservas de espacios</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" role="status" aria-label="Cargando reservas">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Cargando reservas...</p>
          </div>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchReservations} />
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          title="No tienes reservas"
          description={
            activeTab === 'all'
              ? 'Aún no has hecho ninguna reserva.'
              : `No tienes reservas ${activeTab === 'confirmed' ? 'confirmadas' : 'canceladas'}.`
          }
          action={
            <Button onClick={() => navigate('/spaces')}>Explorar espacios</Button>
          }
        />
      ) : (
        <div className="space-y-4" role="list" aria-label="Lista de reservas">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} role="listitem">
              <ReservationCard
                reservation={reservation}
                onCancel={cancellingId === reservation.id ? undefined : handleCancel}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
