import { useState, useEffect } from 'react'
import { getReservationsByUser } from '../api/reservations'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8:00 to 19:00

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const COLORS = [
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
]

function getWeekDates(baseDate) {
  const d = new Date(baseDate)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })
}

function toDateStr(date) {
  return date.toISOString().split('T')[0]
}

export default function CalendarPage() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [weekOffset, setWeekOffset] = useState(0)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const today = new Date()
  const referenceDate = new Date(today)
  referenceDate.setDate(today.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(referenceDate)

  const fetchReservations = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getReservationsByUser(user.id)
      setReservations(data.filter((r) => r.status !== 'cancelled'))
    } catch {
      setError('No se pudieron cargar las reservas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const getReservationsForSlot = (date, hour) => {
    const dateStr = toDateStr(date)
    return reservations.filter((r) => {
      if (r.date !== dateStr) return false
      const start = parseInt(r.startTime.split(':')[0])
      const end = parseInt(r.endTime.split(':')[0])
      return hour >= start && hour < end
    })
  }

  const isToday = (date) => toDateStr(date) === toDateStr(today)

  const weekLabel = `${weekDates[0].getDate()} – ${weekDates[6].getDate()} ${weekDates[6].toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario semanal</h1>
        <p className="text-gray-500 mt-1 text-sm">Vista de tus reservas por semana</p>
      </header>

      {/* Week navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset((o) => o - 1)}>
            ‹ Anterior
          </Button>
          <Button
            variant={weekOffset === 0 ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setWeekOffset(0)}
          >
            Hoy
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setWeekOffset((o) => o + 1)}>
            Siguiente ›
          </Button>
        </div>
        <p className="text-sm font-medium text-gray-600 capitalize">{weekLabel}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" role="status">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchReservations} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table
            className="w-full border-collapse min-w-[600px]"
            role="grid"
            aria-label="Calendario semanal de reservas"
          >
            <thead>
              <tr>
                <th className="w-14 py-3 border-b border-r border-gray-100 bg-gray-50" aria-label="Hora" />
                {weekDates.map((date, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="py-3 px-2 border-b border-r last:border-r-0 border-gray-100 bg-gray-50 text-center min-w-[90px]"
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isToday(date) ? 'text-teal-600' : 'text-gray-400'
                      }`}
                    >
                      {DAY_NAMES[i]}
                    </p>
                    <p
                      className={`text-xl font-bold mt-0.5 w-9 h-9 flex items-center justify-center mx-auto rounded-full ${
                        isToday(date) ? 'bg-teal-600 text-white' : 'text-gray-800'
                      }`}
                    >
                      {date.getDate()}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-gray-50 last:border-b-0">
                  <td className="py-2 px-2 border-r border-gray-100 text-xs text-gray-400 text-right bg-gray-50 font-mono align-top pt-3">
                    {hour}:00
                  </td>
                  {weekDates.map((date, i) => {
                    const slots = getReservationsForSlot(date, hour)
                    return (
                      <td
                        key={i}
                        className={`border-r last:border-r-0 border-gray-100 p-1 h-14 align-top ${
                          isToday(date) ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        {slots.map((r, ri) => (
                          <div
                            key={r.id}
                            className={`text-xs rounded-md px-1.5 py-1 border font-medium truncate mb-0.5 ${COLORS[ri % COLORS.length]}`}
                            title={`${r.spaceName}: ${r.startTime}–${r.endTime} | ${r.purpose}`}
                          >
                            {r.spaceName}
                          </div>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {!loading && !error && reservations.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Pasa el cursor sobre un bloque para ver los detalles de la reserva
        </p>
      )}
    </section>
  )
}
