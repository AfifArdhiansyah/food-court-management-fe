import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import { CreateOrderRequest, UpdateOrderStatusRequest, OrderStatus } from '@/types'

export function useOrders(kiosId?: number) {
  const queryClient = useQueryClient()

  // Get orders by kios
  const { data: orders, isLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['orders', kiosId],
    queryFn: async () => {
      if (kiosId) {
        const response = await apiService.getOrdersByKios(kiosId)
        return response.data || []
      }
      const response = await apiService.getAllOrders()
      return response.data || []
    },
    enabled: !!kiosId || kiosId === undefined,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  })

  // Get queue for kios
  const { data: queue, refetch: refetchQueue } = useQuery({
    queryKey: ['queue', kiosId],
    queryFn: async () => {
      if (!kiosId) return []
      const response = await apiService.getQueue(kiosId)
      return response.data || []
    },
    enabled: !!kiosId,
    refetchInterval: 3000, // Refresh every 3 seconds for queue
  })

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => apiService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['queue'] })
    },
  })

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderStatusRequest }) => 
      apiService.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['queue'] })
    },
  })

  const refetch = () => {
    refetchOrders()
    refetchQueue()
  }

  return {
    orders,
    queue,
    isLoading,
    refetch,
    createOrder: createOrderMutation.mutate,
    createOrderLoading: createOrderMutation.isPending,
    createOrderError: createOrderMutation.error,
    updateStatus: updateStatusMutation.mutate,
    updateStatusLoading: updateStatusMutation.isPending,
    updateStatusError: updateStatusMutation.error,
  }
}

export function useOrdersByStatus(status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', 'status', status],
    queryFn: async () => {
      const response = await apiService.getAllOrders({ status })
      return response.data || []
    },
    enabled: !!status,
    refetchInterval: 5000,
  })
}
