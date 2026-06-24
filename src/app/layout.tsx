import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SCC Basquet Formativo',
  description: 'Sistema de gestión administrativa del Basquet Formativo del Sport Club Cañadense',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SCC Basquet' },
}

export const viewport: Viewport = {
  themeColor: '#0c2337',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-main min-h-screen">{children}</body>
    </html>
  )
}
