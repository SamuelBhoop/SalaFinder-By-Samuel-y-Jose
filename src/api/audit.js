import { http } from '../lib/http'

/**
 * @param {{ entityType?: string, entityId?: number, limit?: number }} filters
 */
export function getAuditLogs({ entityType, entityId, limit = 100 } = {}) {
  const params = new URLSearchParams()
  if (entityType) params.set('entityType', entityType)
  if (entityId != null) params.set('entityId', String(entityId))
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return http.get(`/audit${qs ? `?${qs}` : ''}`)
}
