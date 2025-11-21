'use client'

import { useState, useEffect } from 'react'
import AddLinkForm from '@/components/AddLinkForm'
import LinkTable from '@/components/LinkTable'

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const handleLinkAdded = () => {
    setRefreshTrigger(prev => prev + 1)
    setLastRefresh(new Date())
  }

  // Update last refresh time every minute for the auto-refresh indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      <div className="hero">
        <h1 className="hero-title">TinyLink Pro</h1>
        <p className="hero-subtitle">
          Transform long URLs into short, memorable links. Track performance with real-time analytics.
        </p>
        <div className="text-sm text-muted mt-4">
          📊 Real-time click tracking • 🔄 Auto-refreshes every 10 seconds
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddLinkForm onLinkAdded={handleLinkAdded} />
        </div>
        <div className="lg:col-span-2">
          <LinkTable refresh={refreshTrigger} />
        </div>
      </div>
    </div>
  )
}