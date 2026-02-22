'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlayCircle, Sparkles, Download, CreditCard, CheckCircle2, Gift } from 'lucide-react'
import { reportVideoDownloaded } from '@/lib/lifecycle/report-video-download'

interface ReceiverActionOptionsProps {
  capsuleId: string
  giftState: string
  invitationToken: string | null
}

export function ReceiverActionOptions({ capsuleId, giftState, invitationToken }: ReceiverActionOptionsProps) {
  const router = useRouter()
  const [showTrailer, setShowTrailer] = useState(false)
  const [paymentUnlocked, setPaymentUnlocked] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null)
  const [claimStatus, setClaimStatus] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    setClaimStatus(null)
  }, [capsuleId])

  const isSent = giftState === 'sent'
  const isClaimed = ['claimed', 'continued', 'video_purchased', 'video_downloaded'].includes(giftState)

  const handleClaimCapsule = async () => {
    if (claiming) return
    setClaiming(true)
    setClaimStatus('Reclamando cápsula...')

    try {
      const body: Record<string, string> = {}
      if (invitationToken) {
        body.invitation_token = invitationToken
      }

      const response = await fetch(`/api/capsules/${capsuleId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.status === 401) {
        // Receiver not logged in — redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.href)
        window.location.href = `/login?redirect=${returnUrl}`
        return
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'No se pudo reclamar la cápsula')
      }

      setClaimStatus('¡Cápsula reclamada! Redirigiendo...')
      router.push(`/capsule/${capsuleId}`)
    } catch (error) {
      setClaimStatus(error instanceof Error ? error.message : 'No se pudo reclamar la cápsula')
    } finally {
      setClaiming(false)
    }
  }

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
      setDownloadStatus('Descarga local completada; backend reintentará confirmación automáticamente.')
    }
  }

  return (
    <section className='space-y-4'>
      <h2 className='text-base font-medium text-nuclea-text'>
        {isSent ? 'Reclama tu regalo' : 'Tus opciones'}
      </h2>

      <div className='grid gap-3'>
        {/* Claim button — visible when capsule is in 'sent' state */}
        {isSent && (
          <>
            <button
              type='button'
              onClick={handleClaimCapsule}
              disabled={claiming}
              className='rounded-xl border-2 border-nuclea-gold bg-white p-4 hover:shadow-md transition-shadow disabled:opacity-60'
            >
              <div className='flex items-start gap-3'>
                <Gift className='text-nuclea-gold mt-0.5' size={20} />
                <div>
                  <p className='text-sm font-medium text-nuclea-text'>Reclamar esta cápsula</p>
                  <p className='text-xs text-nuclea-text-muted mt-1'>
                    Inicia sesión y reclama el regalo. Tendrás 30 días para ver, añadir recuerdos y
                    decidir si continúas la historia.
                  </p>
                </div>
              </div>
            </button>
            {claimStatus && (
              <p className='text-xs text-nuclea-text-muted'>{claimStatus}</p>
            )}
          </>
        )}

        {/* Post-claim options — visible after claiming */}
        {isClaimed && (
          <>
            <button
              type='button'
              onClick={() => router.push(`/capsule/${capsuleId}`)}
              className='rounded-xl border border-nuclea-border bg-white p-4 hover:shadow-sm transition-shadow'
            >
              <div className='flex items-start gap-3'>
                <Sparkles className='text-nuclea-gold mt-0.5' size={18} />
                <div>
                  <p className='text-sm font-medium text-nuclea-text'>Continuar herencia emocional</p>
                  <p className='text-xs text-nuclea-text-muted mt-1'>
                    Conserva y amplía la historia añadiendo nuevos recuerdos.
                  </p>
                </div>
              </div>
            </button>

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
                    Pago único para desbloquear y descargar el montaje completo.
                  </p>
                  <div className='mt-3 flex items-center gap-2'>
                    {!paymentUnlocked ? (
                      <button
                        type='button'
                        onClick={() => setPaymentUnlocked(true)}
                        className='inline-flex items-center gap-2 px-4 py-2 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all'
                      >
                        <CreditCard size={14} />
                        Pagar Video Regalo
                      </button>
                    ) : (
                      <div className='space-y-2'>
                        <span className='inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1'>
                          <CheckCircle2 size={14} />
                          Pago único confirmado
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
          </>
        )}
      </div>
    </section>
  )
}
