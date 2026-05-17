import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useUIStore } from '../../store'

export default function Layout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 min-h-[calc(100vh-64px)] ${
            sidebarCollapsed ? 'ml-16' : 'ml-56'
          }`}
        >
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
