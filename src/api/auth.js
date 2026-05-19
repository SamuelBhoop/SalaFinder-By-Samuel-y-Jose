import { http } from '../lib/http'

/**
 * Login against the real backend.
 * 1. POST /auth/login → get JWT token
 * 2. GET  /auth/me    → get full user profile (includes role, NoShowCount, etc.)
 * Returns { token, user }
 */
export async function login(email, password) {
  const { token } = await http.post('/auth/login', { email, password })
  localStorage.setItem('token', token)
  const user = await http.get('/auth/me')
  return { token, user }
}

/**
 * Register a new user then auto-login.
 * Returns { token, user }
 */
export async function register({ email, password, fullName }) {
  await http.post('/auth/register', { email, password, fullName, role: 'Student' })
  return login(email, password)
}
