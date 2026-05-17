import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, DollarSign, Users } from 'lucide-react'
import { api } from '../lib/axios'
import toast from 'react-hot-toast'

interface TripForm {
  name: string
  description: string
  startDate: string
  endDate: string
  totalBudget: number
}

export default function TripsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', totalBudget: '' })

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get('/trips').then((r) => r.data),
  })

  const createTrip = useMutation({
    mutationFn: (data: TripForm) => api.post('/trips', data).then((r) => r.data),
    onSuccess: (trip) => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      toast.success('Trip created!')
      setShowModal(false)
      setForm({ name: '', description: '', startDate: '', endDate: '', totalBudget: '' })
      navigate(`/trips/${trip.id}`)
    },
    onError: () => toast.error('Failed to create trip'),
  })

  const STATUS_COLORS: Record<string, string> = {
    PLANNING: 'bg-blue-50 text-blue-600',
    UPCOMING: 'bg-yellow-50 text-yellow-600',
    ACTIVE: 'bg-green-50 text-green-600',
    COMPLETED: 'bg-gray-100 text-gray-500',
    CANCELLED: 'bg-red-50 text-red-500',
  }

  const handleCreate = () => {
    if (!form.name) return
    createTrip.mutate({
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      totalBudget: parseFloat(form.totalBudget) || 0,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="text-sm text-gray-500 mt-1">{trips.length} trips total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New Trip
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48" />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start planning your first adventure</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
            <Plus size={16} /> Create First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip: any, i: number) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="card cursor-pointer"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{trip.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[trip.status]}`}>
                  {trip.status}
                </span>
              </div>
              {trip.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{trip.description}</p>}
              <div className="space-y-2 text-sm text-gray-500">
                {trip.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={13} />
                    <span>{new Date(trip.startDate).toLocaleDateString()} – {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '?'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign size={13} />
                  <span>${trip.totalBudget.toLocaleString()} {trip.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={13} />
                    <span>{trip.members?.length || 1} travelers</span>
                  </div>
                  <div className="flex -space-x-1.5">
                    {trip.members?.slice(0, 3).map((m: any) => (
                      <div key={m.id} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #e8a03a, #1a6b5a)' }}>
                        {m.user.name.slice(0, 1)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            whileHover={{ y: -3 }}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 transition-colors group"
            onClick={() => setShowModal(true)}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-orange-50">
              <Plus size={20} className="text-gray-400 group-hover:text-brand-500" />
            </div>
            <p className="font-medium text-sm text-gray-500 group-hover:text-brand-500">New Trip</p>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold">Plan New Trip</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Trip Name *</label>
                  <input className="input" placeholder="e.g. Summer in Santorini" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={2} placeholder="What's the vibe?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Budget (USD)</label>
                  <input type="number" className="input" placeholder="e.g. 2500" value={form.totalBudget} onChange={(e) => setForm({ ...form, totalBudget: e.target.value })} />
                </div>
                <button
                  style={{ width: '100%', padding: '12px', background: form.name ? '#c17d3a' : '#e5e7eb', color: form.name ? 'white' : '#9ca3af', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: form.name ? 'pointer' : 'not-allowed' }}
                  disabled={!form.name || createTrip.isPending}
                  onClick={handleCreate}
                >
                  {createTrip.isPending ? 'Creating...' : '🚀 Create Trip'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
