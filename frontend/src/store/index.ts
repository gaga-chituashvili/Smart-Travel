import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/axios'
import type { User, Trip } from '../types'

// ===== AUTH STORE =====
interface AuthStore {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({ user: data.user, accessToken: data.accessToken })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        } finally {
          set({ isLoading: false })
        }
      },
      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { name, email, password })
          set({ user: data.user, accessToken: data.accessToken })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        } finally {
          set({ isLoading: false })
        }
      },
      logout: async () => {
        await api.post('/auth/logout')
        set({ user: null, accessToken: null })
        delete api.defaults.headers.common['Authorization']
      },
      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data })
        } catch {
          set({ user: null, accessToken: null })
        }
      },
    }),
    {
      name: 'staybook-auth',
      partialize: (s) => ({ accessToken: s.accessToken }),
    }
  )
)

// ===== UI STORE =====
interface UIStore {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  toggleTheme: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { theme: next }
        }),
    }),
    { name: 'staybook-ui' }
  )
)

// ===== TRIP STORE =====
interface TripStore {
  activeTrip: Trip | null
  setActiveTrip: (trip: Trip | null) => void
  updateActivity: (dayId: string, activityId: string, data: any) => void
  reorderActivities: (dayId: string, orderedIds: string[]) => void
}

export const useTripStore = create<TripStore>((set) => ({
  activeTrip: null,
  setActiveTrip: (trip) => set({ activeTrip: trip }),
  updateActivity: (dayId, activityId, data) =>
    set((s) => ({
      activeTrip: s.activeTrip
        ? {
            ...s.activeTrip,
            days: s.activeTrip.days.map((d) =>
              d.id === dayId
                ? { ...d, activities: d.activities.map((a) => (a.id === activityId ? { ...a, ...data } : a)) }
                : d
            ),
          }
        : null,
    })),
  reorderActivities: (dayId, orderedIds) =>
    set((s) => ({
      activeTrip: s.activeTrip
        ? {
            ...s.activeTrip,
            days: s.activeTrip.days.map((d) => {
              if (d.id !== dayId) return d
              const map = new Map(d.activities.map((a) => [a.id, a]))
              return { ...d, activities: orderedIds.map((id, i) => ({ ...map.get(id)!, order: i })) }
            }),
          }
        : null,
    })),
}))
