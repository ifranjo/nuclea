'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ImageIcon, Mic, Video, MessageSquare, Clock3 } from 'lucide-react'
import { CAPSULE_DETAIL_CONTENT } from '@/lib/capsuleDetails'
import { CapsuleIcon } from '@/components/icons/CapsuleIcons'
import { PhotoUpload } from '@/components/capsule/PhotoUpload'
import { VideoUpload } from '@/components/capsule/VideoUpload'
import { AudioRecorder } from '@/components/capsule/AudioRecorder'
import { NoteEditor } from '@/components/capsule/NoteEditor'
import type { MediaItem } from '@/types/media'

type ModalType = 'photos' | 'video' | 'audio' | 'notes' | null

interface CapsuleDetailPageProps {
  params: Promise<{
    type: string
  }>
}

export default function CapsuleDetailPage({ params }: CapsuleDetailPageProps) {
  const { type } = use(params)
  const capsule = CAPSULE_DETAIL_CONTENT[type as keyof typeof CAPSULE_DETAIL_CONTENT]

  if (!capsule) {
    notFound()
  }

  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [photos, setPhotos] = useState<MediaItem[]>([])
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [recordings, setRecordings] = useState<MediaItem[]>([])
  const [notes, setNotes] = useState<MediaItem[]>([])

  const hoverIcons = [
    { label: 'Fotos', Icon: ImageIcon, x: '14%', y: '30%', modal: 'photos' as ModalType, count: photos.length },
    { label: 'Voz', Icon: Mic, x: '28%', y: '68%', modal: 'audio' as ModalType, count: recordings.length },
    { label: 'Video', Icon: Video, x: '72%', y: '26%', modal: 'video' as ModalType, count: videos.length },
    { label: 'Mensajes', Icon: MessageSquare, x: '84%', y: '64%', modal: 'notes' as ModalType, count: notes.length },
    { label: 'Futuro', Icon: Clock3, x: '52%', y: '16%', modal: null, count: 0 },
  ]

  const totalContent = photos.length + videos.length + recordings.length + notes.length

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_50%_-8%,rgba(212,175,55,0.18),rgba(212,175,55,0.02)_40%,transparent_76%),linear-gradient(180deg,#F9F9FC_0%,#EEF0F5_100%)] text-nuclea-text px-6 py-8">
      <div className="max-w-[560px] mx-auto">
        <Link
          href="/onboarding?step=4"
          className="inline-flex items-center text-sm text-nuclea-text-secondary mb-6 hover:text-nuclea-text transition-colors"
        >
          ← Volver a selección
        </Link>

        <div className="rounded-[28px] border border-[rgba(255,255,255,0.78)] bg-white/78 backdrop-blur-sm p-6 shadow-[0_18px_44px_rgba(20,20,28,0.1)] mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[linear-gradient(145deg,#F5F6FB,#E7EAF2)] flex items-center justify-center border border-white/80 shadow-[0_6px_16px_rgba(14,14,20,0.12)]">
              <CapsuleIcon type={capsule.type} size={18} />
            </div>
            <span className="text-xs uppercase tracking-[0.14em] text-[#8E9098]">Capsule profile</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">{capsule.title}</h1>
          <p className="text-lg text-nuclea-text-secondary mb-0">{capsule.tagline}</p>
        </div>

        <section className="group rounded-[28px] border border-[rgba(255,255,255,0.78)] bg-white/76 backdrop-blur-sm p-5 shadow-[0_18px_40px_rgba(18,18,26,0.1)] overflow-hidden mb-5">
          <p className="text-xs uppercase tracking-[0.12em] text-[#9598A2] mb-3">
            Apertura interactiva
          </p>
          <div
            tabIndex={0}
            className="relative h-[220px] rounded-[22px] bg-[radial-gradient(circle_at_50%_32%,rgba(212,175,55,0.22),rgba(212,175,55,0.06)_36%,transparent_72%),linear-gradient(180deg,#F9FAFD_0%,#ECEFF6_100%)] border border-[rgba(23,23,30,0.06)] overflow-hidden focus:outline-none"
          >
            <div className="absolute left-1/2 top-1/2 w-[190px] h-[95px] -translate-x-1/2 -translate-y-1/2">
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:-translate-x-7 group-focus-within:-translate-x-7">
                <div className="relative w-full h-full" style={{ clipPath: 'inset(0 54% 0 0)' }}>
                  <Image src="/images/capsule-closed-nobg.png" alt="" fill className="object-cover" sizes="190px" />
                </div>
              </div>
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:translate-x-7 group-focus-within:translate-x-7">
                <div className="relative w-full h-full" style={{ clipPath: 'inset(0 0 0 46%)' }}>
                  <Image src="/images/capsule-closed-nobg.png" alt="" fill className="object-cover" sizes="190px" />
                </div>
              </div>
            </div>

            {hoverIcons.map(({ label, Icon, x, y, modal, count }) => (
              <div
                key={label}
                className="absolute -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 cursor-pointer"
                style={{ left: x, top: y }}
                onClick={() => modal && setOpenModal(modal)}
              >
                <div className="relative w-11 h-11 rounded-full border border-white/80 bg-white/94 backdrop-blur-sm flex items-center justify-center shadow-[0_10px_18px_rgba(12,12,18,0.14)] hover:scale-110 transition-transform">
                  <Icon size={16} className="text-[#4F515B]" />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {count}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-center text-[#777A84] tracking-[0.03em]">{label}</div>
              </div>
            ))}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-[#868995]">
              Toca un icono para añadir contenido
            </div>
          </div>
        </section>

        {/* Quick action bar — always visible */}
        <section className="flex gap-2 mb-5">
          {[
            { label: 'Fotos', Icon: ImageIcon, modal: 'photos' as ModalType, count: photos.length },
            { label: 'Voz', Icon: Mic, modal: 'audio' as ModalType, count: recordings.length },
            { label: 'Video', Icon: Video, modal: 'video' as ModalType, count: videos.length },
            { label: 'Notas', Icon: MessageSquare, modal: 'notes' as ModalType, count: notes.length },
          ].map(({ label, Icon, modal, count }) => (
            <button
              key={label}
              type="button"
              onClick={() => setOpenModal(modal)}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-[#E5E5EA] bg-white hover:bg-[#F5F5F5] transition-colors relative"
            >
              <Icon size={18} className="text-[#6B6B6B]" />
              <span className="text-xs text-[#6B6B6B]">{label}</span>
              {count > 0 && (
                <span className="absolute top-1.5 right-2 w-4 h-4 rounded-full bg-[#D4AF37] text-white text-[9px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          ))}
        </section>

        {/* Content added summary — each row opens its modal */}
        {totalContent > 0 && (
          <section className="rounded-2xl border border-[#E5E5EA] bg-white p-5 mb-4">
            <h2 className="text-base font-semibold mb-3">
              Contenido añadido
              <span className="ml-2 text-sm font-normal text-[#9A9A9A]">({totalContent})</span>
            </h2>
            <div className="space-y-1.5">
              {photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenModal('photos')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F0F0F0] flex items-center justify-center">
                    <ImageIcon size={14} className="text-[#6B6B6B]" />
                  </div>
                  <span className="flex-1 text-sm text-nuclea-text-secondary">{photos.length} foto{photos.length !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-[#9A9A9A]">Ver →</span>
                </button>
              )}
              {videos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenModal('video')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F0F0F0] flex items-center justify-center">
                    <Video size={14} className="text-[#6B6B6B]" />
                  </div>
                  <span className="flex-1 text-sm text-nuclea-text-secondary">{videos.length} vídeo{videos.length !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-[#9A9A9A]">Ver →</span>
                </button>
              )}
              {recordings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenModal('audio')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F0F0F0] flex items-center justify-center">
                    <Mic size={14} className="text-[#6B6B6B]" />
                  </div>
                  <span className="flex-1 text-sm text-nuclea-text-secondary">{recordings.length} grabación{recordings.length !== 1 ? 'es' : ''}</span>
                  <span className="text-xs text-[#9A9A9A]">Ver →</span>
                </button>
              )}
              {notes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenModal('notes')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F0F0F0] flex items-center justify-center">
                    <MessageSquare size={14} className="text-[#6B6B6B]" />
                  </div>
                  <span className="flex-1 text-sm text-nuclea-text-secondary">{notes.length} nota{notes.length !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-[#9A9A9A]">Ver →</span>
                </button>
              )}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[#E5E5EA] bg-[#FAFAFA] p-5">
          <h2 className="text-base font-semibold mb-2">Descripción</h2>
          <p className="text-sm text-nuclea-text-secondary leading-relaxed">{capsule.summary}</p>
        </section>

        <section className="rounded-2xl border border-[#E5E5EA] bg-white p-5 mt-4">
          <h2 className="text-base font-semibold mb-3">Claves de esta cápsula</h2>
          <ul className="space-y-2.5 text-sm text-nuclea-text-secondary leading-relaxed">
            {capsule.features.map((feature, index) => (
              <li key={feature} className="flex items-start gap-2.5 rounded-xl bg-[#F6F7FA] px-3 py-2.5">
                <span
                  aria-hidden
                  className="mt-[2px] w-5 h-5 rounded-full bg-white border border-[#E0E2E8] text-[#9497A1] inline-flex items-center justify-center text-xs"
                >
                  {index + 1}
                </span>
                <span className="flex-1">{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[#E5E5EA] bg-white p-5 mt-4">
          <h2 className="text-base font-semibold mb-2">Siguiente paso</h2>
          <p className="text-sm text-nuclea-text-secondary leading-relaxed">
            Continuar con flujo de creación, validación legal y activación de cápsula.
          </p>
        </section>
      </div>

      {/* Media modals */}
      <PhotoUpload
        isOpen={openModal === 'photos'}
        onClose={() => setOpenModal(null)}
        photos={photos}
        onAddPhotos={(items) => setPhotos((prev) => [...prev, ...items])}
      />
      <VideoUpload
        isOpen={openModal === 'video'}
        onClose={() => setOpenModal(null)}
        videos={videos}
        onAddVideo={(item) => setVideos((prev) => [...prev, item])}
      />
      <AudioRecorder
        isOpen={openModal === 'audio'}
        onClose={() => setOpenModal(null)}
        recordings={recordings}
        onAddRecording={(item) => setRecordings((prev) => [...prev, item])}
      />
      <NoteEditor
        isOpen={openModal === 'notes'}
        onClose={() => setOpenModal(null)}
        notes={notes}
        onAddNote={(item) => setNotes((prev) => [...prev, item])}
      />
    </main>
  )
}
