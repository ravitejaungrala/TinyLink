import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
        <Header />
        <main className="main">
          <div className="container">
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  )
}