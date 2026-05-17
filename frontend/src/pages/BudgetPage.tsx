import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Plus, X, Trash2 } from 'lucide-react'
import { useBudgetSummary, useExpenses, useAddExpense, useDeleteExpense } from '../hooks/useBudget'
import toast from 'react-hot-toast'

const CATEGORIES = ['HOTEL', 'FLIGHT', 'TRANSPORT', 'FOOD', 'ACTIVITIES', 'SHOPPING', 'OTHER']
const CAT_COLORS: Record<string, string> = {
  HOTEL: '#c17d3a', FLIGHT: '#1a4d7a', TRANSPORT: '#7a4d8a',
  FOOD: '#1a6b5a', ACTIVITIES: '#2d8a72', SHOPPING: '#e8a03a', OTHER: '#888',
}
const CAT_EMOJI: Record<string, string> = {
  HOTEL: '🏨', FLIGHT: '✈️', TRANSPORT: '🚌', FOOD: '🍽️',
  ACTIVITIES: '🎭', SHOPPING: '🛍️', OTHER: '📌',
}
const RATES: Record<string, number> = { USD: 1, EUR: 0.925, GBP: 0.79, GEL: 2.68, JPY: 149.5 }

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', category: 'FOOD', date: '' })
  const [currency, setCurrency] = useState('USD')
  const [convertAmt, setConvertAmt] = useState('100')

  const { data: summary } = useBudgetSummary(tripId!)
  const { data: expenses = [] } = useExpenses(tripId!)
  const addExpense = useAddExpense(tripId!)
  const deleteExpense = useDeleteExpense(tripId!)

  const handleAdd = () => {
    if (!form.description || !form.amount) return
    addExpense.mutate(
      { ...form, amount: parseFloat(form.amount) },
      {
        onSuccess: () => { setShowModal(false); setForm({ description: '', amount: '', category: 'FOOD', date: '' }); toast.success('Expense added!') },
        onError: () => toast.error('Failed to add expense'),
      }
    )
  }

  const pieData = summary ? Object.entries(summary.byCategory).map(([name, value]) => ({ name, value, color: CAT_COLORS[name] })) : []
  const pct = summary ? Math.min(Math.round(summary.percentUsed), 100) : 0
  const convertedAmt = (parseFloat(convertAmt || '0') / RATES[currency]).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Budget Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Track your travel expenses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Add Expense</button>
      </div>

      {/* Overview */}
      <div className="rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #1a6b5a, #1a4d7a)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-white/70 text-sm mb-1">Total Budget</p>
            <p className="font-display text-4xl font-bold mb-1">${summary?.totalBudget?.toLocaleString() || 0}</p>
            <p className="text-white/70 text-sm mb-4">${summary?.totalSpent?.toLocaleString() || 0} spent · ${summary?.remaining?.toLocaleString() || 0} left</p>
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-white rounded-full" />
            </div>
            <p className="text-white/60 text-xs mt-1">{pct}% used</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Expenses', value: expenses.length },
              { label: 'Currency', value: summary?.currency || 'USD' },
              { label: 'Remaining', value: `$${summary?.remaining?.toLocaleString() || 0}` },
              { label: 'Used', value: `${pct}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
                <p className="text-white/60 text-xs mb-1">{label}</p>
                <p className="text-white font-bold text-lg">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card">
          <h3 className="font-semibold mb-4">By Category</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(0)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-600">{d.name} ${Number(d.value).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No expenses yet</div>
          )}
        </div>

        {/* Currency Converter */}
        <div className="card">
          <h3 className="font-semibold mb-4">Currency Converter</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="number" className="input flex-1" value={convertAmt} onChange={(e) => setConvertAmt(e.target.value)} />
              <select className="input w-24" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {Object.keys(RATES).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: '#fdf8f0' }}>
              <p className="text-xs text-gray-500 mb-1">= in USD</p>
              <p className="text-3xl font-bold text-brand-500">${convertedAmt}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(RATES).filter(([c]) => c !== 'USD').map(([c, r]) => (
                <div key={c} className="flex justify-between bg-gray-50 rounded-lg p-2 text-xs">
                  <span className="text-gray-500">{c}</span>
                  <span className="font-medium">{(parseFloat(convertAmt || '0') * r / RATES[currency]).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="card">
        <h3 className="font-semibold mb-4">Expenses ({expenses.length})</h3>
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No expenses yet</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp: any) => (
              <motion.div key={exp.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${CAT_COLORS[exp.category]}20` }}>
                  {CAT_EMOJI[exp.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{exp.description}</p>
                  <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()} · {exp.category} · {exp.paidBy?.name}</p>
                </div>
                <p className="font-bold text-red-500 flex-shrink-0">-${exp.amount.toFixed(2)}</p>
                <button onClick={() => deleteExpense.mutate(exp.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl font-bold">Add Expense</h2>
                <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div><label className="label">Description *</label><input className="input" placeholder="e.g. Dinner at restaurant" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Amount ($)</label><input type="number" className="input" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                  <div><label className="label">Category</label>
                    <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <button
                  style={{ width: '100%', padding: '12px', background: '#c17d3a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
                  disabled={!form.description || !form.amount || addExpense.isPending}
                  onClick={handleAdd}
                >
                  {addExpense.isPending ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
