import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Edit2, MapPin, Calendar, Check, X } from 'lucide-react'
import { api } from '../lib/axios'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  // // const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', location: user?.location || '' })

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get('/trips').then((r) => r.data),
  })

  const updateProfile = useMutation({
    mutationFn: (data: any) => api.patch('/users/me', data).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data)
      setEditing(false)
      toast.success('Profile updated!')
    },
  })

  const stats = [
    { label: 'Trips', value: trips.length },
    { label: 'Countries', value: new Set(trips.flatMap((t: any) => t.destinations?.map((d: any) => d.destination?.country) || [])).size || 0 },
    { label: 'Collaborators', value: trips.reduce((s: number, t: any) => s + (t.members?.length || 1), 0) },
    { label: 'Total Budget', value: `$${trips.reduce((s: number, t: any) => s + t.totalBudget, 0).toLocaleString()}` },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3d5c, #1a6b5a)' }}>
        <div className="p-8 text-white relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center font-display text-3xl font-bold border-2 border-white/30">
              {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-2xl object-cover" /> : user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <input className="input bg-white/20 border-white/30 text-white placeholder-white/50 mb-2 font-display text-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              ) : (
                <h1 className="font-display text-2xl font-bold mb-1">{user?.name}</h1>
              )}
              <p className="text-white/70 text-sm">{user?.email}</p>
              {user?.location && !editing && (
                <p className="text-white/70 text-sm flex items-center gap-1 mt-1"><MapPin size={12} />{user.location}</p>
              )}
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button onClick={() => updateProfile.mutate(form)} className="btn-ghost bg-white/20 text-white border-white/30 hover:bg-white/30"><Check size={16} /></button>
                <button onClick={() => setEditing(false)} className="btn-ghost bg-white/20 text-white border-white/30 hover:bg-white/30"><X size={16} /></button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-ghost bg-white/20 text-white border-white/30 hover:bg-white/30"><Edit2 size={16} /> Edit</button>
            )}
          </div>
          {editing && (
            <div className="relative mt-4 grid grid-cols-2 gap-3">
              <input className="input bg-white/20 border-white/30 text-white placeholder-white/50" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input className="input bg-white/20 border-white/30 text-white placeholder-white/50" placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card text-center">
            <p className="text-2xl font-bold text-brand-500">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent trips */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Trips</h3>
        {trips.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No trips yet</p>
        ) : (
          <div className="space-y-3">
            {trips.slice(0, 5).map((trip: any) => (
              <div key={trip.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-br from-brand-400 to-teal-500 flex items-center justify-center text-white text-lg">✈️</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{trip.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No date'}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-500">{trip.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
