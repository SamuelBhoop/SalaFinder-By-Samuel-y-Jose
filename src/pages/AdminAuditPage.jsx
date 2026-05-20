import { useState, useEffect, useCallback } from 'react'
import { getAuditLogs } from '../api/audit'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

const ACTION_LABELS = {
  Created: 'Creada',
  Updated: 'Actualizada',
  StatusChanged: 'Estado cambiado',
  Approved: 'Aprobada',
  Rejected: 'Rechazada',
  Cancelled: 'Cancelada',
  MarkedNoShow: 'No-show',
}

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return ts
  }
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [limit, setLimit] = useState('100')

  const fetchLogs = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await getAuditLogs({
        entityType: entityType.trim() || undefined,
        entityId: entityId.trim() ? Number(entityId) : undefined,
        limit: Number(limit) || 100,
      })
      setLogs(data)
    } catch {
      setError('No se pudieron cargar los logs de auditoría.')
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId, limit])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auditoría</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Historial de acciones sobre reservas y otros registros del sistema.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100">
        <div className="flex-1 min-w-[140px]">
          <label htmlFor="entityType" className="block text-xs font-medium text-gray-600 mb-1">Tipo de entidad</label>
          <input
            id="entityType"
            type="text"
            placeholder="Ej: Reservation"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="w-full sm:w-32">
          <label htmlFor="entityId" className="block text-xs font-medium text-gray-600 mb-1">ID entidad</label>
          <input
            id="entityId"
            type="number"
            min={1}
            placeholder="—"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="w-full sm:w-24">
          <label htmlFor="limit" className="block text-xs font-medium text-gray-600 mb-1">Límite</label>
          <input
            id="limit"
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-end">
          <Button variant="secondary" onClick={fetchLogs} disabled={loading}>
            Buscar
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchLogs} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center py-20" role="status">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Entidad</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{log.entityType}</td>
                    <td className="px-4 py-3 text-gray-600">{log.entityId}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate" title={log.userId}>
                      {log.userId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs">
                      {log.oldValues && (
                        <span className="block text-red-600/80 line-through truncate">{log.oldValues}</span>
                      )}
                      {log.newValues && (
                        <span className="block text-teal-700 truncate">{log.newValues}</span>
                      )}
                      {!log.oldValues && !log.newValues && '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs.length === 0 && !error && (
            <p className="text-center py-8 text-gray-500 text-sm">No hay registros con estos filtros.</p>
          )}
        </div>
      )}
    </section>
  )
}
