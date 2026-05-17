import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, X, GripVertical, Clock, DollarSign, MapPin, Users, Wallet, MessageSquare, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useTrip, useAddDay, useAddActivity, useDeleteActivity, useReorderActivities } from '../hooks/useTrips'
import type { Activity, TripDay } from '../types'
import toast from 'react-hot-toast'

const ACTIVITY_TYPES = ['HOTEL', 'FLIGHT', 'TRANSPORT', 'FOOD', 'SIGHT', 'ACTIVITY', 'SHOPPING', 'OTHER']
const TYPE_COLORS: Record<string, string> = {
  HOTEL: '#ccfbf1', FLIGHT: '#dbeafe', TRANSPORT: '#ede9fe',
  FOOD: '#ffedd5', SIGHT: '#e0f2fe', ACTIVITY: '#dcfce7', SHOPPING: '#fce7f3', OTHER: '#f3f4f6',
}
const TYPE_TEXT: Record<string, string> = {
  HOTEL: '#0f766e', FLIGHT: '#1d4ed8', TRANSPORT: '#6d28d9',
  FOOD: '#c2410c', SIGHT: '#0369a1', ACTIVITY: '#15803d', SHOPPING: '#be185d', OTHER: '#4b5563',
}
const TYPE_EMOJI: Record<string, string> = {
  HOTEL: '🏨', FLIGHT: '✈️', TRANSPORT: '🚌', FOOD: '🍽️',
  SIGHT: '🎯', ACTIVITY: '🎭', SHOPPING: '🛍️', OTHER: '📌',
}

function SortableActivity({ activity, onDelete }: { activity: Activity; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 rounded-xl group hover:bg-gray-50 transition-colors border border-gray-100">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <span className="text-xl">{TYPE_EMOJI[activity.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">{activity.name}</p>
          <span style={{ background: TYPE_COLORS[activity.type], color: TYPE_TEXT[activity.type], fontSize: '11px', padding: '1px 8px', borderRadius: '20px', fontWeight: 600 }}>
            {activity.type}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
          {activity.startTime && <span className="flex items-center gap-1"><Clock size={10} />{activity.startTime}</span>}
          {activity.address && <span className="flex items-center gap-1 truncate"><MapPin size={10} />{activity.address}</span>}
        </div>
      </div>
      {activity.cost > 0 && (
        <span className="text-sm font-bold text-brand-500 flex items-center">
          <DollarSign size={12} />{activity.cost}
        </span>
      )}
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function DayBlock({ day, tripId, collapsed, onToggle }: { day: TripDay; tripId: string; collapsed: boolean; onToggle: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'SIGHT', startTime: '', cost: '', address: '' })

  const addActivity = useAddActivity(tripId)
  const deleteActivity = useDeleteActivity(tripId)
  const reorder = useReorderActivities(tripId)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = day.activities.findIndex((a) => a.id === active.id)
    const newIndex = day.activities.findIndex((a) => a.id === over.id)
    const newOrder = arrayMove(day.activities, oldIndex, newIndex)
    reorder.mutate({ dayId: day.id, orderedIds: newOrder.map((a) => a.id) })
  }

  const handleAdd = () => {
    if (!form.name) return
    addActivity.mutate(
      { dayId: day.id, data: { ...form, cost: parseFloat(form.cost) || 0 } },
      { onSuccess: () => { setShowForm(false); setForm({ name: '', type: 'SIGHT', startTime: '', cost: '', address: '' }); toast.success('Activity added!') } }
    )
  }

  const dayTotal = day.activities.reduce((s, a) => s + a.cost, 0)

  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {day.dayNumber}
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm">{day.title || `Day ${day.dayNumber}`}</p>
          {day.date && <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{day.activities.length} activities</span>
          {dayTotal > 0 && <span className="text-brand-500 font-bold">${dayTotal}</span>}
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mt-4 space-y-2">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={day.activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                {day.activities.map((activity) => (
                  <SortableActivity
                    key={activity.id}
                    activity={activity}
                    onDelete={() => deleteActivity.mutate({ dayId: day.id, actId: activity.id })}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {day.activities.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No activities yet</p>}

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <input className="input text-sm" placeholder="Activity name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <select className="input text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input className="input text-sm" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                    <input className="input text-sm" type="number" placeholder="Cost ($)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                    <input className="input text-sm" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary flex-1 justify-center text-sm py-2" disabled={!form.name || addActivity.isPending} onClick={handleAdd}>
                      {addActivity.isPending ? 'Adding...' : 'Add'}
                    </button>
                    <button className="btn-outline text-sm py-2" onClick={() => setShowForm(false)}><X size={14} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showForm && (
              <button onClick={() => setShowForm(true)} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> Add Activity
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set())

  const { data: trip, isLoading } = useTrip(id!)
  const addDay = useAddDay(id!)

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32" />)}
    </div>
  )

  if (!trip) return <div className="text-center py-20 text-gray-500">Trip not found</div>

  const totalCost = trip.days?.flatMap((d: TripDay) => d.activities).reduce((s: number, a: Activity) => s + a.cost, 0) || 0
  const toggleDay = (dayId: string) => setCollapsedDays((prev) => { const next = new Set(prev); next.has(dayId) ? next.delete(dayId) : next.add(dayId); return next })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">{trip.name}</h1>
          {trip.description && <p className="text-gray-500 text-sm mt-1">{trip.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            {trip.startDate && (
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {new Date(trip.startDate).toLocaleDateString()} – {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '?'}
              </span>
            )}
            <span className="flex items-center gap-1"><Users size={13} />{trip.members?.length} travelers</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigate(`/budget/${id}`)} className="btn-outline text-sm"><Wallet size={15} /> Budget</button>
          <button onClick={() => navigate(`/collab/${id}`)} className="btn-outline text-sm"><MessageSquare size={15} /> Collab</button>
        </div>
      </div>

      {/* Budget bar */}
      {trip.totalBudget > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Budget Used</span>
            <span className="text-sm font-bold text-brand-500">${totalCost.toLocaleString()} / ${trip.totalBudget.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalCost / trip.totalBudget) * 100, 100)}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full"
              style={{ background: totalCost > trip.totalBudget ? '#ef4444' : 'linear-gradient(90deg, #1a6b5a, #c17d3a)' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">{Math.round((totalCost / trip.totalBudget) * 100)}% used</span>
            <span className="text-xs text-gray-500">${(trip.totalBudget - totalCost).toLocaleString()} remaining</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {trip.days?.map((day: TripDay) => (
            <DayBlock key={day.id} day={day} tripId={id!} collapsed={collapsedDays.has(day.id)} onToggle={() => toggleDay(day.id)} />
          ))}
          <button
            onClick={() => addDay.mutate({}, { onSuccess: () => toast.success('Day added!') })}
            disabled={addDay.isPending}
            className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} /> {addDay.isPending ? 'Adding...' : 'Add Day'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Team</h3>
            <div className="space-y-2">
              {trip.members?.map((m: any) => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {m.user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.user.name}</p>
                    <p className="text-xs text-gray-500">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Days</span><span className="font-medium">{trip.days?.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Activities</span><span className="font-medium">{trip.days?.flatMap((d: TripDay) => d.activities).length || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Spent</span><span className="font-medium text-brand-500">${totalCost.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Budget</span><span className="font-medium">${trip.totalBudget.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
