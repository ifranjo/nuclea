import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Consentimiento IA - NUCLEA',
  description: 'Consentimiento explicito para el tratamiento de datos biometricos en Avatar IA.',
}

export default function ConsentimientoPage() {
  return (
    <main className="min-h-screen bg-nuclea-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-nuclea-gold hover:underline text-sm mb-8 inline-block">
          &larr; Volver al inicio
        </Link>

        <h1 className="font-display text-4xl text-white font-semibold mb-2">
          Consentimiento para Avatar IA
        </h1>
        <p className="text-white/40 text-sm mb-10">
          Ultima actualizacion: febrero 2026 &middot; Version 1.0
        </p>

        <div className="space-y-6 text-white/70 text-[15px] leading-relaxed">
          <p>
            El servicio Avatar IA de NUCLEA requiere el tratamiento de datos biometricos
            (voz e imagen facial). Este tratamiento se realiza unicamente con consentimiento
            explicito, especifico e informado, conforme al Art. 9 del RGPD.
          </p>
          <p>
            Puedes retirar tu consentimiento en cualquier momento escribiendo a{' '}
            <span className="text-nuclea-gold">privacidad@nuclea.app</span>. La retirada no
            afecta a la licitud del tratamiento previo, pero implica la desactivacion inmediata
            del Avatar IA y el inicio del proceso de eliminacion de datos asociados.
          </p>
          <p>
            Para activar Avatar IA, debes aceptar por separado esta base legal y firmar el
            consentimiento correspondiente en el flujo de configuracion premium.
          </p>
        </div>
      </div>
    </main>
  )
}
