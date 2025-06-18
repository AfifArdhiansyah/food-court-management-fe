'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { apiService } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderCard } from '@/components/macros/OrderCard'
import { formatCurrency, getStatusColor, getStatusText } from '@/lib/utils'
import { OrderStatus, PaymentMethod } from '@/types'
import { LogOut, Users, ShoppingCart, Clock, DollarSign, Store } from 'lucide-react'
import Link from 'next/link'

export default function CashierDashboardClient() {
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth()
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')



  // Fetch all orders for cashier (from all kios)
  const { data: orders, refetch, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      console.log('Fetching all orders...')
      try {
        // Get all kios first
        const kiosResponse = await apiService.getKios()
        const allKios = kiosResponse.data || []
        console.log('Found kios:', allKios.length)

        // Get orders from all kios
        const orderPromises = allKios.map(kios =>
          apiService.getOrdersByKios(kios.id).then(response => {
            console.log(`Orders from kios ${kios.id}:`, response.data?.length || 0)
            return response.data || []
          })
        )

        const allOrdersArrays = await Promise.all(orderPromises)
        const allOrders = allOrdersArrays.flat().sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        console.log('Total orders:', allOrders.length)
        return allOrders
      } catch (error) {
        console.error('Error fetching orders:', error)
        throw error
      }
    },
    enabled: !!user, // Only fetch when user is authenticated
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const handleStatusUpdate = async (orderId: number, status: OrderStatus, paymentMethod?: PaymentMethod) => {
    try {
      await apiService.updateOrderStatus(orderId, { status, payment_method: paymentMethod })
      refetch() // Refresh orders after update
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  // Always show loading on server-side or when auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated after loading is complete, clear auth and redirect
  if (!isAuthenticated) {
    // Clear any stale auth data
    logout()

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Expired</h1>
          <p className="text-gray-600 mb-4">Please login again to access this page.</p>
          <button
            onClick={() => {
              // Force clear auth data and redirect
              logout()
              window.location.href = '/login'
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Kasir</h1>
                <p className="text-gray-600">Selamat datang, {user.full_name}</p>
              </div>
              <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  if (ordersError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Kasir</h1>
                <p className="text-gray-600">Selamat datang, {user.full_name}</p>
              </div>
              <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Orders</h2>
            <p className="text-gray-600 mb-4">{ordersError.message}</p>
            <button onClick={() => refetch()} className="bg-blue-600 text-white px-4 py-2 rounded">
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredOrders = orders?.filter(order => 
    selectedStatus === 'all' || order.status === selectedStatus
  ) || []

  const pendingOrders = orders?.filter(order => order.status === 'pending') || []
  const paidOrders = orders?.filter(order => order.status === 'paid') || []
  const preparingOrders = orders?.filter(order => order.status === 'preparing') || []
  const readyOrders = orders?.filter(order => order.status === 'ready') || []

  const totalRevenue = orders?.filter(order => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total_amount, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Kasir</h1>
              <p className="text-gray-600">Selamat datang, {user.full_name}</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard/cashier/kios">
                <Button variant="outline">
                  <Store className="h-4 w-4 mr-2" />
                  Kelola Kios
                </Button>
              </Link>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Pembayaran</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground">pesanan pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sudah Dibayar</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paidOrders.length}</div>
              <p className="text-xs text-muted-foreground">pesanan dibayar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedang Disiapkan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{preparingOrders.length + readyOrders.length}</div>
              <p className="text-xs text-muted-foreground">pesanan aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">hari ini</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('all')}
          >
            Semua ({orders?.length || 0})
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('pending')}
          >
            Pending ({pendingOrders.length})
          </Button>
          <Button
            variant={selectedStatus === 'paid' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('paid')}
          >
            Dibayar ({paidOrders.length})
          </Button>
          <Button
            variant={selectedStatus === 'preparing' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('preparing')}
          >
            Disiapkan ({preparingOrders.length})
          </Button>
          <Button
            variant={selectedStatus === 'ready' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('ready')}
          >
            Siap ({readyOrders.length})
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                showActions={user.role === 'cashier'}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Tidak ada pesanan untuk ditampilkan</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
