'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Order, OrderStatus, PaymentMethod } from '@/types'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { Clock, User, MapPin, CreditCard } from 'lucide-react'

interface OrderCardProps {
  order: Order
  onStatusUpdate?: (orderId: number, status: OrderStatus, paymentMethod?: PaymentMethod) => void
  showActions?: boolean
  compact?: boolean
}

export function OrderCard({ order, onStatusUpdate, showActions = true, compact = false }: OrderCardProps) {
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending':
        return 'paid'
      case 'paid':
        return 'preparing'
      case 'preparing':
        return 'ready'
      case 'ready':
        return 'completed'
      default:
        return null
    }
  }

  const getActionText = (currentStatus: OrderStatus): string => {
    switch (currentStatus) {
      case 'pending':
        return 'Konfirmasi Pembayaran'
      case 'paid':
        return 'Mulai Siapkan'
      case 'preparing':
        return 'Tandai Siap'
      case 'ready':
        return 'Tandai Selesai'
      default:
        return ''
    }
  }

  const handleStatusUpdate = () => {
    const nextStatus = getNextStatus(order.status)
    if (nextStatus && onStatusUpdate) {
      if (nextStatus === 'paid') {
        // For payment confirmation, we might want to show payment method selection
        onStatusUpdate(order.id, nextStatus, 'cash') // Default to cash for now
      } else {
        onStatusUpdate(order.id, nextStatus)
      }
    }
  }

  if (compact) {
    return (
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-lg font-bold text-blue-600">
                {order.queue_number}
              </div>
              <div>
                <div className="font-medium">{order.customer_name || 'Customer'}</div>
                <div className="text-sm text-gray-500">{formatCurrency(order.total_amount)}</div>
              </div>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">{order.queue_number}</span>
            <span>{order.customer_name || 'Customer'}</span>
          </CardTitle>
          <Badge className={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{order.kios_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{formatDate(order.created_at)}</span>
          </div>
          {order.payment_method && (
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="capitalize">{order.payment_method}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>{order.creator_name}</span>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Items:</h4>
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.menu_name}</span>
              <span>{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          {order.notes && (
            <div className="text-sm text-gray-600 italic">
              Note: {order.notes}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t pt-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* Actions */}
        {showActions && getNextStatus(order.status) && (
          <div className="flex space-x-2">
            <Button 
              onClick={handleStatusUpdate}
              className="flex-1"
              variant={order.status === 'pending' ? 'default' : 'outline'}
            >
              {getActionText(order.status)}
            </Button>
            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onStatusUpdate?.(order.id, 'cancelled')}
              >
                Batal
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
