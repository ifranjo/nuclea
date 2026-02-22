import { applyLifecycleEvent, computeClaimDeadline, type GiftLifecycleState } from './state-machine'

export interface ClaimIdentity {
  profileId: string
  email: string | null
}

export interface ClaimableCapsuleSnapshot {
  ownerId: string
  creatorId: string | null
  receiverId: string | null
  receiverEmail: string | null
  giftState: string | null
  giftClaimedAt: string | null
  giftExpiresAt: string | null
}

interface ClaimHandoffUpdate {
  creator_id: string
  owner_id: string
  receiver_id: string
  receiver_email: string | null
  gift_state: GiftLifecycleState
  gift_claimed_at: string
  gift_expires_at: string
  lifecycle_last_activity_at: string
  status: 'claimed'
  claimed_at: string
  experience_expires_at: string
}

function normalizeEmail(value: string | null): string | null {
  return typeof value === 'string' ? value.trim().toLowerCase() || null : null
}

function normalizeGiftState(value: string | null): GiftLifecycleState {
  const allowed: GiftLifecycleState[] = [
    'draft',
    'sent',
    'claimed',
    'continued',
    'video_purchased',
    'video_downloaded',
    'video_purged',
    'expired',
    'deleted',
  ]
  return typeof value === 'string' && allowed.includes(value as GiftLifecycleState)
    ? value as GiftLifecycleState
    : 'sent'
}

export function canUserClaimCapsule(
  capsule: ClaimableCapsuleSnapshot,
  identity: ClaimIdentity
): boolean {
  const claimedStates: GiftLifecycleState[] = [
    'sent',
    'claimed',
    'continued',
    'video_purchased',
    'video_downloaded',
    'video_purged',
  ]
  const state = normalizeGiftState(capsule.giftState)

  if (!claimedStates.includes(state)) return false

  const assignedReceiverId = capsule.receiverId
  if (assignedReceiverId && assignedReceiverId !== identity.profileId) {
    return false
  }

  if (!assignedReceiverId && capsule.ownerId === identity.profileId) {
    return false
  }

  const requiredEmail = normalizeEmail(capsule.receiverEmail)
  if (requiredEmail) {
    const userEmail = normalizeEmail(identity.email)
    if (!userEmail || userEmail !== requiredEmail) {
      return false
    }
  }

  return true
}

export function buildClaimHandoffUpdate(
  capsule: ClaimableCapsuleSnapshot,
  identity: ClaimIdentity,
  now: Date
): ClaimHandoffUpdate {
  const nowIso = now.toISOString()
  const current = normalizeGiftState(capsule.giftState)
  const existingClaimedAt = capsule.giftClaimedAt
  const existingExpiresAt = capsule.giftExpiresAt

  let nextState: GiftLifecycleState = 'claimed'
  try {
    nextState = applyLifecycleEvent(current, 'claim')
  } catch {
    nextState = 'claimed'
  }

  const claimedAt = existingClaimedAt || nowIso
  const expiresAt = existingExpiresAt || computeClaimDeadline(new Date(claimedAt)).toISOString()

  return {
    creator_id: capsule.creatorId || capsule.ownerId,
    owner_id: identity.profileId,
    receiver_id: identity.profileId,
    receiver_email: capsule.receiverEmail || normalizeEmail(identity.email),
    gift_state: nextState,
    gift_claimed_at: claimedAt,
    gift_expires_at: expiresAt,
    lifecycle_last_activity_at: nowIso,
    status: 'claimed',
    claimed_at: claimedAt,
    experience_expires_at: expiresAt,
  }
}
