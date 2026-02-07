'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Maximize2, Share2 } from 'lucide-react'

interface PolaroidPlaceholderProps {
  size?: number
  rotation?: number
  className?: string
  src?: string
  alt?: string
  interactive?: boolean
}

export function PolaroidPlaceholder({
  size = 100,
  rotation = 0,
  className = '',
  src,
  alt = 'Recuerdo',
  interactive = false,
}: PolaroidPlaceholderProps) {
  const [hovered, setHovered] = useState(false)
  const borderSide = 8
  const borderBottom = 24
  const innerSize = size - borderSide * 2
  const iconSize = Math.max(14, Math.round(size * 0.14))

  return (
    <div
      className={`bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-[2px] ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        width: size,
        padding: `${borderSide}px ${borderSide}px ${borderBottom}px ${borderSide}px`,
        transform: `rotate(${rotation}deg)`,
        transition: interactive ? 'box-shadow 0.25s ease, transform 0.25s ease' : undefined,
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.14), 0 2px 8px rgba(212,175,55,0.12)'
          : '0 4px 12px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
    >
      <div
        className="relative overflow-hidden rounded-[1px]"
        style={{ width: innerSize, height: innerSize }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={`${innerSize}px`}
          />
        ) : (
          <div className="w-full h-full bg-[#F0F0F0]" />
        )}

        {/* Hover overlay with clean icons */}
        {interactive && (
          <div
            className="absolute inset-0 flex items-end justify-center gap-3 pb-2 transition-opacity duration-250"
            style={{
              opacity: hovered ? 1 : 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 60%)',
            }}
          >
            <button
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              aria-label="Me gusta"
            >
              <Heart size={iconSize} strokeWidth={1.8} className="text-[#3A3A3A]" />
            </button>
            <button
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              aria-label="Ampliar"
            >
              <Maximize2 size={iconSize} strokeWidth={1.8} className="text-[#3A3A3A]" />
            </button>
            <button
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              aria-label="Compartir"
            >
              <Share2 size={iconSize} strokeWidth={1.8} className="text-[#3A3A3A]" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
