import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contacto - NUCLEA',
  description: 'Canales de contacto para soporte, privacidad y consultas legales.',
}

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-nuclea-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-nuclea-gold hover:underline text-sm mb-8 inline-block">
          &larr; Volver al inicio
        </Link>

        <h1 className="font-display text-4xl text-white font-semibold mb-2">Contacto</h1>
        <p className="text-white/40 text-sm mb-10">
          Equipo NUCLEA &middot; Atencion en horario laboral (CET)
        </p>

        <div className="space-y-5 text-white/70 text-base leading-relaxed">
          <p>
            <strong className="text-white/90">Soporte general:</strong>{' '}
            <span className="text-nuclea-gold">soporte@nuclea.app</span>
          </p>
          <p>
            <strong className="text-white/90">Privacidad y derechos RGPD:</strong>{' '}
            <span className="text-nuclea-gold">privacidad@nuclea.app</span>
          </p>
          <p>
            <strong className="text-white/90">Asuntos legales:</strong>{' '}
            <span className="text-nuclea-gold">legal@nuclea.app</span>
          </p>
        </div>
      </div>
    </main>
  )
}

