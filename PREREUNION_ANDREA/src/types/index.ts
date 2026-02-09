export type CapsuleType = 'everlife' | 'life-chapter' | 'social' | 'pet' | 'origin'

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  plan: 'free' | 'esencial' | 'familiar' | 'premium'
  createdAt: Date
  capsuleCount: number
  storageUsed: number // in bytes
  termsAcceptedAt?: Date
  privacyAcceptedAt?: Date
  consentVersion?: string
}

export interface Capsule {
  id: string
  userId: string
  type: CapsuleType
  title: string
  description: string
  coverImage?: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  sharedWith: string[] // user IDs
  contents: CapsuleContent[]
  aiAvatar?: AIAvatar
  scheduledRelease?: Date
  tags: string[]
}

export interface CapsuleContent {
  id: string
  type: 'photo' | 'video' | 'audio' | 'text' | 'document'
  url?: string
  text?: string
  caption?: string
  createdAt: Date
  metadata?: Record<string, unknown>
}

export interface AIAvatar {
  id: string
  voiceId: string // ElevenLabs voice ID
  voiceModelUrl?: string
  profilePhotoUrl: string
  videoUrls: string[]
  consentDocumentUrl: string
  consentSignedAt: Date
  isActive: boolean
  personalityPrompt?: string
  createdAt: Date
}

export interface WaitlistEntry {
  id: string
  email: string
  createdAt: Date
  source: string
  notified: boolean
  consentVersion?: string
  consentSource?: string
  privacyAcceptedAt?: Date
  termsAcceptedAt?: Date
  requestMeta?: {
    ip?: string
    userAgent?: string
  }
  unsubscribeToken?: string
  unsubscribedAt?: Date | null
}

export interface Interaction {
  id: string
  capsuleId: string
  userId: string
  message: string
  response: string
  audioUrl?: string
  videoUrl?: string
  createdAt: Date
}

export const CAPSULE_TYPES: Record<CapsuleType, { name: string; icon: string; description: string }> = {
  'everlife': {
    name: 'EverLife',
    icon: '✨',
    description: 'Legado post-mortem con avatar IA opcional'
  },
  'life-chapter': {
    name: 'Life Chapter',
    icon: '📖',
    description: 'Documenta etapas vitales como regalos emocionales'
  },
  'social': {
    name: 'Social',
    icon: '👥',
    description: 'Comparte tu dia a dia de forma privada'
  },
  'pet': {
    name: 'Pet',
    icon: '🐾',
    description: 'Tributos memoriales para tus mascotas'
  },
  'origin': {
    name: 'Origin',
    icon: '👶',
    description: 'Historial de nacimiento a adultez'
  }
}

export const PLANS = {
  free: {
    name: 'Gratuito',
    price: 0,
    capsules: 1,
    storage: 500 * 1024 * 1024, // 500MB
    sharing: 3,
    aiAvatar: false
  },
  esencial: {
    name: 'Esencial',
    price: 9.99,
    capsules: 2,
    storage: 5 * 1024 * 1024 * 1024, // 5GB
    sharing: 10,
    aiAvatar: false
  },
  familiar: {
    name: 'Familiar',
    price: 24.99,
    capsules: 10,
    storage: 50 * 1024 * 1024 * 1024, // 50GB
    sharing: -1, // unlimited
    aiAvatar: true
  },
  premium: {
    name: 'EverLife Premium',
    price: 99,
    priceType: 'one-time',
    capsules: 1, // EverLife only
    storage: 100 * 1024 * 1024 * 1024, // 100GB
    sharing: -1,
    aiAvatar: true,
    dedicatedSupport: true
  }
}
