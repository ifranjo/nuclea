'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function AcceptContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('t')
  const [status, setStatus] = useState<'validating' | 'valid' | 'sent' | 'error'>('validating')
  const [email, setEmail] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('Enlace de invitación no válido.')
      return
    }

    // Validate token
    fetch(`/api/beta/accept?t=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setStatus('valid')
          setEmail(data.email)
        } else {
          setStatus('error')
          setErrorMsg(data.error || 'Token no válido.')
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Error de conexión. Inténtalo de nuevo.')
      })
  }, [token])

  const handleAccept = async () => {
    if (!token || sending) return
    setSending(true)

    try {
      const res = await fetch('/api/beta/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('sent')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Error al procesar la invitación.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Error de conexión.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl tracking-[0.3em] font-light text-nuclea-text mb-2">NUCLEA</h1>
        <p className="text-nuclea-text-secondary text-sm mb-10">Beta Privada</p>

        {status === 'validating' && (
          <div className="animate-pulse text-nuclea-text-muted">
            Verificando invitación...
          </div>
        )}

        {status === 'valid' && (
          <div className="space-y-6">
            <div className="bg-nuclea-secondary rounded-xl p-6">
              <p className="text-sm text-nuclea-text-secondary mb-1">Has sido invitado/a a</p>
              <p className="text-lg font-medium text-nuclea-text">NUCLEA Beta</p>
              <p className="text-sm text-nuclea-text-muted mt-2">{email}</p>
            </div>
            <button
              onClick={handleAccept}
              disabled={sending}
              className="w-full py-4 px-8 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-base font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all disabled:opacity-50"
            >
              {sending ? 'Procesando...' : 'Aceptar invitación'}
            </button>
            <p className="text-xs text-nuclea-text-muted">
              Te enviaremos un enlace mágico a tu email para acceder.
            </p>
          </div>
        )}

        {status === 'sent' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-nuclea-text">Revisa tu email</h2>
            <p className="text-sm text-nuclea-text-muted">
              Hemos enviado un enlace mágico a <strong>{email}</strong>.
              Haz clic en el enlace del email para acceder a la beta.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-nuclea-text-muted">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BetaAcceptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AcceptContent />
    </Suspense>
  )
}
