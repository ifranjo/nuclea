'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Hourglass, CheckCircle2 } from 'lucide-react'

type Decision = 'continue' | 'allow-expiration' | null

export default function TrustDecisionPage() {
  const { capsuleId } = useParams<{ capsuleId: string }>()
  const searchParams = useSearchParams()
  const personId = searchParams.get('personId') || ''

  const [decision, setDecision] = useState<Decision>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const canConfirm = Boolean(decision && personId && !submitting)

  const handleConfirm = async () => {
    if (!decision) return
    if (!personId) {
      setError('Falta personId en el enlace de decision.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const response = await fetch('/api/trust/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capsuleId,
          personId,
          decision,
        }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : 'No se pudo registrar la decision.'
        )
      }

      setConfirmed(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error inesperado.')
      setConfirmed(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className='min-h-screen bg-nuclea-secondary px-6 py-8'>
      <div className='mx-auto max-w-xl space-y-5'>
        <Link
          href='/dashboard'
          className='inline-flex items-center gap-2 text-sm text-nuclea-text-muted hover:text-nuclea-text'
        >
          <ArrowLeft size={16} />
          Volver
        </Link>

        <section className='bg-white border border-nuclea-border rounded-xl p-5'>
          <p className='text-xs uppercase tracking-wide text-nuclea-text-muted'>Trust contacts</p>
          <h1 className='text-lg text-nuclea-text font-medium mt-1'>Decision de continuidad</h1>
          <p className='text-sm text-nuclea-text-secondary mt-2'>
            Capsula: <span className='font-mono text-xs'>{capsuleId}</span>
          </p>
          <p className='text-sm text-nuclea-text-secondary mt-1'>
            Contacto: <span className='font-mono text-xs'>{personId || 'sin personId'}</span>
          </p>
          <p className='text-sm text-nuclea-text-secondary mt-3'>
            Un contacto de confianza confirma manualmente la decision y queda persistida para auditoria.
          </p>
        </section>

        <section className='space-y-3'>
          <button
            type='button'
            onClick={() => setDecision('continue')}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              decision === 'continue'
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-nuclea-border bg-white hover:bg-nuclea-secondary'
            }`}
          >
            <div className='flex items-start gap-3'>
              <ShieldCheck className='text-emerald-600 mt-0.5' size={18} />
              <div>
                <p className='text-sm font-medium text-nuclea-text'>Continuar historia</p>
                <p className='text-xs text-nuclea-text-muted mt-1'>
                  Mantener la capsula activa para que el receptor continue la herencia emocional.
                </p>
              </div>
            </div>
          </button>

          <button
            type='button'
            onClick={() => setDecision('allow-expiration')}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              decision === 'allow-expiration'
                ? 'border-amber-300 bg-amber-50'
                : 'border-nuclea-border bg-white hover:bg-nuclea-secondary'
            }`}
          >
            <div className='flex items-start gap-3'>
              <Hourglass className='text-amber-600 mt-0.5' size={18} />
              <div>
                <p className='text-sm font-medium text-nuclea-text'>Permitir expiracion natural</p>
                <p className='text-xs text-nuclea-text-muted mt-1'>
                  Cerrar el ciclo sin ampliar disponibilidad y proceder con eliminacion limpia al finalizar plazos.
                </p>
              </div>
            </div>
          </button>
        </section>

        <section className='bg-white border border-nuclea-border rounded-xl p-4'>
          <button
            type='button'
            disabled={!canConfirm}
            onClick={handleConfirm}
            className='w-full py-4 px-8 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-base font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {submitting ? 'Guardando decision...' : 'Confirmar decision manual'}
          </button>

          {error && (
            <p className='mt-3 text-sm text-red-600'>
              {error}
            </p>
          )}

          {confirmed && decision && (
            <p className='mt-3 text-sm text-emerald-700 inline-flex items-center gap-2'>
              <CheckCircle2 size={16} />
              Decision registrada: {decision === 'continue' ? 'continuar historia' : 'permitir expiracion'}.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
