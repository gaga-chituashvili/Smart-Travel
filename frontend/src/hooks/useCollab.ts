import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'

export const useComments = (tripId: string) =>
  useQuery({
    queryKey: ['comments', tripId],
    queryFn: () => api.get(`/trips/${tripId}/collab/comments`).then((r) => r.data),
    enabled: !!tripId,
  })

export const useMembers = (tripId: string) =>
  useQuery({
    queryKey: ['members', tripId],
    queryFn: () => api.get(`/trips/${tripId}/collab/members`).then((r) => r.data),
    enabled: !!tripId,
  })

export const usePostComment = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (text: string) =>
      api.post(`/trips/${tripId}/collab/comments`, { text }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', tripId] }),
  })
}

export const useReactToComment = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      api.post(`/trips/${tripId}/collab/comments/${commentId}/react`, { emoji }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', tripId] }),
  })
}

export const useInviteMember = (tripId: string) =>
  useMutation({
    mutationFn: (email: string) =>
      api.post(`/trips/${tripId}/invite`, { email }).then((r) => r.data),
  })
