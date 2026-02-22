/**
 * capsule-state-machine.test.ts
 * Unit tests for v4 receiver model state machine — node:test (zero deps).
 *
 * Run:
 *   npx tsx src/lib/capsule-state-machine.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  CAPSULE_STATUSES,
  IMMUTABLE_STATUSES,
  CREATOR_MUTABLE_STATUSES,
  RECEIVER_MUTABLE_STATUSES,
  CapsuleTransitionError,
  isValidTransition,
  transitionCapsule,
  getAvailableTransitions,
  isMutableStatus,
  isCreatorMutable,
  isReceiverMutable,
  isReceiverPhase,
  calculateExpiryDate,
  daysRemaining,
} from './capsule-state-machine.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertTransitionOk(from: string, to: string) {
  assert.ok(
    isValidTransition(from as never, to as never),
    `Expected valid: '${from}' → '${to}'`,
  )
  assert.doesNotThrow(
    () => transitionCapsule(from as never, to as never),
    `Expected no throw: '${from}' → '${to}'`,
  )
}

function assertTransitionFails(from: string, to: string) {
  assert.ok(
    !isValidTransition(from as never, to as never),
    `Expected invalid: '${from}' → '${to}'`,
  )
  assert.throws(
    () => transitionCapsule(from as never, to as never),
    CapsuleTransitionError,
    `Expected CapsuleTransitionError: '${from}' → '${to}'`,
  )
}

// ---------------------------------------------------------------------------
// Status array
// ---------------------------------------------------------------------------

test('CAPSULE_STATUSES contains exactly the expected 10 values (v4)', () => {
  const expected = [
    'draft', 'active', 'sent', 'claimed', 'experience_active',
    'expiring_soon', 'closed', 'downloaded', 'expired', 'archived',
  ]
  assert.deepEqual([...CAPSULE_STATUSES], expected)
})

// ---------------------------------------------------------------------------
// Mutability groups
// ---------------------------------------------------------------------------

test('CREATOR_MUTABLE_STATUSES = [draft, active]', () => {
  assert.deepEqual([...CREATOR_MUTABLE_STATUSES], ['draft', 'active'])
})

test('RECEIVER_MUTABLE_STATUSES = [claimed, experience_active]', () => {
  assert.deepEqual([...RECEIVER_MUTABLE_STATUSES], ['claimed', 'experience_active'])
})

test('IMMUTABLE_STATUSES does not include mutable statuses', () => {
  const arr = [...IMMUTABLE_STATUSES]
  assert.ok(!arr.includes('draft'))
  assert.ok(!arr.includes('active'))
  assert.ok(!arr.includes('claimed'))
  assert.ok(!arr.includes('experience_active'))
  assert.ok(arr.includes('sent'))
  assert.ok(arr.includes('expiring_soon'))
  assert.ok(arr.includes('closed'))
  assert.ok(arr.includes('archived'))
})

// ---------------------------------------------------------------------------
// All valid transitions (v4 graph)
// ---------------------------------------------------------------------------

test('valid: draft → active', () => assertTransitionOk('draft', 'active'))
test('valid: active → sent', () => assertTransitionOk('active', 'sent'))
test('valid: active → closed', () => assertTransitionOk('active', 'closed'))
test('valid: active → archived', () => assertTransitionOk('active', 'archived'))
test('valid: sent → claimed', () => assertTransitionOk('sent', 'claimed'))
test('valid: sent → expired', () => assertTransitionOk('sent', 'expired'))
test('valid: claimed → experience_active', () => assertTransitionOk('claimed', 'experience_active'))
test('valid: claimed → archived', () => assertTransitionOk('claimed', 'archived'))
test('valid: experience_active → expiring_soon', () => assertTransitionOk('experience_active', 'expiring_soon'))
test('valid: experience_active → closed', () => assertTransitionOk('experience_active', 'closed'))
test('valid: experience_active → archived', () => assertTransitionOk('experience_active', 'archived'))
test('valid: expiring_soon → closed', () => assertTransitionOk('expiring_soon', 'closed'))
test('valid: expiring_soon → expired', () => assertTransitionOk('expiring_soon', 'expired'))
test('valid: expiring_soon → archived', () => assertTransitionOk('expiring_soon', 'archived'))
test('valid: closed → downloaded', () => assertTransitionOk('closed', 'downloaded'))
test('valid: closed → expired', () => assertTransitionOk('closed', 'expired'))
test('valid: downloaded → archived', () => assertTransitionOk('downloaded', 'archived'))
test('valid: expired → archived', () => assertTransitionOk('expired', 'archived'))

// ---------------------------------------------------------------------------
// Invalid transitions
// ---------------------------------------------------------------------------

test('invalid: draft → closed (must go through active)', () => assertTransitionFails('draft', 'closed'))
test('invalid: draft → sent (must go through active)', () => assertTransitionFails('draft', 'sent'))
test('invalid: draft → archived', () => assertTransitionFails('draft', 'archived'))
test('invalid: active → claimed (must go through sent)', () => assertTransitionFails('active', 'claimed'))
test('invalid: sent → closed (must go through claimed)', () => assertTransitionFails('sent', 'closed'))
test('invalid: closed → active (no reversal)', () => assertTransitionFails('closed', 'active'))
test('invalid: downloaded → closed', () => assertTransitionFails('downloaded', 'closed'))
test('invalid: expired → closed', () => assertTransitionFails('expired', 'closed'))

// ---------------------------------------------------------------------------
// Terminal state
// ---------------------------------------------------------------------------

test('archived has no available transitions', () => {
  assert.equal(getAvailableTransitions('archived').length, 0)
})

test('any transition out of archived throws', () => {
  for (const status of CAPSULE_STATUSES) {
    if (status === 'archived') continue
    assertTransitionFails('archived', status)
  }
})

// ---------------------------------------------------------------------------
// getAvailableTransitions
// ---------------------------------------------------------------------------

test('getAvailableTransitions(draft) = [active]', () => {
  assert.deepEqual(getAvailableTransitions('draft'), ['active'])
})

test('getAvailableTransitions(active) = [sent, closed, archived]', () => {
  assert.deepEqual(getAvailableTransitions('active'), ['sent', 'closed', 'archived'])
})

test('getAvailableTransitions(sent) = [claimed, expired]', () => {
  assert.deepEqual(getAvailableTransitions('sent'), ['claimed', 'expired'])
})

test('getAvailableTransitions(closed) = [downloaded, expired]', () => {
  assert.deepEqual(getAvailableTransitions('closed'), ['downloaded', 'expired'])
})

test('getAvailableTransitions returns new array (no mutation risk)', () => {
  const a = getAvailableTransitions('active')
  const b = getAvailableTransitions('active')
  assert.notEqual(a, b)
  assert.deepEqual(a, b)
})

// ---------------------------------------------------------------------------
// Mutability helpers
// ---------------------------------------------------------------------------

test('isMutableStatus: draft, active, claimed, experience_active = true', () => {
  assert.ok(isMutableStatus('draft'))
  assert.ok(isMutableStatus('active'))
  assert.ok(isMutableStatus('claimed'))
  assert.ok(isMutableStatus('experience_active'))
})

test('isMutableStatus: sent, expiring_soon, closed, archived = false', () => {
  assert.ok(!isMutableStatus('sent'))
  assert.ok(!isMutableStatus('expiring_soon'))
  assert.ok(!isMutableStatus('closed'))
  assert.ok(!isMutableStatus('archived'))
})

test('isCreatorMutable: draft, active = true; claimed = false', () => {
  assert.ok(isCreatorMutable('draft'))
  assert.ok(isCreatorMutable('active'))
  assert.ok(!isCreatorMutable('claimed'))
  assert.ok(!isCreatorMutable('sent'))
})

test('isReceiverMutable: claimed, experience_active = true; draft = false', () => {
  assert.ok(isReceiverMutable('claimed'))
  assert.ok(isReceiverMutable('experience_active'))
  assert.ok(!isReceiverMutable('draft'))
  assert.ok(!isReceiverMutable('sent'))
})

// ---------------------------------------------------------------------------
// Receiver phase
// ---------------------------------------------------------------------------

test('isReceiverPhase: sent, claimed, experience_active, expiring_soon = true', () => {
  assert.ok(isReceiverPhase('sent'))
  assert.ok(isReceiverPhase('claimed'))
  assert.ok(isReceiverPhase('experience_active'))
  assert.ok(isReceiverPhase('expiring_soon'))
})

test('isReceiverPhase: draft, active, closed, archived = false', () => {
  assert.ok(!isReceiverPhase('draft'))
  assert.ok(!isReceiverPhase('active'))
  assert.ok(!isReceiverPhase('closed'))
  assert.ok(!isReceiverPhase('archived'))
})

// ---------------------------------------------------------------------------
// Expiry calculation
// ---------------------------------------------------------------------------

test('calculateExpiryDate adds 30 days by default', () => {
  const claimed = new Date('2026-02-01T00:00:00Z')
  const expiry = calculateExpiryDate(claimed)
  assert.equal(expiry.toISOString(), '2026-03-03T00:00:00.000Z')
})

test('calculateExpiryDate accepts custom days', () => {
  const claimed = new Date('2026-02-01T00:00:00Z')
  const expiry = calculateExpiryDate(claimed, 7)
  assert.equal(expiry.toISOString(), '2026-02-08T00:00:00.000Z')
})

test('daysRemaining: positive when not expired', () => {
  const expires = new Date('2026-03-01T00:00:00Z')
  const now = new Date('2026-02-20T00:00:00Z')
  assert.equal(daysRemaining(expires, now), 9)
})

test('daysRemaining: negative when expired', () => {
  const expires = new Date('2026-02-15T00:00:00Z')
  const now = new Date('2026-02-20T00:00:00Z')
  assert.equal(daysRemaining(expires, now), -5)
})

// ---------------------------------------------------------------------------
// Error shape
// ---------------------------------------------------------------------------

test('CapsuleTransitionError carries from/to fields', () => {
  const err = new CapsuleTransitionError('draft', 'archived')
  assert.equal(err.name, 'CapsuleTransitionError')
  assert.equal(err.from, 'draft')
  assert.equal(err.to, 'archived')
  assert.ok(err.message.includes('draft'))
  assert.ok(err.message.includes('archived'))
  assert.ok(err instanceof Error)
  assert.ok(err instanceof CapsuleTransitionError)
})

test('transitionCapsule returns the target status on success', () => {
  assert.equal(transitionCapsule('draft', 'active'), 'active')
})
