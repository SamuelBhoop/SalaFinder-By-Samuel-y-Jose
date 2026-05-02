import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import Button from './common/Button'

export default function SpaceCard({ space }) {
  const navigate = useNavigate()

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative">
        <img
          src={space.image}
          alt={`Imagen de ${space.name}`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            space.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {space.available ? 'Disponible' : 'No disponible'}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-lg mb-0.5">{space.name}</h3>
        <p className="text-sm text-gray-400 mb-3">{space.location}</p>

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
            {space.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {space.amenities.map((amenity) => (
            <span key={amenity} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
              {amenity}
            </span>
          ))}
        </div>

        <Button
          onClick={() => navigate(`/spaces/${space.id}/reserve`)}
          disabled={!space.available}
          className="w-full mt-auto"
        >
          {space.available ? 'Reservar espacio' : 'No disponible'}
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
    location: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string.isRequired,
    available: PropTypes.bool.isRequired,
  }).isRequired,
}
