'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { QueueDisplay } from '@/components/macros/QueueDisplay'
import { apiService } from '@/services/api'

export default function MonitorPage() {
  const params = useParams()
  const kiosId = parseInt(params.kiosId as string)
  const [currentServing, setCurrentServing] = useState<string>('')

  // Fetch kios info
  const { data: kios } = useQuery({
    queryKey: ['kios', kiosId],
    queryFn: async () => {
      const response = await apiService.getKiosById(kiosId)
      return response.data
    },
    enabled: !!kiosId,
  })

  // Fetch queue with real-time updates
  const { data: queue } = useQuery({
    queryKey: ['queue', kiosId],
    queryFn: async () => {
      const response = await apiService.getQueue(kiosId)
      return response.data || []
    },
    enabled: !!kiosId,
    refetchInterval: 2000, // Refresh every 2 seconds
  })

  // Auto-update current serving based on ready orders
  useEffect(() => {
    const readyOrders = queue?.filter(order => order.status === 'ready') || []
    if (readyOrders.length > 0) {
      // Show the oldest ready order
      const oldestReady = readyOrders.sort((a, b) => 
        new Date(a.ready_at || '').getTime() - new Date(b.ready_at || '').getTime()
      )[0]
      setCurrentServing(oldestReady.queue_number)
    } else {
      setCurrentServing('')
    }
  }, [queue])

  if (!kiosId || isNaN(kiosId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Kios ID</h1>
          <p className="text-gray-600">Please provide a valid kios ID in the URL.</p>
        </div>
      </div>
    )
  }

  if (!kios) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-gray-600">Loading kios information...</p>
        </div>
      </div>
    )
  }

  return (
    <QueueDisplay
      queue={queue || []}
      kiosName={kios.name}
      currentServing={currentServing}
    />
  )
}
