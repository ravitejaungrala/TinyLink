'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/lib/utils'

interface StatsCardProps {
  code: string
}

export default function StatsCard({ code }: StatsCardProps) {
  const [link, setLink] = useState<Link | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLink()
  }, [code])

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/links/${code}`)
      if (!response.ok) throw new Error('Failed to fetch link stats')
      const data = await response.json()
      setLink(data)
    } catch (err) {
      setError('Link not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="form-container">
        <div className="pulse space-y-6">
          <div className="loading-pulse" style={{ height: '2rem', width: '200px' }}></div>
          <div className="stats-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="loading-pulse" style={{ height: '120px', borderRadius: '0.75rem' }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !link) {
    return (
      <div className="form-container">
        <div className="text-center py-12">
          <div className="empty-icon">❌</div>
          <h2 className="empty-title">Link Not Found</h2>
          <p className="empty-description mb-6">The short code "{code}" doesn't exist or has been deleted.</p>
          <a href="/" className="btn btn-primary">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${link.code}`

  return (
    <div className="form-container">
      <h2 className="text-3xl font-bold mb-2">Analytics for {link.code}</h2>
      <p className="text-secondary mb-8">Track your short link performance and engagement metrics</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{link.clicks}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number" style={{ fontSize: '1.75rem' }}>{link.code}</div>
          <div className="stat-label">Short Code</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number" style={{ fontSize: '1.25rem' }}>
            {new Date(link.created_at).toLocaleDateString()}
          </div>
          <div className="stat-label">Created Date</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number" style={{ fontSize: '1.25rem' }}>
            {link.last_clicked ? new Date(link.last_clicked).toLocaleDateString() : 'Never'}
          </div>
          <div className="stat-label">Last Clicked</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="form-label">Short URL</h3>
          <div className="url-display-container">
            <code className="url-display url-display-code">
              {shortUrl}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(shortUrl)}
              className="btn btn-secondary"
            >
              📋 Copy
            </button>
          </div>
        </div>

        <div>
          <h3 className="form-label">Destination URL</h3>
          <div className="url-display">
            {link.target_url}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={`/${link.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          🔗 Test Redirect
        </a>
        <a
          href="/"
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  )
}