'use client'

import NextImage from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, Users, Image as ImageIcon, MoreVertical, Trash2, Edit, Share2 } from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CAPSULE_TYPES, normalizeCapsuleType } from '@/types'
import type { Capsule } from '@/types'

interface CapsuleCardProps {
  capsule: Capsule
  onEdit?: (capsule: Capsule) => void
  onDelete?: (capsuleId: string) => void
  onShare?: (capsule: Capsule) => void
}

export default function CapsuleCard({ capsule, onEdit, onDelete, onShare }: CapsuleCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const normalizedType = normalizeCapsuleType(capsule.type)
  const typeInfo = CAPSULE_TYPES[normalizedType]

  const getCapsuleClass = () => {
    const classes: Record<string, string> = {
      'legacy': 'capsule-legacy',
      'life-chapter': 'capsule-life-chapter',
      'together': 'capsule-together',
      'social': 'capsule-social',
      'pet': 'capsule-pet',
      'origin': 'capsule-origin'
    }
    return classes[normalizedType] || ''
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card group relative"
    >
      {/* Cover Image */}
      {capsule.coverImage ? (
        <div className="relative h-40 -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
          <NextImage
            src={capsule.coverImage}
            alt={capsule.title || 'Portada de capsula'}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-nuclea-bg to-transparent" />
        </div>
      ) : (
        <div className={`h-24 -mx-6 -mt-6 mb-4 rounded-t-2xl ${getCapsuleClass()} flex items-center justify-center`}>
          <span className="text-4xl">{typeInfo.icon}</span>
        </div>
      )}

      {/* Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg bg-black/30 text-white/70 hover:text-white hover:bg-black/50 transition-all"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 py-2 glass rounded-xl z-10">
            <button
              onClick={() => {
                onEdit?.(capsule)
                setMenuOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2"
            >
              <Edit size={14} />
              Editar
            </button>
            <button
              onClick={() => {
                onShare?.(capsule)
                setMenuOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2"
            >
              <Share2 size={14} />
              Compartir
            </button>
            <hr className="my-2 border-white/10" />
            <button
              onClick={() => {
                onDelete?.(capsule.id)
                setMenuOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className={`capsule-icon ${getCapsuleClass()}`}>
            {typeInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-nuclea-gold uppercase tracking-wider">
              {typeInfo.name}
            </span>
            <h3 className="font-semibold text-lg text-white truncate">
              {capsule.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-white/60 line-clamp-2">
          {capsule.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Calendar size={14} />
            <span>
              {formatDistanceToNow(capsule.updatedAt, { addSuffix: true, locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <ImageIcon size={14} />
            <span>{capsule.contents.length}</span>
          </div>
          {capsule.sharedWith.length > 0 && (
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Users size={14} />
              <span>{capsule.sharedWith.length}</span>
            </div>
          )}
        </div>

        {/* AI Avatar Badge */}
        {capsule.aiAvatar && (
          <div className="mt-3 px-3 py-1.5 bg-nuclea-gold/10 border border-nuclea-gold/30 rounded-lg flex items-center gap-2">
            <span className="text-sm">🤖</span>
            <span className="text-xs text-nuclea-gold">Avatar IA Activo</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
