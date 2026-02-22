'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Camera, Video, Mic, PenLine, ChevronLeft, MoreHorizontal, UserPlus } from 'lucide-react'
import { CAPSULE_DETAIL_CONTENT } from '@/lib/capsuleDetails'
import { CapsuleCalendar } from '@/components/capsule/CapsuleCalendar'
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const allItems = useMemo(
    () => [...photos, ...videos, ...recordings, ...notes],
    [photos, videos, recordings, notes]
  )

  const actions = [
    { label: 'Subir foto', Icon: Camera, modal: 'photos' as ModalType },
    { label: 'Subir vídeo', Icon: Video, modal: 'video' as ModalType },
    { label: 'Grabar audio', Icon: Mic, modal: 'audio' as ModalType },
    { label: 'Escribir nota', Icon: PenLine, modal: 'notes' as ModalType },
  ]

  return (
    <main className="min-h-[100dvh] bg-white text-[#1A1A1A]">
      {/* Top nav bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <Link
          href="/onboarding?step=4"
          aria-label="Volver"
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ChevronLeft size={22} className="text-[#6B6B6B]" />
        </Link>
        <button type="button" aria-label="Más opciones" className="w-10 h-10 flex items-center justify-center -mr-2">
          <MoreHorizontal size={20} className="text-[#6B6B6B]" />
        </button>
      </div>

      <div className="px-6 pb-8">
        {/* Open capsule image + title */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-[120px] h-[70px] mb-4">
            <Image
              src="/images/capsule-closed-nobg.png"
              alt={capsule.title}
              fill
              className="object-contain"
              sizes="120px"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            {capsule.title}
          </h1>
          <p className="text-sm text-[#9A9A9A] mt-1 text-center">{capsule.tagline}</p>
        </div>

        {/* 4 action icons row — matching Andrea's mockup */}
        <div className="flex justify-center gap-6 mb-8">
          {actions.map(({ label, Icon, modal }) => (
            <button
              key={label}
              type="button"
              onClick={() => setOpenModal(modal)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-2xl border border-[#E5E5EA] bg-white flex items-center justify-center group-hover:bg-[#F5F5F5] transition-colors">
                <Icon size={22} strokeWidth={1.5} className="text-[#4A4A4A]" />
              </div>
              <span className="text-[11px] text-[#6B6B6B] leading-tight text-center max-w-[64px]">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Calendar — core feature */}
        <CapsuleCalendar
          items={allItems}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />

        {/* Añadir persona — bottom action */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#E5E5EA] bg-white text-sm font-medium text-[#6B6B6B] hover:bg-[#F5F5F5] transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            Añadir persona
          </button>
        </div>
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
