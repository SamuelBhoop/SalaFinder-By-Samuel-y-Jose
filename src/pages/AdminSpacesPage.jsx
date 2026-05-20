import { useState, useEffect, useCallback } from 'react'
import { getSpaces, createSpace, updateSpace, deleteSpace } from '../api/spaces'
import { getSpaceConfig } from '../utils/spaceImages'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Button from '../components/common/Button'

const SPACE_TYPES = [
  { value: 'Room', label: 'Sala' },
  { value: 'Lab', label: 'Laboratorio' },
  { value: 'Court', label: 'Cancha' },
]

const EMPTY_FORM = {
  name: '',
  type: 'Room',
  capacity: 10,
  building: '',
  resources: '',
  allowedPrograms: '',
  requiresApproval: true,
}

function spaceToForm(space) {
  return {
    name: space.name ?? '',
    type: space.type ?? 'Room',
    capacity: space.capacity ?? 10,
    building: space.building ?? '',
    resources: (space.resources ?? []).join(', '),
    allowedPrograms: (space.allowedPrograms ?? []).join(', '),
    requiresApproval: space.requiresApproval ?? false,
  }
}

function formToPayload(form) {
  const splitList = (s) =>
    s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
  return {
    name: form.name.trim(),
    type: form.type,
    capacity: Number(form.capacity),
    building: form.building.trim(),
    resources: splitList(form.resources),
    allowedPrograms: splitList(form.allowedPrograms),
    requiresApproval: form.requiresApproval,
  }
}

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchSpaces = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await getSpaces()
      setSpaces(data)
    } catch {
      setError('No se pudieron cargar los espacios.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSpaces()
  }, [fetchSpaces])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (space) => {
    setEditingId(space.id)
    setForm(spaceToForm(space))
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.building.trim()) {
      setError('Nombre y edificio son obligatorios.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = formToPayload(form)
      if (editingId) {
        await updateSpace(editingId, { ...payload, id: editingId })
      } else {
        await createSpace(payload)
      }
      closeModal()
      await fetchSpaces()
    } catch (err) {
      setError(err.message || 'No se pudo guardar el espacio.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    setError('')
    try {
      await deleteSpace(deleteTarget.id)
      setDeleteTarget(null)
      await fetchSpaces()
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el espacio.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionar espacios</h1>
          <p className="text-gray-500 mt-1 text-sm">Crear, editar y eliminar salas, laboratorios y canchas.</p>
        </div>
        <Button onClick={openCreate}>Nuevo espacio</Button>
      </header>

      {error && !modalOpen && <ErrorMessage message={error} onRetry={fetchSpaces} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center py-20" role="status">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Capacidad</th>
                  <th className="px-4 py-3">Edificio</th>
                  <th className="px-4 py-3">Aprobación</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {spaces.map((space) => {
                  const cfg = getSpaceConfig(space.type)
                  return (
                    <tr key={space.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{space.name}</td>
                      <td className="px-4 py-3 text-gray-600">{cfg.label}</td>
                      <td className="px-4 py-3 text-gray-600">{space.capacity}</td>
                      <td className="px-4 py-3 text-gray-600">{space.building}</td>
                      <td className="px-4 py-3">
                        {space.requiresApproval ? (
                          <span className="text-amber-700 text-xs font-medium">Requiere</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Automática</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(space)}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(space)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {spaces.length === 0 && (
            <p className="text-center py-8 text-gray-500 text-sm">No hay espacios registrados.</p>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? 'Editar espacio' : 'Nuevo espacio'}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar espacio' : 'Nuevo espacio'}
            </h3>

            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="space-y-4">
              <div>
                <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  id="spaceName"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="spaceType" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    id="spaceType"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    {SPACE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="spaceCapacity" className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                  <input
                    id="spaceCapacity"
                    type="number"
                    min={1}
                    required
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="spaceBuilding" className="block text-sm font-medium text-gray-700 mb-1">Edificio</label>
                <input
                  id="spaceBuilding"
                  required
                  value={form.building}
                  onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="spaceResources" className="block text-sm font-medium text-gray-700 mb-1">
                  Recursos <span className="text-gray-400 font-normal">(separados por coma)</span>
                </label>
                <input
                  id="spaceResources"
                  value={form.resources}
                  onChange={(e) => setForm((f) => ({ ...f, resources: e.target.value }))}
                  placeholder="Proyector, Pizarra, WiFi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="spacePrograms" className="block text-sm font-medium text-gray-700 mb-1">
                  Programas permitidos <span className="text-gray-400 font-normal">(separados por coma)</span>
                </label>
                <input
                  id="spacePrograms"
                  value={form.allowedPrograms}
                  onChange={(e) => setForm((f) => ({ ...f, allowedPrograms: e.target.value }))}
                  placeholder="Ingeniería, Ciencias"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.requiresApproval}
                  onChange={(e) => setForm((f) => ({ ...f, requiresApproval: e.target.checked }))}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Requiere aprobación de Admin/Staff
              </label>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button type="button" variant="secondary" size="sm" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? <Spinner size="sm" /> : 'Guardar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" role="dialog" aria-modal="true">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar espacio</h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Eliminar <strong>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" disabled={saving} onClick={handleDelete}>
                {saving ? <Spinner size="sm" /> : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
