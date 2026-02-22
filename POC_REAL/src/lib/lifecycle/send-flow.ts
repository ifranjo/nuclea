import { createHash } from 'node:crypto'
import { applyLifecycleEvent, type GiftLifecycleState } from './state-machine'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendableCapsuleSnapshot {
  ownerId: string
  creatorId: string | null
  receiverId: string | null
  giftState: string | null
  status: string | null
  sentAt: string | null
}

export interface SendCapsuleUpdate {
  creator_id: string
  receiver_email: string
  gift_state: GiftLifecycleState
  status: 'sent'
  sent_at: string
  invitation_token_hash: string
  lifecycle_last_activity_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeGiftState(value: string | null): GiftLifecycleState {
  const allowed: GiftLifecycleState[] = [
    'draft', 'sent', 'claimed', 'continued',
    'video_purchased', 'video_downloaded', 'video_purged',
    'expired', 'deleted',
  ]
  return typeof value === 'string' && allowed.includes(value as GiftLifecycleState)
    ? value as GiftLifecycleState
    : 'draft'
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function isInvitationTokenMatch(token: string, tokenHash: string | null): boolean {
  if (!tokenHash) return true
  if (!token) return false
  return hashInvitationToken(token) === tokenHash
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidReceiverEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.trim().length <= 255
}

export interface SendValidationResult {
  ok: boolean
  reason?: string
}

export function canUserSendCapsule(
  capsule: SendableCapsuleSnapshot,
  profileId: string,
  senderEmail?: string | null,
  receiverEmail?: string | null,
): SendValidationResult {
  if (capsule.ownerId !== profileId) {
    return { ok: false, reason: 'Solo el propietario puede enviar la cápsula' }
  }
  if (capsule.receiverId) {
    return { ok: false, reason: 'La cápsula ya tiene receptor asignado' }
  }

  const state = normalizeGiftState(capsule.giftState)
  if (!['draft', 'sent'].includes(state)) {
    return { ok: false, reason: `La cápsula no se puede enviar (estado: ${state})` }
  }

  const status = typeof capsule.status === 'string' ? capsule.status : 'active'
  if (!['active', 'sent'].includes(status)) {
    return { ok: false, reason: `La cápsula debe estar activa para enviar (actual: ${status})` }
  }

  // Cannot send to yourself
  if (senderEmail && receiverEmail && normalizeEmail(senderEmail) === normalizeEmail(receiverEmail)) {
    return { ok: false, reason: 'No puedes enviarte una cápsula a ti mismo' }
  }

  return { ok: true }
}

// ---------------------------------------------------------------------------
// Build update
// ---------------------------------------------------------------------------

export function buildSendCapsuleUpdate(
  capsule: SendableCapsuleSnapshot,
  receiverEmail: string,
  invitationToken: string,
  now: Date
): SendCapsuleUpdate {
  const nowIso = now.toISOString()
  const state = normalizeGiftState(capsule.giftState)

  let nextState: GiftLifecycleState = 'sent'
  try {
    nextState = applyLifecycleEvent(state, 'send')
  } catch {
    nextState = 'sent'
  }

  return {
    creator_id: capsule.creatorId || capsule.ownerId,
    receiver_email: normalizeEmail(receiverEmail),
    gift_state: nextState,
    status: 'sent',
    sent_at: capsule.sentAt || nowIso,
    invitation_token_hash: hashInvitationToken(invitationToken),
    lifecycle_last_activity_at: nowIso,
  }
}
