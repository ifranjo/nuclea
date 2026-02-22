'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const TIMEOUT_MS = 15_000
const REDIRECT_DELAY_MS = 3_000

function CompleteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const invitationId = searchParams.get('invitation')
  const [status, setStatus] = useState<'processing' | 'done' | 'error' | 'timeout'>('processing')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user || !invitationId) return

    // Start timeout timer
    timeoutRef.current = setTimeout(() => {
      setStatus(prev => (prev === 'processing' ? 'timeout' : prev))
    }, TIMEOUT_MS)

    // Complete the beta acceptance server-side
    fetch('/api/beta/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId }),
    })
      .then(r => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(data => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (data.success) {
          setStatus('done')
          setTimeout(() => router.push('/dashboard'), REDIRECT_DELAY_MS)
        } else {
          setStatus('error')
        }
      })
      .catch(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setStatus('error')
      })

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [user, invitationId, router])

  const goToDashboard = () => router.push('/dashboard')

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl tracking-[0.3em] font-light text-nuclea-text mb-2">NUCLEA</h1>

        {status === 'processing' && (
          <div className="mt-8 animate-pulse text-nuclea-text-muted">
            Activando tu acceso a la beta...
          </div>
        )}

        {status === 'done' && (
          <div className="mt-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-nuclea-text">
              Bienvenido/a a NUCLEA Beta
            </h2>
            <p className="text-sm text-nuclea-text-muted">
              {profile?.full_name ? `Hola ${profile.full_name}, ` : ''}
              Tu acceso ha sido activado. Redirigiendo al dashboard...
            </p>
            <button
              onClick={goToDashboard}
              className="mt-2 px-6 py-3 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
            >
              Ir al dashboard
            </button>
          </div>
        )}

        {status === 'timeout' && (
          <div className="mt-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
              <span className="text-2xl" role="img" aria-hidden="true">{'\u23F3'}</span>
            </div>
            <h2 className="text-lg font-medium text-nuclea-text">
              Algo est\u00e1 tardando m\u00e1s de lo esperado
            </h2>
            <p className="text-sm text-nuclea-text-muted">
              Intenta recargar la p\u00e1gina. Si el problema persiste, contacta con soporte.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
              >
                Recargar p\u00e1gina
              </button>
              <button
                onClick={goToDashboard}
                className="text-sm text-nuclea-text-muted hover:text-nuclea-text transition-colors underline"
              >
                Ir al dashboard
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-2xl" role="img" aria-hidden="true">{'\u26A0\uFE0F'}</span>
            </div>
            <h2 className="text-lg font-medium text-nuclea-text">
              Error al activar tu acceso
            </h2>
            <p className="text-sm text-nuclea-text-muted">
              Ha ocurrido un error al activar tu acceso. Por favor, contacta con soporte.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
              >
                Ir al login
              </button>
              <a
                href="mailto:soporte@nuclea.app"
                className="text-sm text-nuclea-text-muted hover:text-nuclea-text transition-colors underline"
              >
                soporte@nuclea.app
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BetaCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CompleteContent />
    </Suspense>
  )
}
