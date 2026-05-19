import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RoleRoute({ roles, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  const userRoles = user.roles ?? []
  const hasRole = roles.some((r) => userRoles.includes(r))

  if (!hasRole) return <Navigate to="/spaces" replace />

  return children
}
