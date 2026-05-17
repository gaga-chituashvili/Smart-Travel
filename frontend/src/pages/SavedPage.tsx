import { motion } from 'framer-motion'
import { MapPin, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SAVED = [
  { id: '1', name: 'Kyoto', country: 'Japan', emoji: '⛩️', rating: 4.9, price: 1200, color: '#c17d3a' },
  { id: '2', name: 'Machu Picchu', country: 'Peru', emoji: '🏛️', rating: 4.7, price: 980, color: '#7a4d8a' },
  { id: '3', name: 'Amalfi Coast', country: 'Italy', emoji: '🌊', rating: 4.8, price: 1650, color: '#1a6b5a' },
]

export default function SavedPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Saved Places</h1>
        <p className="text-sm text-gray-500 mt-1">{SAVED.length} saved destinations</p>
      </div>

      {SAVED.length === 0 ? (
        <div className="text-center py-24">
          <Heart size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved places yet</h3>
          <p className="text-gray-500 text-sm mb-6">Explore destinations and save your favorites</p>
          <button onClick={() => navigate('/map')} className="btn-primary mx-auto">Explore Map</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAVED.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 cursor-pointer"
              onClick={() => navigate('/map')}
            >
              <div className="h-44 flex items-center justify-center text-6xl relative" style={{ background: `linear-gradient(135deg, ${dest.color}cc, #1a3d5c)` }}>
                {dest.emoji}
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:scale-110 transition-transform">
                  <Heart size={14} fill="currentColor" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{dest.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 mb-3"><MapPin size={11} />{dest.country}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-500 font-bold text-sm">From ${dest.price}</span>
                  <span className="text-xs text-yellow-500">⭐ {dest.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
