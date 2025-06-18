import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import { LoginRequest } from '@/types'
import { tokenUtils, userUtils, clearAuthData } from '@/lib/cookies'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)

  // Ensure we're on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  const isClient = typeof window !== 'undefined'

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = tokenUtils.get()

      if (!token) {
        return null
      }

      try {
        const response = await apiService.getMe()
        return response.data || null
      } catch (error) {
        clearAuthData()
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: mounted && isClient, // Only run after mounting on client-side
    retry: false, // Don't retry on failure
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => apiService.login(credentials),
    onSuccess: (data) => {
      // Token and user data are already stored in cookies by authService.login
      queryClient.setQueryData(['user'], data.user)

      // Redirect based on role
      if (data.user.role === 'cashier') {
        router.push('/dashboard/cashier')
      } else {
        router.push('/dashboard/kios')
      }
    },
  })

  // Logout function
  const logout = () => {
    clearAuthData()
    queryClient.setQueryData(['user'], null)
    queryClient.clear()
    // Don't auto-redirect, let the component handle it
  }



  // For SSR compatibility or before mounting, always show loading
  if (!isClient || !mounted) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: () => Promise.resolve(),
      loginLoading: false,
      loginError: null,
      logout: () => {},
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  }
}
