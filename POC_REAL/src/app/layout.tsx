import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
}

export const metadata: Metadata = {
  title: {
    default: 'NUCLEA — Tu legado digital',
    template: '%s | NUCLEA',
  },
  description: 'Crea cápsulas de memoria para preservar tu legado emocional.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'NUCLEA — Tu legado digital',
    description: 'Crea cápsulas de memoria para preservar tu legado emocional.',
    siteName: 'NUCLEA',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased bg-white text-nuclea-text">
        {children}
      </body>
    </html>
  )
}
