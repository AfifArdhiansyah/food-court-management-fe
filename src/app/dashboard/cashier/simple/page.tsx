'use client'

import { useState, useEffect } from 'react'

export default function SimpleCashierDashboard() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Test API call
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No token found')
          setLoading(false)
          return
        }

        console.log('Fetching orders with token:', token)
        
        // Test health check first
        const healthResponse = await fetch('http://localhost:8080/health')
        const healthData = await healthResponse.json()
        console.log('Health check:', healthData)

        // Test get kios
        const kiosResponse = await fetch('http://localhost:8080/api/v1/kios/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!kiosResponse.ok) {
          throw new Error(`Kios API failed: ${kiosResponse.status}`)
        }
        
        const kiosData = await kiosResponse.json()
        console.log('Kios data:', kiosData)

        // Get orders from each kios
        const allOrders: any[] = []
        for (const kios of kiosData.data || []) {
          try {
            const orderResponse = await fetch(`http://localhost:8080/api/v1/kios/${kios.id}/orders`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (orderResponse.ok) {
              const orderData = await orderResponse.json()
              console.log(`Orders from kios ${kios.id}:`, orderData)
              allOrders.push(...(orderData.data || []))
            }
          } catch (err) {
            console.error(`Error fetching orders from kios ${kios.id}:`, err)
          }
        }

        setOrders(allOrders)
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Simple Cashier Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">User Info:</h2>
              <div className="bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Orders ({orders.length}):</h2>
              <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
                {orders.length > 0 ? (
                  <div className="space-y-2">
                    {orders.map((order, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium">{order.queue_number}</div>
                        <div className="text-sm text-gray-600">
                          {order.kios_name} - {order.status} - {order.total_amount}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customer_name || 'No customer name'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No orders found</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 space-x-4">
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Login
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/cashier'}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Try Full Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
