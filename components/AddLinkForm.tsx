'use client'

import { useState } from 'react'

interface AddLinkFormProps {
  onLinkAdded: () => void
}

export default function AddLinkForm({ onLinkAdded }: AddLinkFormProps) {
  const [targetUrl, setTargetUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_url: targetUrl,
          code: customCode || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link')
      }

      setSuccess(`Link created successfully! Your short URL is: ${window.location.origin}/${data.code}`)
      setTargetUrl('')
      setCustomCode('')
      onLinkAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2 className="form-title">Create New Short Link</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="targetUrl" className="form-label">
            Destination URL *
          </label>
          <input
            type="url"
            id="targetUrl"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="customCode" className="form-label">
            Custom Code (optional)
          </label>
          <input
            type="text"
            id="customCode"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="my-link"
            pattern="[A-Za-z0-9]{6,8}"
            title="6-8 alphanumeric characters"
            className="form-input"
            disabled={loading}
          />
          <p className="form-help">
            6-8 alphanumeric characters. Leave empty for auto-generation.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-full"
        >
          {loading ? 'Creating...' : 'Create Short Link'}
        </button>
      </form>
    </div>
  )
}