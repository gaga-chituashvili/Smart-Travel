import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/axios'

export const useBudgetSummary = (tripId: string) =>
  useQuery({
    queryKey: ['budget-summary', tripId],
    queryFn: () => api.get(`/trips/${tripId}/budget/summary`).then((r) => r.data),
    enabled: !!tripId,
  })

export const useExpenses = (tripId: string) =>
  useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => api.get(`/trips/${tripId}/budget/expenses`).then((r) => r.data),
    enabled: !!tripId,
  })

export const useAddExpense = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post(`/trips/${tripId}/budget/expenses`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', tripId] })
      qc.invalidateQueries({ queryKey: ['budget-summary', tripId] })
    },
  })
}

export const useDeleteExpense = (tripId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (expId: string) => api.delete(`/trips/${tripId}/budget/expenses/${expId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', tripId] })
      qc.invalidateQueries({ queryKey: ['budget-summary', tripId] })
    },
  })
}
