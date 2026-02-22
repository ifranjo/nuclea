/**
 * capsule-state-machine.ts
 * Pure state machine for capsule lifecycle transitions (v4 receiver model).
 * No external dependencies — safe to import anywhere (server, client, tests).
 *
 * Status graph (v4):
 *   draft → active
 *   active → sent | closed | archived
 *   sent → claimed | expired
 *   claimed → experience_active | archived
 *   experience_active → expiring_soon | closed | archived
 *   expiring_soon → closed | expired | archived
 *   closed → downloaded | expired
 *   downloaded → archived
 *   expired → archived
 *   archived → (terminal)
 */

// ---------------------------------------------------------------------------
// Status type
// ---------------------------------------------------------------------------

export const CAPSULE_STATUSES = [
  'draft',
  'active',
  'sent',
  'claimed',
  'experience_active',
  'expiring_soon',
  'closed',
  'downloaded',
  'expired',
  'archived',
] as const

export type CapsuleStatus = typeof CAPSULE_STATUSES[number]

// ---------------------------------------------------------------------------
// Mutability
// ---------------------------------------------------------------------------

/** Statuses where the CREATOR can still edit content. */
export const CREATOR_MUTABLE_STATUSES: readonly CapsuleStatus[] = ['draft', 'active'] as const

/** Statuses where the RECEIVER can add content (Continuar Herencia). */
export const RECEIVER_MUTABLE_STATUSES: readonly CapsuleStatus[] = ['claimed', 'experience_active'] as const

/** All mutable statuses (union). */
export const MUTABLE_STATUSES: readonly CapsuleStatus[] = [
  ...CREATOR_MUTABLE_STATUSES,
  ...RECEIVER_MUTABLE_STATUSES,
] as const

/** Statuses that are locked — no edits by anyone. */
export const IMMUTABLE_STATUSES: readonly CapsuleStatus[] = [
  'sent',
  'expiring_soon',
  'closed',
  'downloaded',
  'expired',
  'archived',
] as const

// ---------------------------------------------------------------------------
// Transition map
// ---------------------------------------------------------------------------

const TRANSITIONS: Record<CapsuleStatus, readonly CapsuleStatus[]> = {
  draft:             ['active'],
  active:            ['sent', 'closed', 'archived'],
  sent:              ['claimed', 'expired'],
  claimed:           ['experience_active', 'archived'],
  experience_active: ['expiring_soon', 'closed', 'archived'],
  expiring_soon:     ['closed', 'expired', 'archived'],
  closed:            ['downloaded', 'expired'],
  downloaded:        ['archived'],
  expired:           ['archived'],
  archived:          [],
}

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class CapsuleTransitionError extends Error {
  readonly from: CapsuleStatus
  readonly to: CapsuleStatus

  constructor(from: CapsuleStatus, to: CapsuleStatus) {
    super(`Invalid capsule transition: '${from}' → '${to}'`)
    this.name = 'CapsuleTransitionError'
    this.from = from
    this.to = to
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function isValidTransition(from: CapsuleStatus, to: CapsuleStatus): boolean {
  return (TRANSITIONS[from] as readonly string[]).includes(to)
}

export function transitionCapsule(from: CapsuleStatus, to: CapsuleStatus): CapsuleStatus {
  if (!isValidTransition(from, to)) {
    throw new CapsuleTransitionError(from, to)
  }
  return to
}

export function getAvailableTransitions(status: CapsuleStatus): CapsuleStatus[] {
  return [...TRANSITIONS[status]]
}

export function isMutableStatus(status: CapsuleStatus): boolean {
  return (MUTABLE_STATUSES as readonly string[]).includes(status)
}

export function isCreatorMutable(status: CapsuleStatus): boolean {
  return (CREATOR_MUTABLE_STATUSES as readonly string[]).includes(status)
}

export function isReceiverMutable(status: CapsuleStatus): boolean {
  return (RECEIVER_MUTABLE_STATUSES as readonly string[]).includes(status)
}

/** True when the capsule is in the receiver's hands (post-send). */
export function isReceiverPhase(status: CapsuleStatus): boolean {
  return ['sent', 'claimed', 'experience_active', 'expiring_soon'].includes(status)
}

/** Calculate experience expiry date from claim timestamp. */
export function calculateExpiryDate(claimedAt: Date, days = 30): Date {
  const expiry = new Date(claimedAt)
  expiry.setDate(expiry.getDate() + days)
  return expiry
}

/** Days remaining in experience period. Negative = expired. */
export function daysRemaining(expiresAt: Date, now = new Date()): number {
  return Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
