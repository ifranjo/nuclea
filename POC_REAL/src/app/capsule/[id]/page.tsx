'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCapsuleContents } from '@/hooks/useCapsuleContents'
import { useDesignatedPersons } from '@/hooks/useDesignatedPersons'
import { useCapsules } from '@/hooks/useCapsules'
import { createClient } from '@/lib/supabase/client'
import { buildCapsuleZipName, buildContentEntryName, buildMetadataPayload } from '@/lib/capsuleExport'
import { CapsuleIcon } from '@/components/icons/CapsuleIcons'
import { CapsuleCalendar } from '@/components/capsule/CapsuleCalendar'
import { AddPersonModal } from '@/components/capsule/AddPersonModal'
import { BottomNav } from '@/components/ui/BottomNav'
import { ExpiryUrgencyBanner } from '@/components/receiver/ExpiryUrgencyBanner'
import { buildCapsuleEmailTemplates } from '@/lib/recipientExperience'
import { ArrowLeft, Camera, Video, Mic, FileText, Share2, Users, Download, X } from 'lucide-react'
import { normalizeCapsuleType, type CapsuleType } from '@/types'
import type { MediaItem } from '@/types/media'

function typeLabel(type: string) {
  const map: Record<string, string> = {
    legacy: 'Legacy',
    together: 'Together',
    social: 'Social',
    pet: 'Mascota',
    life_chapter: 'Capítulo de Vida',
    origin: 'Origen',
  }
  return map[type] || type
}

function resolveCapturedAt(value: string | null, fallback: string | null): string {
  return value ?? fallback ?? new Date().toISOString()
}

export default function CapsuleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile } = useAuth()
  const { capsules, loading: capsulesLoading, closeCapsule, ensureShareToken } = useCapsules(profile?.id)
  const { contents, uploadFile, addNote, deleteContent, getFileUrl } = useCapsuleContents(id, profile?.id)
  const { persons, addPerson, removePerson } = useDesignatedPersons(id, profile?.id)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showPersonModal, setShowPersonModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [closing, setClosing] = useState(false)
  const [closeStatus, setCloseStatus] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const capsule = capsules.find(c => c.id === id)
  const isReceiverMode = Boolean(
    profile?.id &&
    capsule &&
    profile.id === capsule.owner_id &&
    capsule.creator_id &&
    capsule.creator_id !== capsule.owner_id
  )

  useEffect(() => {
    const fetchCreatorName = async () => {
      if (!isReceiverMode || !capsule?.creator_id) {
        setCreatorName(null)
        return
      }

      const { data } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', capsule.creator_id)
        .maybeSingle()
      setCreatorName(data?.full_name || null)
    }

    void fetchCreatorName()
  }, [capsule?.creator_id, isReceiverMode, supabase])

  const mediaItems: MediaItem[] = useMemo(() => {
    return contents.map(c => ({
      id: c.id,
      type: c.type as MediaItem['type'],
      name: c.file_name || c.title || 'Item',
      url: c.file_path ? getFileUrl(c.file_path) : undefined,
      text: c.text_content || undefined,
      createdAt: new Date(resolveCapturedAt(c.captured_at, c.created_at)),
    }))
  }, [contents, getFileUrl])

  const emailTemplates = useMemo(() => {
    if (!capsule) return null
    return buildCapsuleEmailTemplates({
      recipientName: profile?.full_name || 'Receptor',
      capsuleTitle: capsule.title || 'Tu capsula NUCLEA',
      actionUrl: typeof window !== 'undefined' ? window.location.href : 'https://nuclea.app',
      daysRemaining: 10,
    })
  }, [capsule, profile?.full_name])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' | 'audio') => {
    const files = e.target.files
    if (!files || !profile) return
    setUploading(true)
    for (const file of Array.from(files)) {
      await uploadFile(file, profile.id, type)
    }
    setUploading(false)
  }

  const handleShare = async () => {
    if (!capsule) return
    const { shareToken, error } = await ensureShareToken(capsule.id, capsule.share_token)
    if (!shareToken || error) {
      alert('No se pudo generar el enlace para compartir.')
      return
    }

    const url = `${window.location.origin}/share/${shareToken}`
    setShareUrl(url)
    setShowShare(true)
    try {
      await navigator.clipboard.writeText(url)
      setTimeout(() => setShowShare(false), 3000)
    } catch {
      // Clipboard failed; URL remains visible in the input.
    }
  }

  const handleClose = async () => {
    if (!capsule || closing) return

    const accepted = confirm('¿Cerrar esta cápsula? Se descargará un ZIP con todo el contenido. ¿Continuar?')
    if (!accepted) return

    setClosing(true)
    setCloseStatus('Preparando exportación...')

    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const exportErrors: string[] = []

      const fileContents = contents.filter(c => c.type !== 'text' && c.file_path)
      const noteContents = contents.filter(c => c.type === 'text')

      for (const [index, content] of fileContents.entries()) {
        setCloseStatus(`Descargando archivo ${index + 1}/${fileContents.length}...`)
        try {
          const fileUrl = getFileUrl(content.file_path as string)
          const response = await fetch(fileUrl)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)

          const blob = await response.blob()
          const zipPath = buildContentEntryName(
            {
              type: content.type,
              file_name: content.file_name,
              title: content.title,
              captured_at: resolveCapturedAt(content.captured_at, content.created_at),
              mime_type: content.mime_type,
            },
            index + 1
          )
          zip.file(zipPath, blob)
        } catch {
          exportErrors.push(content.file_name || content.title || `archivo-${index + 1}`)
        }
      }

      for (const [index, content] of noteContents.entries()) {
        const zipPath = buildContentEntryName(
          {
            type: content.type,
            file_name: content.title ? `${content.title}.txt` : `nota-${index + 1}.txt`,
            title: content.title,
            captured_at: resolveCapturedAt(content.captured_at, content.created_at),
            mime_type: 'text/plain',
          },
          index + 1
        )
        zip.file(zipPath, content.text_content || '')
      }

      const metadata = buildMetadataPayload({
        capsule: {
          id: capsule.id,
          title: capsule.title,
          type: capsule.type,
          status: capsule.status,
        },
        ownerEmail: profile?.email,
        contentsCount: contents.length,
        personsCount: persons.length,
        exportedAt: new Date().toISOString(),
      })

      zip.file('metadata.json', JSON.stringify(metadata, null, 2))
      zip.file(
        'designated_persons.json',
        JSON.stringify(
          persons.map(p => ({
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            relationship: p.relationship,
          })),
          null,
          2
        )
      )

      if (exportErrors.length > 0) {
        alert(`No se pudo exportar todo el contenido. Archivos con error: ${exportErrors.join(', ')}`)
        return
      }

      setCloseStatus('Generando ZIP...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipName = buildCapsuleZipName(capsule.title, capsule.id)
      const downloadUrl = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = zipName
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000)

      setCloseStatus('Cerrando cápsula...')
      const { error } = await closeCapsule(capsule.id)
      if (error) {
        alert('El ZIP se descargó, pero no se pudo marcar la cápsula como cerrada.')
        return
      }

      alert('Cápsula cerrada y descargada correctamente.')
      router.push('/dashboard')
    } catch {
      alert('No se pudo generar el ZIP de exportación. Inténtalo de nuevo.')
    } finally {
      setClosing(false)
      setCloseStatus(null)
    }
  }

  if (capsulesLoading) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <p className='text-nuclea-text-muted'>Cargando cápsula...</p>
      </div>
    )
  }

  if (!capsule) {
    return (
      <div className='min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-6 text-center'>
        <p className='text-nuclea-text-muted'>No se encontró la cápsula o no tienes acceso.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className='px-4 py-2 rounded-lg border border-nuclea-border text-sm text-nuclea-text hover:bg-nuclea-secondary transition-colors'
        >
          Volver al dashboard
        </button>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-nuclea-secondary pb-20'>
      <header className='bg-white border-b border-nuclea-border px-6 py-4'>
        <div className='flex items-center gap-3 mb-3'>
          <button onClick={() => router.push('/dashboard')} className='text-nuclea-text-muted hover:text-nuclea-text'>
            <ArrowLeft size={20} />
          </button>
          <div className='flex items-center gap-2'>
            <CapsuleIcon type={normalizeCapsuleType(capsule.type) as CapsuleType} size={20} />
            <div>
              <h1 className='text-lg font-medium text-nuclea-text'>{capsule.title || 'Sin título'}</h1>
              {isReceiverMode && (
                <p className='text-xs text-nuclea-text-muted mt-0.5'>
                  {creatorName ? `Regalo de ${creatorName}` : 'Cápsula recibida como regalo'}
                </p>
              )}
            </div>
          </div>
          <span className='text-xs px-2 py-0.5 rounded-full bg-nuclea-secondary text-nuclea-text-secondary ml-auto'>
            {typeLabel(capsule.type)}
          </span>
        </div>
      </header>

      <div className='px-6 py-6 space-y-6'>
        {isReceiverMode && capsule.experience_expires_at && (
          <ExpiryUrgencyBanner expiresAt={capsule.experience_expires_at} />
        )}

        <div className='rounded-xl border border-nuclea-border bg-white p-4'>
          <p className='text-xs uppercase tracking-wide text-nuclea-text-muted'>
            {isReceiverMode ? 'Vista receptor' : 'Vista creador'}
          </p>
          <p className='mt-2 text-sm text-nuclea-text-secondary'>
            {isReceiverMode
              ? 'Capsula recibida como regalo. Puedes anadir contenido y gestionar su continuidad.'
              : 'Las acciones del receptor (reclamar, mini-trailer, pago y descarga) viven en el enlace compartido.'}
          </p>
        </div>

        <div className='bg-white rounded-xl border border-nuclea-border p-4'>
          <CapsuleCalendar items={mediaItems} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
        </div>

        <div className='grid grid-cols-4 gap-3'>
          <label className='flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border cursor-pointer hover:shadow-sm transition-shadow'>
            <Camera size={22} className='text-nuclea-text-secondary' />
            <span className='text-xs text-nuclea-text-muted'>Foto</span>
            <input type='file' accept='image/*' multiple className='hidden' onChange={e => handleFileUpload(e, 'photo')} />
          </label>
          <label className='flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border cursor-pointer hover:shadow-sm transition-shadow'>
            <Video size={22} className='text-nuclea-text-secondary' />
            <span className='text-xs text-nuclea-text-muted'>Vídeo</span>
            <input type='file' accept='video/*' className='hidden' onChange={e => handleFileUpload(e, 'video')} />
          </label>
          <label className='flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border cursor-pointer hover:shadow-sm transition-shadow'>
            <Mic size={22} className='text-nuclea-text-secondary' />
            <span className='text-xs text-nuclea-text-muted'>Audio</span>
            <input type='file' accept='audio/*' className='hidden' onChange={e => handleFileUpload(e, 'audio')} />
          </label>
          <button
            onClick={async () => {
              const title = prompt('Título de la nota:')
              const text = prompt('Contenido:')
              if (title && text && profile) await addNote(profile.id, title, text)
            }}
            className='flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border hover:shadow-sm transition-shadow'
          >
            <FileText size={22} className='text-nuclea-text-secondary' />
            <span className='text-xs text-nuclea-text-muted'>Nota</span>
          </button>
        </div>

        {uploading && <div className='text-center text-sm text-nuclea-gold'>Subiendo archivo...</div>}

        {contents.length > 0 && (
          <div className='bg-white rounded-xl border border-nuclea-border p-4'>
            <h3 className='text-sm font-medium text-nuclea-text mb-3'>Contenido ({contents.length})</h3>
            <div className='space-y-2 max-h-60 overflow-y-auto'>
              {contents.map(c => (
                <div key={c.id} className='flex items-center justify-between py-2 border-b border-nuclea-border last:border-0'>
                  <div className='flex items-center gap-2'>
                    {c.type === 'photo' && <Camera size={14} className='text-nuclea-gold' />}
                    {c.type === 'video' && <Video size={14} className='text-red-400' />}
                    {c.type === 'audio' && <Mic size={14} className='text-blue-400' />}
                    {c.type === 'text' && <FileText size={14} className='text-green-400' />}
                    <span className='text-sm text-nuclea-text'>{c.file_name || c.title || 'Item'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-nuclea-text-muted'>
                      {new Date(resolveCapturedAt(c.captured_at, c.created_at)).toLocaleDateString('es-ES')}
                    </span>
                    <button onClick={() => deleteContent(c.id, c.file_path)} className='text-nuclea-text-muted hover:text-red-500'>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='bg-white rounded-xl border border-nuclea-border p-4'>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='text-sm font-medium text-nuclea-text flex items-center gap-2'>
              <Users size={16} />
              Personas designadas
            </h3>
            <button
              onClick={() => setShowPersonModal(true)}
              className='text-xs px-3 py-1 rounded-full border border-nuclea-border text-nuclea-text-secondary hover:bg-nuclea-secondary'
            >
              + Añadir persona
            </button>
          </div>
          {capsule.type !== 'social' && (
            <p className='text-xs text-nuclea-text-muted mb-3'>
              Para capsulas no Social, los contactos pueden decidir continuidad desde{' '}
              <a href={`/trust/decision/${capsule.id}`} className='underline'>
                pagina de decision manual
              </a>.
            </p>
          )}
          {persons.length === 0 ? (
            <p className='text-sm text-nuclea-text-muted'>No hay personas designadas</p>
          ) : (
            <div className='space-y-2'>
              {persons.map(p => (
                <div key={p.id} className='flex items-center justify-between py-2 border-b border-nuclea-border last:border-0'>
                  <div>
                    <p className='text-sm text-nuclea-text'>{p.full_name}</p>
                    <p className='text-xs text-nuclea-text-muted'>{p.email} - {p.relationship}</p>
                    <a
                      href={`/trust/decision/${capsule.id}?personId=${encodeURIComponent(p.id)}`}
                      className='text-xs text-nuclea-text-secondary underline'
                    >
                      Link decision {p.full_name}
                    </a>
                  </div>
                  <button onClick={() => removePerson(p.id)} className='text-nuclea-text-muted hover:text-red-500'>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {shareUrl && (
          <div className='bg-white rounded-xl border border-nuclea-border p-4'>
            <p className='text-xs text-nuclea-text-muted mb-2'>Enlace para compartir:</p>
            <div className='flex items-center gap-2'>
              <input
                type='text'
                readOnly
                value={shareUrl}
                className='flex-1 text-sm text-nuclea-text bg-nuclea-secondary px-3 py-2 rounded-lg border border-nuclea-border'
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl).catch(() => {})
                }}
                className='px-4 py-2 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all'
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        {emailTemplates && (
          <div className='bg-white rounded-xl border border-nuclea-border p-4'>
            <h3 className='text-sm font-medium text-nuclea-text mb-3'>Templates de email (receptor)</h3>
            <div className='space-y-2 text-xs'>
              <div className='rounded-lg border border-nuclea-border p-3'>
                <p className='font-medium text-nuclea-text'>1) Invitacion inicial</p>
                <p className='text-nuclea-text-muted mt-1'>{emailTemplates.received.subject}</p>
              </div>
              <div className='rounded-lg border border-nuclea-border p-3'>
                <p className='font-medium text-nuclea-text'>2) Recordatorio ventana activa</p>
                <p className='text-nuclea-text-muted mt-1'>{emailTemplates.reminder.subject}</p>
              </div>
              <div className='rounded-lg border border-nuclea-border p-3'>
                <p className='font-medium text-nuclea-text'>3) Aviso pre-expiracion</p>
                <p className='text-nuclea-text-muted mt-1'>{emailTemplates.expirationWarning.subject}</p>
              </div>
            </div>
          </div>
        )}

        {!isReceiverMode && (
          <div className='flex gap-3'>
            <button
              onClick={handleShare}
              className='flex-1 flex items-center justify-center gap-2 py-3 bg-transparent border border-nuclea-border rounded-lg text-sm text-nuclea-text hover:bg-white transition-colors'
            >
              <Share2 size={16} />
              {showShare ? 'Link copiado' : 'Compartir'}
            </button>
            <button
              onClick={handleClose}
              disabled={closing}
              className='flex-1 flex items-center justify-center gap-2 py-3 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <Download size={16} />
              {closing ? 'Procesando...' : 'Cerrar y descargar'}
            </button>
          </div>
        )}

        {closeStatus && <p className='text-xs text-nuclea-text-muted text-center'>{closeStatus}</p>}

        <div className='space-y-2 text-sm'>
          <div className='flex items-center justify-between rounded-lg border border-nuclea-border bg-white px-3 py-2'>
            <span className='text-nuclea-text'>Notificaciones por email</span>
            <span className='text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700'>Activo en beta</span>
          </div>
          <div className='flex items-center justify-between rounded-lg border border-nuclea-border bg-white px-3 py-2'>
            <span className='text-nuclea-text'>Avatar con IA</span>
            <span className='text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700'>No activo en beta</span>
          </div>
          <div className='flex items-center justify-between rounded-lg border border-nuclea-border bg-white px-3 py-2'>
            <span className='text-nuclea-text'>Mensajes futuros</span>
            <span className='text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700'>No activo en beta</span>
          </div>
        </div>
      </div>

      {showPersonModal && profile && (
        <AddPersonModal
          onClose={() => setShowPersonModal(false)}
          onSave={async data => {
            const { error } = await addPerson(data)
            if (error) {
              alert(error.message || 'No se pudo añadir el contacto designado.')
              return
            }
            setShowPersonModal(false)
          }}
        />
      )}

      <BottomNav />
    </div>
  )
}
