'use client'

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { Video, Upload, Play } from 'lucide-react'
import { MediaModal } from '@/components/capsule/MediaModal'
import type { MediaItem } from '@/types/media'

interface VideoUploadProps {
  isOpen: boolean
  onClose: () => void
  videos: MediaItem[]
  onAddVideo: (item: MediaItem) => void
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`
}

export function VideoUpload({ isOpen, onClose, videos, onAddVideo }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setSelectedFile(file)
    setPreviewUrl(url)
  }, [previewUrl])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleAdd = useCallback(() => {
    if (!selectedFile || !previewUrl) return
    onAddVideo({
      id: crypto.randomUUID(),
      type: 'video',
      name: selectedFile.name,
      url: previewUrl,
      file: selectedFile,
      createdAt: new Date(),
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [selectedFile, previewUrl, onAddVideo])

  return (
    <MediaModal isOpen={isOpen} onClose={onClose} title="Subir vídeo">
      {/* Drop zone / preview */}
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-4 text-center transition-colors ${
            isDragging
              ? 'border-[#D4AF37] bg-[#FDFAF3]'
              : 'border-[#E5E5E5] bg-[#FAFAFA]'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F0F0]">
            <Video size={24} className="text-[#6B6B6B]" />
          </div>
          <p className="text-sm text-[#6B6B6B]">
            Arrastra un vídeo aquí
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-1 inline-flex items-center gap-2 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-[#FAFAFA]"
          >
            <Upload size={16} />
            Seleccionar vídeo
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Video preview */}
          <div className="overflow-hidden rounded-xl bg-black">
            <video
              src={previewUrl!}
              controls
              className="w-full max-h-[220px] object-contain"
            />
          </div>

          {/* File info */}
          <div className="flex items-center gap-2 text-sm">
            <Video size={16} className="shrink-0 text-[#6B6B6B]" />
            <span className="truncate text-[#1A1A1A]">{selectedFile.name}</span>
            <span className="shrink-0 text-[#9A9A9A]">
              {formatFileSize(selectedFile.size)}
            </span>
          </div>

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2.5 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all"
          >
            Añadir a la cápsula
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Already-added videos */}
      {videos.length > 0 && (
        <div className="mt-5 border-t border-[#F0F0F0] pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9A9A9A]">
            Vídeos añadidos ({videos.length})
          </p>
          <ul className="flex flex-col gap-2">
            {videos.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 rounded-lg bg-[#FAFAFA] px-3 py-2 text-sm"
              >
                <Play size={14} className="shrink-0 text-[#6B6B6B]" />
                <span className="truncate text-[#1A1A1A]">{v.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </MediaModal>
  )
}
