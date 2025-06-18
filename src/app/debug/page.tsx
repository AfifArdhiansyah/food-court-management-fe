'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { tokenUtils, isAuthenticated, getCurrentUser, clearAuthData } from '@/lib/cookies'
// import { apiService } from '@/services/api'

export default function DebugPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [apiTest, setApiTest] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API connection...')
        const response = await fetch('http://localhost:8080/health')
        const data = await response.json()
        console.log('Health check:', data)
        setApiTest(data)
      } catch (err: unknown) {
        console.error('API test failed:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    testAPI()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Status:</h2>
          <p>Loading: {authLoading ? 'Yes' : 'No'}</p>
          <p>User: {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-bold mb-2">Cookie Auth Status:</h2>
          <p>Is Authenticated: {isAuthenticated() ? 'Yes' : 'No'}</p>
          <p>Token: {tokenUtils.get() ? 'Present' : 'Not found'}</p>
          <p>Current User: {getCurrentUser() ? JSON.stringify(getCurrentUser(), null, 2) : 'Not found'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">API Test:</h2>
          <p>Health Check: {apiTest ? JSON.stringify(apiTest, null, 2) : 'Loading...'}</p>
          {error && <p className="text-red-600">Error: {error}</p>}
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Environment:</h2>
          <p>API Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</p>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
        </div>

        <div className="space-x-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/cashier'}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Go to Cashier Dashboard
          </button>
          <button
            onClick={() => {
              clearAuthData()
              window.location.reload()
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Clear Auth Data
          </button>
        </div>
      </div>
    </div>
  )
}
