'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOrders } from '@/hooks/useOrders'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderCard } from '@/components/macros/OrderCard'
import { CreateOrderForm } from '@/components/macros/CreateOrderForm'
import { OrderStatus, PaymentMethod } from '@/types'
import { LogOut, Plus, ShoppingCart, Clock, CheckCircle } from 'lucide-react'

export default function KiosDashboard() {
  const { user, logout } = useAuth()
  const { orders, queue, updateStatus, refetch } = useOrders(user?.kios_id)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleOrderCreated = () => {
    setShowCreateForm(false)
    refetch() // Refresh data after creating order
  }

  const handleStatusUpdate = (orderId: number, status: OrderStatus, paymentMethod?: PaymentMethod) => {
    updateStatus({ id: orderId, data: { status, payment_method: paymentMethod } })
  }

  const paidOrders = orders?.filter(order => order.status === 'paid') || []
  const preparingOrders = orders?.filter(order => order.status === 'preparing') || []
  const readyOrders = orders?.filter(order => order.status === 'ready') || []
  const completedToday = orders?.filter(order => 
    order.status === 'completed' && 
    new Date(order.completed_at || '').toDateString() === new Date().toDateString()
  ) || []

  if (!user || !user.kios_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Anda harus terdaftar sebagai pemilik kios untuk mengakses halaman ini.</p>
          <Button onClick={logout}>Kembali ke Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Kios</h1>
              <p className="text-gray-600">
                {user.kios?.name} - {user.full_name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Pesanan Baru
              </Button>
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
              <CardTitle className="text-sm font-medium">Antrian Aktif</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queue?.length || 0}</div>
              <p className="text-xs text-muted-foreground">pesanan dalam antrian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedang Disiapkan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{preparingOrders.length}</div>
              <p className="text-xs text-muted-foreground">pesanan preparing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Siap Diambil</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readyOrders.length}</div>
              <p className="text-xs text-muted-foreground">pesanan siap</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai Hari Ini</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedToday.length}</div>
              <p className="text-xs text-muted-foreground">pesanan completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Queue Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Antrian Aktif</h2>
            <div className="space-y-4">
              {queue && queue.length > 0 ? (
                queue.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    showActions={true}
                    compact={false}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Tidak ada pesanan dalam antrian</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pesanan Terbaru</h2>
            <div className="space-y-4">
              {orders && orders.length > 0 ? (
                orders.slice(0, 5).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    showActions={order.status !== 'completed' && order.status !== 'cancelled'}
                    compact={true}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Belum ada pesanan</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateForm && (
        <CreateOrderForm
          kiosId={user.kios_id}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleOrderCreated}
        />
      )}
    </div>
  )
}
