'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ConsentimientoError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[consentimiento-error]', error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#0D0D12] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h1 className="text-xl font-medium text-white mb-3">Error en consentimiento</h1>
        <p className="text-sm text-white/60 mb-6">
          No se pudo cargar la página de consentimiento. Puedes reintentar.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-all"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-transparent border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
