import './globals.css'

export const metadata = {
  title: 'TinyLink - URL Shortener',
  description: 'Shorten your URLs with TinyLink',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="header">
          <div className="header-content">
            <a href="/" className="logo">
              <span>🔗</span>
              <span>TinyLink</span>
            </a>
            <div className="text-sm text-gray-500">
              URL Shortener
            </div>
          </div>
        </div>
        
        <main className="main">
          <div className="container">
            {children}
          </div>
        </main>
        
        <div className="footer">
          <div className="footer-content">
            <p className="footer-text">
              TinyLink - URL Shortener Service | Built with Next.js & Neon PostgreSQL
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}