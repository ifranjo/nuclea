'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ShieldCheck, Hourglass, CheckCircle2 } from 'lucide-react'

type Decision = 'continue' | 'allow-expiration' | null

export default function TrustDecisionPage() {
  const { capsuleId } = useParams<{ capsuleId: string }>()
  const [decision, setDecision] = useState<Decision>(null)
  const [confirmed, setConfirmed] = useState(false)

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
          <p className='text-sm text-nuclea-text-secondary mt-3'>
            Esta pantalla <strong>no ejecuta acciones automaticas</strong>. Un contacto de confianza debe confirmar la decision de forma explicita.
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
            disabled={!decision}
            onClick={() => setConfirmed(true)}
            className='w-full rounded-lg bg-nuclea-text text-white py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Confirmar decision manual
          </button>

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
