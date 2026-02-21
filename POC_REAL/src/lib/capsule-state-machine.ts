/**
 * capsule-state-machine.ts
 * Pure state machine for capsule lifecycle transitions.
 * No external dependencies — safe to import anywhere (server, client, tests).
 *
 * Status graph:
 *   draft → active
 *   active → closed | archived
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
  'closed',
  'downloaded',
  'expired',
  'archived',
] as const

export type CapsuleStatus = typeof CAPSULE_STATUSES[number]

// ---------------------------------------------------------------------------
// Mutability
// ---------------------------------------------------------------------------

/** Statuses whose content can still be edited. */
export const MUTABLE_STATUSES: readonly CapsuleStatus[] = ['draft', 'active'] as const

/** Statuses that are locked — no edits, no deletions. */
export const IMMUTABLE_STATUSES: readonly CapsuleStatus[] = [
  'closed',
  'downloaded',
  'expired',
  'archived',
] as const

// ---------------------------------------------------------------------------
// Transition map
// ---------------------------------------------------------------------------

/**
 * Maps each status to the set of statuses it can legally transition to.
 * `archived` maps to an empty array — it is a terminal state.
 */
const TRANSITIONS: Record<CapsuleStatus, readonly CapsuleStatus[]> = {
  draft:      ['active'],
  active:     ['closed', 'archived'],
  closed:     ['downloaded', 'expired'],
  downloaded: ['archived'],
  expired:    ['archived'],
  archived:   [],
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

/**
 * Returns true when moving from `from` to `to` is a permitted transition.
 */
export function isValidTransition(
  from: CapsuleStatus,
  to: CapsuleStatus,
): boolean {
  return (TRANSITIONS[from] as readonly string[]).includes(to)
}

/**
 * Attempts the transition and returns the new status.
 * Throws `CapsuleTransitionError` when the transition is not permitted.
 */
export function transitionCapsule(
  from: CapsuleStatus,
  to: CapsuleStatus,
): CapsuleStatus {
  if (!isValidTransition(from, to)) {
    throw new CapsuleTransitionError(from, to)
  }
  return to
}

/**
 * Returns all statuses that `status` can legally transition to.
 * Returns an empty array for terminal states.
 */
export function getAvailableTransitions(status: CapsuleStatus): CapsuleStatus[] {
  return [...TRANSITIONS[status]]
}

/**
 * Returns true when a capsule in `status` may have its content mutated
 * (title, description, media, collaborators, etc.).
 * Only `draft` and `active` are mutable.
 */
export function isMutableStatus(status: CapsuleStatus): boolean {
  return (MUTABLE_STATUSES as readonly string[]).includes(status)
}
