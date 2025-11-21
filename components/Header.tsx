'use client'

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="flex items-center">
          <a href="/" className="logo">
            <span className="logo-icon">🔗</span>
            <span>TinyLink</span>
          </a>
          <nav className="nav">
            <a href="/" className="nav-link active">
              Dashboard
            </a>
          </nav>
        </div>
        <div className="text-sm text-muted">
          Professional URL Shortener
        </div>
      </div>
    </header>
  )
}