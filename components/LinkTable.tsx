'use client'

import { useState, useEffect, useCallback } from 'react'
import { Link } from '@/lib/utils'

interface LinkTableProps {
  refresh: number
}

export default function LinkTable({ refresh }: LinkTableProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())

  // Auto-refresh every 10 seconds to get updated click counts
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/links')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to fetch links')
      }
      
      const data = await response.json()
      setLinks(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load links'
      setError(errorMessage)
      console.error('Error fetching links:', err)
      
      // Clear links on error
      setLinks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks, refresh, lastUpdate])

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete link')
      }
      
      setLinks(links.filter(link => link.code !== code))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete link')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredLinks = links.filter(link =>
    link.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.target_url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)

  if (loading) {
    return (
      <div className="table-container">
        <div className="pulse" style={{ padding: '2rem' }}>
          <div className="loading-pulse" style={{ height: '1.5rem', width: '200px', marginBottom: '1.5rem' }}></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-pulse" style={{ height: '3rem', borderRadius: '0.5rem' }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="flex items-center justify-between w-full">
          <h2 className="table-title">
            <span>📊</span>
            Your Links
            {links.length > 0 && (
              <>
                <span className="click-badge" style={{ marginLeft: '0.5rem' }}>
                  {links.length} links
                </span>
                <span className="click-badge" style={{ 
                  marginLeft: '0.5rem', 
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  color: '#92400e',
                  borderColor: '#fde68a'
                }}>
                  {totalClicks} total clicks
                </span>
              </>
            )}
          </h2>
          <div className="flex items-center gap-4">
            {links.length > 0 && (
              <div className="text-xs text-muted">
                Auto-refreshes every 10s
              </div>
            )}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by code or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={!!error}
              />
              <button
                onClick={fetchLinks}
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? '🔄' : '🔃'} Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ margin: '1.5rem' }}>
          <div className="font-semibold">Database Connection Error</div>
          <div>{error}</div>
          <div className="text-xs mt-2">
            Please check your DATABASE_URL environment variable and ensure your Neon database is active.
          </div>
          <button 
            onClick={fetchLinks}
            className="btn btn-sm btn-secondary mt-2"
          >
            Try Again
          </button>
        </div>
      )}

      {!error && filteredLinks.length === 0 && (
        <div className="empty-state">
          {links.length === 0 ? (
            <div>
              <div className="empty-icon">🔗</div>
              <p className="empty-title">No links created yet</p>
              <p className="empty-description">Create your first short link to get started!</p>
            </div>
          ) : (
            <div>
              <div className="empty-icon">🔍</div>
              <p className="empty-title">No links found</p>
              <p className="empty-description">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}

      {!error && filteredLinks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Short Code</th>
                <th>Target URL</th>
                <th>Clicks</th>
                <th>Last Clicked</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link) => (
                <tr key={link.id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <span className="code-badge">
                        {link.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/${link.code}`)}
                        className="btn btn-sm btn-secondary"
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                  <td>
                    <div 
                      className="max-w-xs whitespace-nowrap overflow-hidden text-ellipsis cursor-help" 
                      title={link.target_url}
                    >
                      {link.target_url}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="click-badge">
                        {link.clicks}
                      </span>
                      {link.clicks > 0 && (
                        <span className="text-xs text-muted">
                          clicks
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-sm text-muted whitespace-nowrap">
                    {link.last_clicked ? (
                      <div>
                        <div>{new Date(link.last_clicked).toLocaleDateString()}</div>
                        <div className="text-xs">{new Date(link.last_clicked).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="text-sm text-muted whitespace-nowrap">
                    {new Date(link.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <a
                        href={`/code/${link.code}`}
                        className="btn btn-sm btn-secondary"
                      >
                        📈 Stats
                      </a>
                      <a
                        href={`/${link.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                      >
                        🔗 Test
                      </a>
                      <button
                        onClick={() => handleDelete(link.code)}
                        className="btn btn-sm btn-danger"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}