import type { AIAvatar } from '@/types'

export class AvatarDisabledError extends Error {
  constructor(message = 'Tu avatar IA ha sido desactivado porque retiraste el consentimiento biometrico.') {
    super(message)
    this.name = 'AvatarDisabledError'
  }
}

export function assertAvatarActive(aiAvatar?: AIAvatar | null): void {
  if (!aiAvatar) return

  const revokedAt = aiAvatar.consentWithdrawnAt
  if (revokedAt === null || revokedAt === undefined) return

  throw new AvatarDisabledError()
}
