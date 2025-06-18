'use client'

import { useState, useEffect } from 'react'

export default function TestClientPage() {
  const [mounted, setMounted] = useState(false)
  const [windowExists, setWindowExists] = useState(false)

  useEffect(() => {
    console.log('useEffect running...')
    setMounted(true)
    setWindowExists(typeof window !== 'undefined')
  }, [])

  console.log('TestClientPage render:', {
    mounted,
    windowExists,
    typeofWindow: typeof window,
    isClient: typeof window !== 'undefined'
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Client-Side Test</h1>
      <div className="space-y-2">
        <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
        <p>Window exists: {windowExists ? 'Yes' : 'No'}</p>
        <p>typeof window: {typeof window}</p>
        <p>Is Client: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}
