import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, Plus, Sun, Moon, LogOut, User } from 'lucide-react'
import { useAuthStore, useUIStore } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toggleSidebar, toggleTheme, theme } = useUIStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState('')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-4">
      <button onClick={toggleSidebar} className="btn-ghost p-2">
        <Menu size={20} />
      </button>

      <span
        className="font-display text-xl font-bold text-brand-500 cursor-pointer hidden sm:block"
        onClick={() => navigate('/')}
      >
        Stay<span className="text-gray-900 dark:text-white">Book</span>
      </span>

      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search destinations, trips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 py-2 text-sm rounded-full bg-gray-50 dark:bg-gray-800 border-gray-200"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={toggleTheme} className="btn-ghost p-2">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="btn-ghost p-2 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <button
          onClick={() => navigate('/trips')}
          className="btn-primary hidden sm:flex"
        >
          <Plus size={16} /> New Trip
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.name?.slice(0, 2).toUpperCase()
            )}
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <User size={15} /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
