'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface OnboardingErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function OnboardingError({ error, reset }: OnboardingErrorProps) {
  useEffect(() => {
    console.error('[onboarding-error]', error)
  }, [error])

  return (
    <main className="min-h-[100dvh] bg-nuclea-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-nuclea-border bg-white p-6 shadow-[0_20px_40px_rgba(15,15,20,0.08)]">
        <h1 className="font-display text-3xl text-nuclea-text mb-3">Se interrumpio la animacion</h1>
        <p className="text-nuclea-text-secondary text-sm leading-relaxed mb-6">
          Ocurrio un error durante el flujo de onboarding. Puedes reintentar el paso actual o volver al inicio.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-full bg-nuclea-text text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
          <Link
            href="/onboarding?step=1"
            className="px-4 py-2 rounded-full border border-nuclea-border text-sm text-nuclea-text-secondary hover:text-nuclea-text transition-colors"
          >
            Volver al paso 1
          </Link>
        </div>
      </div>
    </main>
  )
}
