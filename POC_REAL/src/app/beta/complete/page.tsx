'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

function CompleteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const invitationId = searchParams.get('invitation')
  const [status, setStatus] = useState<'processing' | 'done' | 'error'>('processing')

  useEffect(() => {
    if (!user || !invitationId) return

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
        if (data.success) {
          setStatus('done')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [user, invitationId, router])

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
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-nuclea-text-muted">
              Ha ocurrido un error al activar tu acceso. Por favor, contacta con soporte.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 rounded-lg border border-nuclea-border text-sm text-nuclea-text hover:bg-nuclea-secondary"
            >
              Ir al login
            </button>
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
