import axios from 'axios'
import { useAuthStore } from '../store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        return api.request(err.config)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
