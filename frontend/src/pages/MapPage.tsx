import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Search, MapPin, Star, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

const customIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`)}`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
})

const PLACES = [
  { id: '1', name: 'Eiffel Tower', country: 'France', city: 'Paris', lat: 48.8584, lng: 2.2945, type: 'Sight', rating: 4.9, cost: 0, emoji: '🗼' },
  { id: '2', name: 'Louvre Museum', country: 'France', city: 'Paris', lat: 48.8606, lng: 2.3376, type: 'Culture', rating: 4.8, cost: 15, emoji: '🏛️' },
  { id: '3', name: 'Colosseum', country: 'Italy', city: 'Rome', lat: 41.8902, lng: 12.4922, type: 'Sight', rating: 4.9, cost: 16, emoji: '🏟️' },
  { id: '4', name: 'Sagrada Familia', country: 'Spain', city: 'Barcelona', lat: 41.4036, lng: 2.1744, type: 'Culture', rating: 4.8, cost: 26, emoji: '⛪' },
  { id: '5', name: 'Acropolis', country: 'Greece', city: 'Athens', lat: 37.9715, lng: 23.7267, type: 'Sight', rating: 4.7, cost: 20, emoji: '🏛️' },
  { id: '6', name: 'Tbilisi Old Town', country: 'Georgia', city: 'Tbilisi', lat: 41.6941, lng: 44.8337, type: 'City', rating: 4.6, cost: 0, emoji: '🏘️' },
  { id: '7', name: 'Santorini Caldera', country: 'Greece', city: 'Santorini', lat: 36.3932, lng: 25.4615, type: 'Beach', rating: 4.9, cost: 0, emoji: '🌅' },
  { id: '8', name: 'Kyoto Temple', country: 'Japan', city: 'Kyoto', lat: 35.0116, lng: 135.7681, type: 'Culture', rating: 4.9, cost: 5, emoji: '⛩️' },
]

const TYPE_COLORS: Record<string, string> = {
  Sight: '#c17d3a', Culture: '#1a4d7a', Beach: '#1a6b5a', City: '#7a4d8a',
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => { map.flyTo([lat, lng], 14, { duration: 1.5 }) }, [lat, lng])
  return null
}

export default function MapPage() {
  const [selected, setSelected] = useState(PLACES[0])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filters = ['All', 'Sight', 'Culture', 'Beach', 'City']
  const filtered = PLACES.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || p.type === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Interactive Map</h1>
        <p className="text-sm text-gray-500 mt-1">Explore destinations worldwide</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-sm border transition-all ${filter === f ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 dark:border-gray-700 hover:border-brand-400'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-260px)]">
        {/* List */}
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 text-sm" placeholder="Search places..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {filtered.map((place) => (
              <motion.div
                key={place.id}
                whileHover={{ x: 2 }}
                onClick={() => setSelected(place)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${selected.id === place.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200'}`}
              >
                <div className="text-2xl">{place.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{place.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{place.city}, {place.country}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-yellow-500 flex items-center gap-0.5"><Star size={10} />{place.rating}</p>
                  <p className="text-xs text-brand-500 font-medium">{place.cost === 0 ? 'Free' : `$${place.cost}`}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <MapContainer center={[48.8566, 2.3522]} zoom={5} className="w-full h-full" zoomControl={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo lat={selected.lat} lng={selected.lng} />
            {filtered.map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={customIcon(TYPE_COLORS[place.type] || '#c17d3a')}
                eventHandlers={{ click: () => setSelected(place) }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <div className="text-2xl mb-1">{place.emoji}</div>
                    <p className="font-semibold text-sm">{place.name}</p>
                    <p className="text-xs text-gray-500">{place.city}, {place.country}</p>
                    <div className="flex items-center justify-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-0.5 text-yellow-500"><Star size={10} />{place.rating}</span>
                      <span className="flex items-center gap-0.5 text-brand-500"><DollarSign size={10} />{place.cost === 0 ? 'Free' : place.cost}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
