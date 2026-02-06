'use client'

import { Star, HeartHandshake, MessageCircle, PawPrint, BookOpen, Baby } from 'lucide-react'
import type { CapsuleType } from '@/types'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<CapsuleType, LucideIcon> = {
  'legacy': Star,
  'together': HeartHandshake,
  'social': MessageCircle,
  'pet': PawPrint,
  'life-chapter': BookOpen,
  'origin': Baby,
}

interface CapsuleIconProps {
  type: CapsuleType
  size?: number
  className?: string
}

export function CapsuleIcon({ type, size = 24, className = '' }: CapsuleIconProps) {
  const Icon = iconMap[type]
  return <Icon size={size} strokeWidth={1.5} className={`text-nuclea-text-secondary ${className}`} />
}

export { iconMap }
