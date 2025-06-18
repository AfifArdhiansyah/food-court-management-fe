'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

interface ClientOnlyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

function ClientOnlyWrapperComponent({ children, fallback }: ClientOnlyWrapperProps) {
  return <>{children}</>
}

const ClientOnlyWrapper = dynamic(() => Promise.resolve(ClientOnlyWrapperComponent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  ),
})

export default ClientOnlyWrapper
