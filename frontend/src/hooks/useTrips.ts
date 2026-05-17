import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'

export const useTrips = () =>
  useQuery({ queryKey: ['trips'], queryFn: () => api.get('/trips').then((r) => r.data) })

export const useTrip = (id: string) =>
  useQuery({ queryKey: ['trip', id], queryFn: () => api.get(`/trips/${id}`).then((r) => r.data), enabled: !!id })

export const useCreateTrip = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/trips', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export const useDeleteTrip = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/trips/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export const useAddDay = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post(`/trips/${tripId}/days`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  })
}

export const useAddActivity = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ dayId, data }: { dayId: string; data: any }) =>
      api.post(`/trips/${tripId}/days/${dayId}/activities`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  })
}

export const useDeleteActivity = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ dayId, actId }: { dayId: string; actId: string }) =>
      api.delete(`/trips/${tripId}/days/${dayId}/activities/${actId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  })
}

export const useReorderActivities = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ dayId, orderedIds }: { dayId: string; orderedIds: string[] }) =>
      api.post(`/trips/${tripId}/days/${dayId}/reorder`, { orderedIds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  })
}
