import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import Button from './common/Button'
import { getSpaceConfig } from '../utils/spaceImages'

export default function SpaceCard({ space }) {
  const navigate = useNavigate()

  const resources = space.resources ?? []
  const config = getSpaceConfig(space.type)

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className={`h-36 bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
        <svg className="w-14 h-14 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={config.icon} />
        </svg>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-lg mb-0.5">{space.name}</h3>
        <p className="text-sm text-gray-400 mb-3">{space.building}</p>

        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {space.capacity} personas
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {config.label}
          </span>
        </div>

        {resources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
            {resources.map((resource) => (
              <span key={resource} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-xs font-medium">
                {resource}
              </span>
            ))}
          </div>
        )}

        <Button
          onClick={() => navigate(`/spaces/${space.id}/reserve`)}
          className="w-full mt-auto"
        >
          Reservar espacio
        </Button>
      </div>
    </article>
  )
}

SpaceCard.propTypes = {
  space: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    capacity: PropTypes.number.isRequired,
    building: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    resources: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
}
