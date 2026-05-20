import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getMe } from '../api/auth'
import { normalizeUser } from '../utils/authUser'

const AuthContext = createContext(null)

function loadUser() {
  try {
    const raw = JSON.parse(localStorage.getItem('user') || 'null')
    return raw ? normalizeUser(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)

  const saveSession = useCallback((userData, token) => {
    const normalized = normalizeUser(userData) ?? userData
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(normalized))
    setUser(normalized)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) return
    try {
      const profile = await getMe()
      localStorage.setItem('user', JSON.stringify(profile))
      setUser(profile)
    } catch {
      // 401: http.js redirige a login
    }
  }, [])

  useEffect(() => {
    if (localStorage.getItem('token')) {
      refreshUser()
    }
  }, [refreshUser])

  return (
    <AuthContext.Provider value={{ user, saveSession, clearSession, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
