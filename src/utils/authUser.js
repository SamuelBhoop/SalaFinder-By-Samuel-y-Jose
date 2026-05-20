/** Normaliza la respuesta de GET /auth/me para el contexto de la app. */
export function normalizeUser(data) {
  if (!data) return null

  const blockedUntil = data.blockedUntil ?? data.BlockedUntil ?? null
  let isBlocked = Boolean(data.isBlocked ?? data.IsBlocked)
  if (!isBlocked && blockedUntil) {
    isBlocked = new Date(blockedUntil) > new Date()
  }

  return {
    id: data.id,
    email: data.email,
    name: data.fullName ?? data.name ?? data.email,
    fullName: data.fullName,
    roles: data.roles ?? data.Roles ?? [],
    noShowCount: data.noShowCount ?? data.NoShowCount ?? 0,
    blockedUntil,
    isBlocked,
  }
}

export function formatBlockedUntil(blockedUntil) {
  if (!blockedUntil) return ''
  try {
    return new Date(blockedUntil).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return String(blockedUntil)
  }
}
