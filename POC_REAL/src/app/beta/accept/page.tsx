'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const SUPPORT_EMAIL = 'soporte@nuclea.app'

type ErrorReason = 'expired' | 'already_used' | 'invalid_token' | 'rate_limited' | 'connection' | 'unknown'

function ErrorState({ reason }: { reason: ErrorReason }) {
  const configs: Record<ErrorReason, { icon: string; bg: string; title: string; description: string; cta?: React.ReactNode }> = {
    expired: {
      icon: '\u23F3',
      bg: 'bg-amber-50',
      title: 'Tu invitaci\u00f3n ha expirado',
      description: 'Contacta con el equipo de NUCLEA para solicitar una nueva invitaci\u00f3n.',
      cta: (
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=Invitaci%C3%B3n%20beta%20expirada`}
          className="inline-block mt-4 px-6 py-3 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
        >
          Contactar soporte
        </a>
      ),
    },
    already_used: {
      icon: '\u2705',
      bg: 'bg-blue-50',
      title: 'Esta invitaci\u00f3n ya fue utilizada',
      description: 'Si ya tienes cuenta, inicia sesi\u00f3n para acceder a la beta.',
      cta: (
        <Link
          href="/login"
          className="inline-block mt-4 px-6 py-3 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
        >
          Iniciar sesi\u00f3n
        </Link>
      ),
    },
    invalid_token: {
      icon: '\u26A0\uFE0F',
      bg: 'bg-red-50',
      title: 'Enlace no v\u00e1lido',
      description: 'Verifica que copiaste el enlace correctamente. Si el problema persiste, contacta con soporte.',
      cta: (
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=Enlace%20de%20invitaci%C3%B3n%20no%20v%C3%A1lido`}
          className="inline-block mt-4 text-sm text-nuclea-text-muted hover:text-nuclea-text transition-colors underline"
        >
          {SUPPORT_EMAIL}
        </a>
      ),
    },
    rate_limited: {
      icon: '\u{1F6D1}',
      bg: 'bg-orange-50',
      title: 'Demasiados intentos',
      description: 'Espera unos minutos e int\u00e9ntalo de nuevo.',
    },
    connection: {
      icon: '\u{1F4E1}',
      bg: 'bg-gray-50',
      title: 'Error de conexi\u00f3n',
      description: 'No se pudo conectar con el servidor. Comprueba tu conexi\u00f3n a internet e int\u00e9ntalo de nuevo.',
      cta: (
        <button
          onClick={() => window.location.reload()}
          className="inline-block mt-4 px-6 py-3 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
        >
          Reintentar
        </button>
      ),
    },
    unknown: {
      icon: '\u26A0\uFE0F',
      bg: 'bg-red-50',
      title: 'Algo sali\u00f3 mal',
      description: 'Ha ocurrido un error inesperado. Int\u00e9ntalo de nuevo o contacta con soporte.',
      cta: (
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-block mt-4 text-sm text-nuclea-text-muted hover:text-nuclea-text transition-colors underline"
        >
          {SUPPORT_EMAIL}
        </a>
      ),
    },
  }

  const { icon, bg, title, description, cta } = configs[reason]

  return (
    <div className="space-y-4">
      <div className={`w-16 h-16 mx-auto rounded-full ${bg} flex items-center justify-center`}>
        <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
      </div>
      <h2 className="text-lg font-medium text-nuclea-text">{title}</h2>
      <p className="text-sm text-nuclea-text-muted">{description}</p>
      {cta}
    </div>
  )
}

function mapErrorReason(reason?: string, httpStatus?: number): ErrorReason {
  if (httpStatus === 429) return 'rate_limited'
  if (reason === 'expired' || reason === 'already_used' || reason === 'invalid_token') return reason
  return 'unknown'
}

function AcceptContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('t')
  const [status, setStatus] = useState<'validating' | 'valid' | 'sent' | 'error'>('validating')
  const [email, setEmail] = useState('')
  const [errorReason, setErrorReason] = useState<ErrorReason>('unknown')
  const [sending, setSending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startResendCountdown = useCallback(() => {
    setResendCountdown(60)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorReason('invalid_token')
      return
    }

    // Validate token
    fetch(`/api/beta/accept?t=${token}`)
      .then(async r => {
        const data = await r.json()
        if (r.ok && data.valid) {
          setStatus('valid')
          setEmail(data.email)
        } else {
          setStatus('error')
          setErrorReason(mapErrorReason(data.reason, r.status))
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorReason('connection')
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

      if (res.ok && data.success) {
        setStatus('sent')
        startResendCountdown()
      } else {
        setStatus('error')
        setErrorReason(mapErrorReason(data.reason, res.status))
      }
    } catch {
      setStatus('error')
      setErrorReason('connection')
    } finally {
      setSending(false)
    }
  }

  const handleResendOtp = async () => {
    if (!token || resending || resendCountdown > 0) return
    setResending(true)
    setResendMessage('')

    try {
      const res = await fetch('/api/beta/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (data.success) {
        setResendMessage('Enlace reenviado. Revisa tu bandeja de entrada.')
        startResendCountdown()
      } else {
        setResendMessage(data.error || 'Error al reenviar. Int\u00e9ntalo m\u00e1s tarde.')
      }
    } catch {
      setResendMessage('Error de conexi\u00f3n.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl tracking-[0.3em] font-light text-nuclea-text mb-2">NUCLEA</h1>
        <p className="text-nuclea-text-secondary text-sm mb-10">Beta Privada</p>

        {status === 'validating' && (
          <div className="animate-pulse text-nuclea-text-muted">
            Verificando invitaci\u00f3n...
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
              {sending ? 'Procesando...' : 'Aceptar invitaci\u00f3n'}
            </button>
            <p className="text-xs text-nuclea-text-muted">
              Te enviaremos un enlace m\u00e1gico a tu email para acceder.
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
              Hemos enviado un enlace m\u00e1gico a <strong>{email}</strong>.
              Haz clic en el enlace del email para acceder a la beta.
            </p>

            <div className="pt-4 border-t border-gray-100">
              {resendCountdown > 0 ? (
                <p className="text-xs text-nuclea-text-muted">
                  Puedes reenviar en {resendCountdown} segundos
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-nuclea-text-muted">
                    ¿No has recibido el enlace?
                  </p>
                  <button
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-sm font-medium text-nuclea-text underline underline-offset-2 hover:text-nuclea-text-secondary transition-colors disabled:opacity-50"
                  >
                    {resending ? 'Reenviando...' : 'Reenviar'}
                  </button>
                </div>
              )}
              {resendMessage && (
                <p className="text-xs text-green-600 mt-2">{resendMessage}</p>
              )}
            </div>
          </div>
        )}

        {status === 'error' && <ErrorState reason={errorReason} />}
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
