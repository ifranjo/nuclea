import type { Metadata, Viewport } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D12',
}

export const metadata: Metadata = {
  title: 'NUCLEA - Capsulas Digitales del Tiempo',
  description: 'Somos las historias que recordamos. Haz que las tuyas permanezcan.',
  keywords: ['capsulas digitales', 'legado digital', 'memorias', 'avatar IA', 'EverLife'],
  authors: [{ name: 'NUCLEA' }],
  openGraph: {
    title: 'NUCLEA - Capsulas Digitales del Tiempo',
    description: 'Preserva tus historias para siempre con tecnologia de IA',
    type: 'website',
    locale: 'es_ES',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body className="bg-animated font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#14141A',
              color: '#FAFAFA',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              fontFamily: 'var(--font-sans)',
            },
            success: {
              iconTheme: {
                primary: '#D4AF37',
                secondary: '#0D0D12',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
