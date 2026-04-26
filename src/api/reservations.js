import reservationsData from '../data/reservations.json'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

// In-memory store (simulates backend state)
let reservations = [...reservationsData]

export async function getReservationsByUser(userId) {
  await delay(500)
  return reservations.filter((r) => r.userId === userId)
}

export async function createReservation(data) {
  await delay(700)
  const newReservation = {
    id: reservations.length + 1,
    ...data,
    status: 'confirmed',
  }
  reservations.push(newReservation)
  return newReservation
}

export async function cancelReservation(id) {
  await delay(400)
  const index = reservations.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Reserva no encontrada.')
  reservations[index] = { ...reservations[index], status: 'cancelled' }
  return reservations[index]
}
