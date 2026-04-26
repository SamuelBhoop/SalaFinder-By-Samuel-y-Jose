import users from '../data/users.json'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export async function login(email, password) {
  await delay(800)
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
  const { password: _, ...userWithoutPassword } = user
  return { user: userWithoutPassword, token: 'mock-token-salafinder' }
}

export async function logout() {
  await delay(300)
  return { success: true }
}
