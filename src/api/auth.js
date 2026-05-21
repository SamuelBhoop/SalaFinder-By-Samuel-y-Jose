import { http } from '../lib/http'
import { normalizeUser } from '../utils/authUser'

export async function getMe() {
  const data = await http.get('/auth/me')
  return normalizeUser(data)
}

/**
 * Login against the real backend.
 * 1. POST /auth/login → get JWT token
 * 2. GET  /auth/me    → get full user profile (includes role, NoShowCount, etc.)
 * Returns { token, user }
 */
export async function login(email, password) {
  const { token } = await http.post('/auth/login', { email, password })
  localStorage.setItem('token', token)
  const user = await getMe()
  return { token, user }
}

/**
 * Register a new user then auto-login.
 * Returns { token, user }
 */
export async function getPrograms() {
  const data = await http.get('/auth/programs')
  return Array.isArray(data) ? data : []
}

export async function updateProgram(program) {
  const data = await http.put('/auth/program', { program })
  return normalizeUser(data)
}

export async function register({ email, password, fullName, program }) {
  await http.post('/auth/register', {
    email,
    password,
    fullName,
    role: 'Student',
    program,
  })
  return login(email, password)
}
