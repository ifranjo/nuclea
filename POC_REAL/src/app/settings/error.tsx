'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SettingsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[settings-error]', error)
  }, [error])

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-xl border border-nuclea-border bg-white p-6 text-center space-y-4">
        <h1 className="text-lg font-medium text-nuclea-text">Error en ajustes</h1>
        <p className="text-sm text-nuclea-text-muted">
          Ocurrió un error inesperado. Puedes reintentar o volver al dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
          >
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg border border-nuclea-border text-sm text-nuclea-text hover:bg-nuclea-secondary"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
