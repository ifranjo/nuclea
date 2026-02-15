'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, Upload } from 'lucide-react'
import { MediaModal } from '@/components/capsule/MediaModal'
import type { MediaItem } from '@/types/media'

interface PhotoUploadProps {
  isOpen: boolean
  onClose: () => void
  photos: MediaItem[]
  onAddPhotos: (items: MediaItem[]) => void
}

export function PhotoUpload({ isOpen, onClose, photos, onAddPhotos }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (imageFiles.length === 0) return

      const items: MediaItem[] = imageFiles.map((file) => ({
        id: crypto.randomUUID(),
        type: 'photo',
        name: file.name,
        url: URL.createObjectURL(file),
        file,
        createdAt: new Date(),
      }))

      onAddPhotos(items)
    },
    [onAddPhotos],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
        e.target.value = ''
      }
    },
    [processFiles],
  )

  return (
    <MediaModal isOpen={isOpen} onClose={onClose} title="Subir fotos">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-[#1A1A1A] bg-[#F0F0F0]'
            : 'border-[#D4D4D4] bg-[#F5F5F5]'
        }`}
      >
        <Upload size={32} className="text-[#6B6B6B]" />
        <p className="text-sm text-[#6B6B6B] text-center">
          Arrastra tus fotos aquí
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-1 inline-flex items-center gap-2 rounded-lg border border-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-[#1A1A1A] hover:text-white"
        >
          <ImagePlus size={16} />
          Añadir fotos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Thumbnail grid */}
      {photos.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="h-full w-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      )}
    </MediaModal>
  )
}
