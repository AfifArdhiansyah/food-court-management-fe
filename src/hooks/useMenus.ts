import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import { CreateMenuRequest, MenuCategory } from '@/types'

export function useMenus(kiosId?: number, filters?: { category?: MenuCategory; available?: boolean }) {
  const queryClient = useQueryClient()

  // Get menus by kios
  const { data: menus, isLoading } = useQuery({
    queryKey: ['menus', kiosId, filters],
    queryFn: async () => {
      if (!kiosId) return []
      const response = await apiService.getMenusByKios(kiosId, filters)
      return response.data || []
    },
    enabled: !!kiosId,
  })

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: (data: CreateMenuRequest) => {
      if (!kiosId) throw new Error('Kios ID is required')
      return apiService.createMenu(kiosId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateMenuRequest> }) => 
      apiService.updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteMenu(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })

  return {
    menus,
    isLoading,
    createMenu: createMenuMutation.mutate,
    createMenuLoading: createMenuMutation.isPending,
    createMenuError: createMenuMutation.error,
    updateMenu: updateMenuMutation.mutate,
    updateMenuLoading: updateMenuMutation.isPending,
    updateMenuError: updateMenuMutation.error,
    deleteMenu: deleteMenuMutation.mutate,
    deleteMenuLoading: deleteMenuMutation.isPending,
    deleteMenuError: deleteMenuMutation.error,
  }
}
