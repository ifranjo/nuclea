'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PlayCircle, Sparkles, Download, CreditCard, CheckCircle2 } from 'lucide-react'
import { reportVideoDownloaded } from '@/lib/lifecycle/report-video-download'

interface ReceiverActionOptionsProps {
  capsuleId: string
}

export function ReceiverActionOptions({ capsuleId }: ReceiverActionOptionsProps) {
  const [showTrailer, setShowTrailer] = useState(false)
  const [paymentUnlocked, setPaymentUnlocked] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/capsules/${capsuleId}/claim`, { method: 'POST' }).catch(() => {})
  }, [capsuleId])

  const handleVideoGiftDownload = async () => {
    if (!paymentUnlocked) return

    const filename = `video-regalo-${capsuleId.slice(0, 8)}.txt`
    const blob = new Blob(
      ['Placeholder temporal para flujo de descarga del video regalo.'],
      { type: 'text/plain' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 500)

    setDownloadStatus('Confirmando descarga y purga segura...')
    const result = await reportVideoDownloaded({
      capsuleId,
      idempotencyKey: crypto.randomUUID(),
      storagePath: `video-gifts/${capsuleId}.mp4`,
    })

    if (result.ok) {
      setDownloadStatus('Descarga confirmada. NUCLEA no conserva copia del video.')
    } else {
      setDownloadStatus('Descarga local completada; backend reintentara confirmacion automaticamente.')
    }
  }

  return (
    <section className='space-y-4'>
      <h2 className='text-base font-medium text-nuclea-text'>Tus 3 opciones</h2>

      <div className='grid gap-3'>
        <Link
          href={`/capsule/${capsuleId}`}
          className='rounded-xl border border-nuclea-border bg-white p-4 hover:shadow-sm transition-shadow'
        >
          <div className='flex items-start gap-3'>
            <Sparkles className='text-nuclea-gold mt-0.5' size={18} />
            <div>
              <p className='text-sm font-medium text-nuclea-text'>Continuar herencia emocional</p>
              <p className='text-xs text-nuclea-text-muted mt-1'>
                Conserva y amplia la historia anadiendo nuevos recuerdos.
              </p>
            </div>
          </div>
        </Link>

        <button
          type='button'
          onClick={() => setShowTrailer((prev) => !prev)}
          className='text-left rounded-xl border border-nuclea-border bg-white p-4 hover:shadow-sm transition-shadow'
        >
          <div className='flex items-start gap-3'>
            <PlayCircle className='text-blue-500 mt-0.5' size={18} />
            <div>
              <p className='text-sm font-medium text-nuclea-text'>Ver mini-trailer gratuito</p>
              <p className='text-xs text-nuclea-text-muted mt-1'>
                Preview corta del video regalo para decidir antes del pago.
              </p>
            </div>
          </div>
        </button>

        {showTrailer && (
          <div className='rounded-xl border border-nuclea-border bg-nuclea-secondary p-4'>
            <p className='text-xs uppercase tracking-wide text-nuclea-text-muted'>Mini-trailer</p>
            <div className='mt-2 rounded-lg bg-black/80 text-white text-sm px-4 py-8 text-center'>
              Trailer demostrativo pendiente de motor de video IA.
            </div>
          </div>
        )}

        <div className='rounded-xl border border-nuclea-border bg-white p-4'>
          <div className='flex items-start gap-3'>
            <Download className='text-emerald-600 mt-0.5' size={18} />
            <div className='flex-1'>
              <p className='text-sm font-medium text-nuclea-text'>Descargar video regalo completo</p>
              <p className='text-xs text-nuclea-text-muted mt-1'>
                Pago unico para desbloquear y descargar el montaje completo.
              </p>
              <div className='mt-3 flex items-center gap-2'>
                {!paymentUnlocked ? (
                  <button
                    type='button'
                    onClick={() => setPaymentUnlocked(true)}
                    className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-nuclea-text text-white text-xs hover:bg-nuclea-text/90'
                  >
                    <CreditCard size={14} />
                    Payment gate
                  </button>
                ) : (
                  <div className='space-y-2'>
                    <span className='inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1'>
                      <CheckCircle2 size={14} />
                      Pago simulado confirmado
                    </span>
                    <div>
                      <button
                        type='button'
                        onClick={handleVideoGiftDownload}
                        className='inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-700 text-white text-xs hover:bg-emerald-800'
                      >
                        <Download size={14} />
                        Descargar video regalo
                      </button>
                    </div>
                    {downloadStatus && (
                      <p className='text-xs text-nuclea-text-muted'>{downloadStatus}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
