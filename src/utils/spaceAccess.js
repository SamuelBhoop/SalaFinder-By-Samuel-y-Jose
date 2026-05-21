import { OPEN_TO_ALL_LABEL } from '../constants/programs'

/** Indica si la carrera del estudiante puede reservar el espacio. */
export function canStudentAccessSpace(space, studentProgram) {
  const allowed = space?.allowedPrograms ?? []
  if (allowed.length === 0) return true
  if (allowed.some((p) => p.trim().toLowerCase() === OPEN_TO_ALL_LABEL.toLowerCase())) {
    return true
  }
  if (!studentProgram?.trim()) return false
  const program = studentProgram.trim().toLowerCase()
  return allowed.some((p) => p.trim().toLowerCase() === program)
}

export function formatAllowedPrograms(allowedPrograms) {
  const list = allowedPrograms ?? []
  if (list.length === 0) return 'Sin restricción'
  if (list.some((p) => p.trim().toLowerCase() === OPEN_TO_ALL_LABEL.toLowerCase())) {
    return 'Todas las carreras'
  }
  return list.join(', ')
}
