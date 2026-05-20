import { http } from '../lib/http'

function trimSeconds(time) {
  if (!time) return time
  const parts = time.split(':')
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time
}

function normalizeStatus(r) {
  if (r.isNoShow) return 'no-show'
  const s = r.status
  if (typeof s === 'string') return s.toLowerCase()
  return s
}

function normalizeReservation(r) {
  return {
    ...r,
    spaceName: r.space?.name ?? r.spaceName ?? 'Espacio',
    startTime: trimSeconds(r.startTime),
    endTime: trimSeconds(r.endTime),
    status: normalizeStatus(r),
    userDisplayName: r.user?.fullName ?? r.user?.email ?? r.userId,
  }
}

export async function getMyReservations() {
  const data = await http.get('/reservations/my')
  return data.map(normalizeReservation)
}

/**
 * Create a new reservation.
 * userId is derived from the JWT token on the server side.
 */
export function createReservation({ spaceId, date, startTime, endTime, purpose, attendeeCount }) {
  return http.post('/reservations', { spaceId, date, startTime, endTime, purpose, attendeeCount })
}

/**
 * Cancel one of the authenticated user's reservations.
 */
export function cancelReservation(id) {
  return http.post(`/reservations/${id}/cancel`)
}

// ── Admin / Staff ──

export async function getPendingReservations() {
  const data = await http.get('/reservations/pending')
  return data.map(normalizeReservation)
}

export function approveReservation(id) {
  return http.post(`/reservations/${id}/approve`)
}

export function rejectReservation(id, reason = '') {
  return http.post(`/reservations/${id}/reject`, { reason })
}

export async function getNoShowCandidates(fromDate, toDate) {
  const params = new URLSearchParams()
  if (fromDate) params.set('fromDate', fromDate)
  if (toDate) params.set('toDate', toDate)
  const qs = params.toString()
  const data = await http.get(`/reservations/no-show-candidates${qs ? `?${qs}` : ''}`)
  return data.map(normalizeReservation)
}

export function markNoShow(id) {
  return http.post(`/reservations/${id}/no-show`)
}

export async function getReservationById(id) {
  const data = await http.get(`/reservations/${id}`)
  return normalizeReservation(data)
}
