import spacesData from '../data/spaces.json'

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export async function getSpaces() {
  await delay(600)
  return spacesData
}

export async function getSpaceById(id) {
  await delay(400)
  const space = spacesData.find((s) => s.id === parseInt(id))
  if (!space) throw new Error('Espacio no encontrado.')
  return space
}
