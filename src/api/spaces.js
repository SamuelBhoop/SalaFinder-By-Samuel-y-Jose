import { http } from '../lib/http'

export function getSpaces() {
  return http.get('/spaces')
}

export function getSpaceById(id) {
  return http.get(`/spaces/${id}`)
}

/**
 * Weekly availability view.
 * @param {string} weekStart - ISO date string (YYYY-MM-DD) for the Monday of the week
 */
export function getSpacesAvailability(weekStart) {
  return http.get(`/spaces/availability?weekStart=${weekStart}`)
}

export function createSpace(space) {
  return http.post('/spaces', space)
}

export function updateSpace(id, space) {
  return http.put(`/spaces/${id}`, space)
}

export function deleteSpace(id) {
  return http.delete(`/spaces/${id}`)
}
