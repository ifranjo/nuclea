'use client'
import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCapsuleContents } from '@/hooks/useCapsuleContents'
import { useDesignatedPersons } from '@/hooks/useDesignatedPersons'
import { useCapsules } from '@/hooks/useCapsules'
import { CapsuleIcon } from '@/components/icons/CapsuleIcons'
import { CapsuleCalendar } from '@/components/capsule/CapsuleCalendar'
import { AddPersonModal } from '@/components/capsule/AddPersonModal'
import { BottomNav } from '@/components/ui/BottomNav'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { ArrowLeft, Camera, Video, Mic, FileText, Share2, Users, Download, X } from 'lucide-react'
import type { CapsuleType } from '@/types'
import type { MediaItem } from '@/types/media'

function typeLabel(type: string) {
  const map: Record<string, string> = {
    legacy: 'Legacy', together: 'Together', social: 'Social',
    pet: 'Mascota', life_chapter: 'Capítulo de Vida', origin: 'Origen'
  }
  return map[type] || type
}

export default function CapsuleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { profile } = useAuth()
  const { capsules, loading: capsulesLoading, closeCapsule, ensureShareToken } = useCapsules(profile?.id)
  const { contents, uploadFile, addNote, deleteContent, getFileUrl } = useCapsuleContents(id)
  const { persons, addPerson, removePerson } = useDesignatedPersons(id)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showPersonModal, setShowPersonModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const capsule = capsules.find(c => c.id === id)

  const mediaItems: MediaItem[] = useMemo(() => {
    return contents.map(c => ({
      id: c.id,
      type: c.type as MediaItem['type'],
      name: c.file_name || c.title || 'Item',
      url: c.file_path ? getFileUrl(c.file_path) : undefined,
      text: c.text_content || undefined,
      createdAt: new Date(c.captured_at),
    }))
  }, [contents, getFileUrl])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video' | 'audio') => {
    const files = e.target.files
    if (!files || !profile) return
    setUploading(true)
    for (const file of Array.from(files)) {
      await uploadFile(file, profile.id, type)
    }
    setUploading(false)
  }

  const [shareUrl, setShareUrl] = useState<string | null>(null)

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
      // Clipboard failed — URL is still visible in the input below
    }
  }

  const handleClose = async () => {
    if (!capsule || !confirm('¿Cerrar esta cápsula? Se generará un archivo de descarga.')) return
    await closeCapsule(capsule.id)
  }

  if (capsulesLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-nuclea-text-muted">Cargando cápsula...</p>
      </div>
    )
  }

  if (!capsule) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-nuclea-text-muted">No se encontró la cápsula o no tienes acceso.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 rounded-lg border border-nuclea-border text-sm text-nuclea-text hover:bg-nuclea-secondary transition-colors"
        >
          Volver al dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nuclea-secondary pb-20">
      {/* Header */}
      <header className="bg-white border-b border-nuclea-border px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.push('/dashboard')} className="text-nuclea-text-muted hover:text-nuclea-text">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <CapsuleIcon type={capsule.type.replace('_', '-') as CapsuleType} size={20} />
            <h1 className="text-lg font-medium text-nuclea-text">{capsule.title || 'Sin título'}</h1>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-nuclea-secondary text-nuclea-text-secondary ml-auto">
            {typeLabel(capsule.type)}
          </span>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Calendar */}
        <div className="bg-white rounded-xl border border-nuclea-border p-4">
          <CapsuleCalendar items={mediaItems} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
        </div>

        {/* Upload actions */}
        <div className="grid grid-cols-4 gap-3">
          <label className="flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border cursor-pointer hover:shadow-sm transition-shadow">
            <Camera size={22} className="text-nuclea-text-secondary" />
            <span className="text-xs text-nuclea-text-muted">Foto</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileUpload(e, 'photo')} />
          </label>
          <label className="flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border cursor-pointer hover:shadow-sm transition-shadow">
            <Video size={22} className="text-nuclea-text-secondary" />
            <span className="text-xs text-nuclea-text-muted">Vídeo</span>
            <input type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, 'video')} />
          </label>
          <label className="flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border cursor-pointer hover:shadow-sm transition-shadow">
            <Mic size={22} className="text-nuclea-text-secondary" />
            <span className="text-xs text-nuclea-text-muted">Audio</span>
            <input type="file" accept="audio/*" className="hidden" onChange={e => handleFileUpload(e, 'audio')} />
          </label>
          <button
            onClick={async () => {
              const title = prompt('Título de la nota:')
              const text = prompt('Contenido:')
              if (title && text && profile) await addNote(profile.id, title, text)
            }}
            className="flex flex-col items-center gap-1 py-4 bg-white rounded-xl border border-nuclea-border hover:shadow-sm transition-shadow"
          >
            <FileText size={22} className="text-nuclea-text-secondary" />
            <span className="text-xs text-nuclea-text-muted">Nota</span>
          </button>
        </div>

        {uploading && (
          <div className="text-center text-sm text-nuclea-gold">Subiendo archivo...</div>
        )}

        {/* Content list */}
        {contents.length > 0 && (
          <div className="bg-white rounded-xl border border-nuclea-border p-4">
            <h3 className="text-sm font-medium text-nuclea-text mb-3">Contenido ({contents.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {contents.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-nuclea-border last:border-0">
                  <div className="flex items-center gap-2">
                    {c.type === 'photo' && <Camera size={14} className="text-nuclea-gold" />}
                    {c.type === 'video' && <Video size={14} className="text-red-400" />}
                    {c.type === 'audio' && <Mic size={14} className="text-blue-400" />}
                    {c.type === 'text' && <FileText size={14} className="text-green-400" />}
                    <span className="text-sm text-nuclea-text">{c.file_name || c.title || 'Item'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-nuclea-text-muted">
                      {new Date(c.captured_at).toLocaleDateString('es-ES')}
                    </span>
                    <button onClick={() => deleteContent(c.id, c.file_path)} className="text-nuclea-text-muted hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Designated persons */}
        <div className="bg-white rounded-xl border border-nuclea-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-nuclea-text flex items-center gap-2">
              <Users size={16} />
              Personas designadas
            </h3>
            <button
              onClick={() => setShowPersonModal(true)}
              className="text-xs px-3 py-1 rounded-full border border-nuclea-border text-nuclea-text-secondary hover:bg-nuclea-secondary"
            >
              + Añadir persona
            </button>
          </div>
          {persons.length === 0 ? (
            <p className="text-sm text-nuclea-text-muted">No hay personas designadas</p>
          ) : (
            <div className="space-y-2">
              {persons.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-nuclea-border last:border-0">
                  <div>
                    <p className="text-sm text-nuclea-text">{p.full_name}</p>
                    <p className="text-xs text-nuclea-text-muted">{p.email} · {p.relationship}</p>
                  </div>
                  <button onClick={() => removePerson(p.id)} className="text-nuclea-text-muted hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share URL display */}
        {shareUrl && (
          <div className="bg-white rounded-xl border border-nuclea-border p-4">
            <p className="text-xs text-nuclea-text-muted mb-2">Enlace para compartir:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-sm text-nuclea-text bg-nuclea-secondary px-3 py-2 rounded-lg border border-nuclea-border"
                onClick={e => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl).catch(() => {}) }}
                className="px-3 py-2 rounded-lg bg-nuclea-text text-white text-xs"
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-nuclea-border text-sm text-nuclea-text hover:bg-white transition-colors"
          >
            <Share2 size={16} />
            {showShare ? '¡Link copiado!' : 'Compartir'}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-nuclea-text text-white text-sm hover:bg-nuclea-text/90 transition-colors"
          >
            <Download size={16} />
            Cerrar y descargar
          </button>
        </div>

        {/* Coming Soon */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-nuclea-text-muted">
            <ComingSoon /> Notificaciones por email
          </div>
          <div className="flex items-center gap-2 text-sm text-nuclea-text-muted">
            <ComingSoon /> Avatar con IA
          </div>
          <div className="flex items-center gap-2 text-sm text-nuclea-text-muted">
            <ComingSoon /> Mensajes futuros
          </div>
        </div>
      </div>

      {showPersonModal && profile && (
        <AddPersonModal
          onClose={() => setShowPersonModal(false)}
          onSave={async (data) => {
            await addPerson(profile.id, data)
            setShowPersonModal(false)
          }}
        />
      )}

      <BottomNav />
    </div>
  )
}
