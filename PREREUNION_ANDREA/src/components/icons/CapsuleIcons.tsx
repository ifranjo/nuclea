'use client'

import { Sparkles, BookOpen, Users, Heart, Baby } from 'lucide-react'
import type { CapsuleType } from '@/types'

interface CapsuleIconProps {
  type: CapsuleType
  className?: string
  size?: number
}

// Refined color palette - softer, more elegant tones
const iconMap = {
  'everlife': Sparkles,
  'life-chapter': BookOpen,
  'social': Users,
  'pet': Heart,
  'origin': Baby
}

const colorMap = {
  'everlife': 'text-[#D4AF37]',      // Classic gold
  'life-chapter': 'text-[#7BA3C9]',  // Soft blue
  'social': 'text-[#A78BFA]',        // Soft violet
  'pet': 'text-[#6EE7B7]',           // Soft emerald
  'origin': 'text-[#F9A8B0]'         // Soft rose
}

const bgMap = {
  'everlife': 'bg-gradient-to-br from-[#D4AF37]/15 to-[#F4E4BA]/10',
  'life-chapter': 'bg-gradient-to-br from-[#7BA3C9]/12 to-[#93C5FD]/8',
  'social': 'bg-gradient-to-br from-[#A78BFA]/12 to-[#C4B5FD]/8',
  'pet': 'bg-gradient-to-br from-[#6EE7B7]/12 to-[#A7F3D0]/8',
  'origin': 'bg-gradient-to-br from-[#F9A8B0]/12 to-[#FDBAC2]/8'
}

export function CapsuleIcon({ type, className = '', size = 24 }: CapsuleIconProps) {
  const Icon = iconMap[type]
  const color = colorMap[type]

  return <Icon className={`${color} ${className}`} size={size} />
}

export function CapsuleIconBox({ type, size = 48 }: CapsuleIconProps) {
  const bg = bgMap[type]

  return (
    <div className={`${bg} rounded-xl p-3.5 inline-flex items-center justify-center border border-white/[0.04]`}>
      <CapsuleIcon type={type} size={size} />
    </div>
  )
}

export { iconMap, colorMap, bgMap }
