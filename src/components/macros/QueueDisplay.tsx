'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Order } from '@/types'
import { getStatusColor, getStatusText } from '@/lib/utils'
import { Clock, Users } from 'lucide-react'

interface QueueDisplayProps {
  queue: Order[]
  kiosName: string
  currentServing?: string
}

export function QueueDisplay({ queue, kiosName, currentServing }: QueueDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const preparingOrders = queue.filter(order => order.status === 'preparing')
  const readyOrders = queue.filter(order => order.status === 'ready')
  const waitingOrders = queue.filter(order => order.status === 'paid')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{kiosName}</h1>
        <div className="flex items-center justify-center space-x-4 text-lg text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>{currentTime.toLocaleTimeString('id-ID')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{queue.length} pesanan dalam antrian</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Serving */}
        <Card className="lg:col-span-3">
          <CardHeader className="text-center bg-green-500 text-white">
            <CardTitle className="text-2xl">Sedang Dilayani</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {currentServing ? (
              <div className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-2">
                  {currentServing}
                </div>
                <div className="text-xl text-gray-600">
                  Silakan ambil pesanan Anda
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 text-xl">
                Tidak ada pesanan yang sedang dilayani
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ready Orders */}
        <Card>
          <CardHeader className="bg-green-100 text-green-800">
            <CardTitle className="flex items-center justify-between">
              <span>Siap Diambil</span>
              <Badge variant="secondary">{readyOrders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            {readyOrders.length > 0 ? (
              <div className="space-y-2">
                {readyOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="text-2xl font-bold text-green-600">
                      {order.queue_number}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.customer_name || 'Customer'}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Tidak ada pesanan yang siap
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preparing Orders */}
        <Card>
          <CardHeader className="bg-orange-100 text-orange-800">
            <CardTitle className="flex items-center justify-between">
              <span>Sedang Disiapkan</span>
              <Badge variant="secondary">{preparingOrders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            {preparingOrders.length > 0 ? (
              <div className="space-y-2">
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="text-2xl font-bold text-orange-600">
                      {order.queue_number}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.customer_name || 'Customer'}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Tidak ada pesanan yang sedang disiapkan
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waiting Orders */}
        <Card>
          <CardHeader className="bg-blue-100 text-blue-800">
            <CardTitle className="flex items-center justify-between">
              <span>Menunggu Antrian</span>
              <Badge variant="secondary">{waitingOrders.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 max-h-96 overflow-y-auto">
            {waitingOrders.length > 0 ? (
              <div className="space-y-2">
                {waitingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {order.queue_number}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.customer_name || 'Customer'}</div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Tidak ada pesanan dalam antrian
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
