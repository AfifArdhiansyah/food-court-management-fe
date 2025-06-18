import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import { CreateKiosRequest } from '@/types'

export function useKios() {
  const queryClient = useQueryClient()

  // Get all kios
  const { data: kios, isLoading } = useQuery({
    queryKey: ['kios'],
    queryFn: async () => {
      const response = await apiService.getKios()
      return response.data || []
    },
  })

  // Create kios mutation
  const createKiosMutation = useMutation({
    mutationFn: (data: CreateKiosRequest) => apiService.createKios(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kios'] })
    },
  })

  return {
    kios,
    isLoading,
    createKios: createKiosMutation.mutate,
    createKiosLoading: createKiosMutation.isPending,
    createKiosError: createKiosMutation.error,
  }
}

export function useKiosById(id: number) {
  return useQuery({
    queryKey: ['kios', id],
    queryFn: async () => {
      const response = await apiService.getKiosById(id)
      return response.data
    },
    enabled: !!id,
  })
}
