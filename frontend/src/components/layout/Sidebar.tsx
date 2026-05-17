import { NavLink } from 'react-router-dom'
import { Home, Map, Calendar, Wallet, Building, Users, Heart, User } from 'lucide-react'
import { useUIStore } from '../../store'
import { motion } from 'framer-motion'

const links = [
  { to: '/', icon: Home, label: 'Discover', end: true },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/trips', icon: Calendar, label: 'My Trips' },
  { to: '/saved', icon: Heart, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 224 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col py-4 overflow-hidden z-40"
    >
      <div className="flex flex-col gap-1 px-2">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium whitespace-nowrap overflow-hidden ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-500 border border-brand-100 dark:border-brand-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </div>
    </motion.aside>
  )
}
