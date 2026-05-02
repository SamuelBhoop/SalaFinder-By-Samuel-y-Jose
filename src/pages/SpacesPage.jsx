import { useState, useEffect } from 'react'
import { getSpaces } from '../api/spaces'
import SpaceCard from '../components/SpaceCard'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterCapacity, setFilterCapacity] = useState('all')
  const [filterAvailable, setFilterAvailable] = useState(false)

  const fetchSpaces = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getSpaces()
      setSpaces(data)
    } catch {
      setError('No se pudieron cargar los espacios. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpaces()
  }, [])

  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch =
      space.name.toLowerCase().includes(search.toLowerCase()) ||
      space.location.toLowerCase().includes(search.toLowerCase()) ||
      space.type.toLowerCase().includes(search.toLowerCase())

    const matchesCapacity =
      filterCapacity === 'all' ||
      (filterCapacity === 'small' && space.capacity <= 8) ||
      (filterCapacity === 'medium' && space.capacity > 8 && space.capacity <= 20) ||
      (filterCapacity === 'large' && space.capacity > 20)

    const matchesAvailable = !filterAvailable || space.available

    return matchesSearch && matchesCapacity && matchesAvailable
  })

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Espacios disponibles</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Encuentra y reserva el espacio perfecto para tus necesidades
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Buscar por nombre, tipo o ubicación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar espacios"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Capacity filter */}
        <select
          value={filterCapacity}
          onChange={(e) => setFilterCapacity(e.target.value)}
          aria-label="Filtrar por capacidad"
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="all">Todas las capacidades</option>
          <option value="small">Pequeña (1–8 personas)</option>
          <option value="medium">Mediana (9–20 personas)</option>
          <option value="large">Grande (más de 20)</option>
        </select>

        {/* Available only toggle */}
        <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50 select-none">
          <input
            type="checkbox"
            checked={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.checked)}
            className="rounded text-teal-600 focus:ring-teal-500"
          />
          Solo disponibles
        </label>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20" role="status" aria-label="Cargando espacios">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-500">Cargando espacios...</p>
          </div>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchSpaces} />
      ) : filteredSpaces.length === 0 ? (
        <EmptyState
          title="No se encontraron espacios"
          description={
            search
              ? `No hay resultados para "${search}"`
              : 'No hay espacios que coincidan con los filtros seleccionados.'
          }
          action={
            <Button variant="secondary" onClick={() => { setSearch(''); setFilterCapacity('all'); setFilterAvailable(false) }}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">
            {filteredSpaces.length} espacio{filteredSpaces.length !== 1 ? 's' : ''} encontrado
            {filteredSpaces.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
