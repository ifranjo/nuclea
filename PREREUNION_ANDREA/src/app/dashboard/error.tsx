'use client'

import { useEffect } from 'react'
import Header from '@/components/Header'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error boundary:', error)
  }, [error])

  return (
    <main className="min-h-screen pb-20">
      <Header />
      <div className="pt-28 px-4 max-w-3xl mx-auto">
        <div className="card text-center">
          <h1 className="font-display text-2xl gradient-text mb-3">Error en dashboard</h1>
          <p className="text-white/60 mb-6">No se pudo cargar tu informacion en este momento.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => reset()} className="btn-primary">Reintentar</button>
            <button onClick={() => window.location.assign('/')} className="btn-secondary">Ir al inicio</button>
          </div>
        </div>
      </div>
    </main>
  )
}