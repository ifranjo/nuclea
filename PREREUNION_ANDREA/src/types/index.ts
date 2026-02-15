/** Current consent version — bump when terms or privacy policy change. */
export const CURRENT_CONSENT_VERSION = '2.0'

export type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life-chapter' | 'origin'
export type StoredCapsuleType = CapsuleType | 'everlife'

/** All 6 canonical capsule types. */
export const CAPSULE_TYPE_VALUES: readonly CapsuleType[] = [
  'legacy', 'together', 'social', 'pet', 'life-chapter', 'origin'
] as const

/** Type guard — returns true only if value is one of the 6 canonical CapsuleType values. */
export function isCapsuleType(value: string): value is CapsuleType {
  return (CAPSULE_TYPE_VALUES as readonly string[]).includes(value)
}

/**
 * Returns true only if the type is already one of the 6 canonical types
 * (i.e. it is NOT the legacy alias 'everlife' and not unknown).
 */
export function isMigratedCapsuleType(type: string): boolean {
  return isCapsuleType(type)
}

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
  consentSource?: string
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
  /** Art. 9.2.a RGPD — granular biometric consent flags */
  voiceConsent?: boolean
  faceConsent?: boolean
  personalityConsent?: boolean
  /** Timestamp when the user withdrew biometric consent; null while consent is active */
  consentWithdrawnAt?: Date | null
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

const CAPSULE_TYPE_ALIASES: Record<StoredCapsuleType, CapsuleType> = {
  legacy: 'legacy',
  everlife: 'legacy',
  together: 'together',
  social: 'social',
  pet: 'pet',
  'life-chapter': 'life-chapter',
  origin: 'origin'
}

export function normalizeCapsuleType(type: string | null | undefined): CapsuleType {
  if (!type) return 'legacy'

  const mapped = CAPSULE_TYPE_ALIASES[type as StoredCapsuleType]
  if (mapped) return mapped

  console.warn(`[normalizeCapsuleType] Unknown capsule type "${type}", defaulting to "legacy"`)
  return 'legacy'
}

export const CAPSULE_TYPES: Record<CapsuleType, { name: string; icon: string; description: string }> = {
  'legacy': {
    name: 'Legacy',
    icon: '✨',
    description: 'Legado post-mortem con avatar IA opcional'
  },
  'together': {
    name: 'Together',
    icon: '🤝',
    description: 'Capsula compartida para parejas o proyectos en comun'
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
