/**
 * capsule-state-machine.test.ts
 * Unit tests — node:test (zero external dependencies).
 *
 * Run:
 *   npx tsx src/lib/capsule-state-machine.test.ts
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  CAPSULE_STATUSES,
  IMMUTABLE_STATUSES,
  CapsuleTransitionError,
  isValidTransition,
  transitionCapsule,
  getAvailableTransitions,
  isMutableStatus,
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
// Tests
// ---------------------------------------------------------------------------

test('CAPSULE_STATUSES contains exactly the expected 6 values', () => {
  const expected = ['draft', 'active', 'closed', 'downloaded', 'expired', 'archived']
  assert.deepEqual([...CAPSULE_STATUSES], expected)
})

test('IMMUTABLE_STATUSES does not include draft or active', () => {
  const arr = [...IMMUTABLE_STATUSES]
  assert.ok(!arr.includes('draft'))
  assert.ok(!arr.includes('active'))
  assert.ok(arr.includes('closed'))
  assert.ok(arr.includes('downloaded'))
  assert.ok(arr.includes('expired'))
  assert.ok(arr.includes('archived'))
})

// --- All valid transitions ---

test('valid: draft → active', () => assertTransitionOk('draft', 'active'))
test('valid: active → closed', () => assertTransitionOk('active', 'closed'))
test('valid: active → archived', () => assertTransitionOk('active', 'archived'))
test('valid: closed → downloaded', () => assertTransitionOk('closed', 'downloaded'))
test('valid: closed → expired', () => assertTransitionOk('closed', 'expired'))
test('valid: downloaded → archived', () => assertTransitionOk('downloaded', 'archived'))
test('valid: expired → archived', () => assertTransitionOk('expired', 'archived'))

// --- Invalid / skipping transitions ---

test('invalid: draft → closed (must go through active first)', () =>
  assertTransitionFails('draft', 'closed'))

test('invalid: draft → downloaded', () => assertTransitionFails('draft', 'downloaded'))
test('invalid: draft → expired', () => assertTransitionFails('draft', 'expired'))
test('invalid: draft → archived', () => assertTransitionFails('draft', 'archived'))
test('invalid: active → downloaded', () => assertTransitionFails('active', 'downloaded'))
test('invalid: active → expired', () => assertTransitionFails('active', 'expired'))
test('invalid: closed → active (no reversal)', () => assertTransitionFails('closed', 'active'))
test('invalid: downloaded → closed', () => assertTransitionFails('downloaded', 'closed'))
test('invalid: expired → closed', () => assertTransitionFails('expired', 'closed'))

// --- Terminal state ---

test('archived has no available transitions', () => {
  const available = getAvailableTransitions('archived')
  assert.equal(available.length, 0)
})

test('any transition out of archived throws', () => {
  for (const status of CAPSULE_STATUSES) {
    if (status === 'archived') continue
    assertTransitionFails('archived', status)
  }
})

// --- getAvailableTransitions ---

test('getAvailableTransitions(draft) returns [active]', () => {
  assert.deepEqual(getAvailableTransitions('draft'), ['active'])
})

test('getAvailableTransitions(active) returns [closed, archived]', () => {
  assert.deepEqual(getAvailableTransitions('active'), ['closed', 'archived'])
})

test('getAvailableTransitions(closed) returns [downloaded, expired]', () => {
  assert.deepEqual(getAvailableTransitions('closed'), ['downloaded', 'expired'])
})

test('getAvailableTransitions returns a new array each call (no mutation risk)', () => {
  const a = getAvailableTransitions('active')
  const b = getAvailableTransitions('active')
  assert.notEqual(a, b) // different references
  assert.deepEqual(a, b) // same content
})

// --- isMutableStatus ---

test('isMutableStatus: draft = true', () => assert.ok(isMutableStatus('draft')))
test('isMutableStatus: active = true', () => assert.ok(isMutableStatus('active')))
test('isMutableStatus: closed = false', () => assert.ok(!isMutableStatus('closed')))
test('isMutableStatus: downloaded = false', () => assert.ok(!isMutableStatus('downloaded')))
test('isMutableStatus: expired = false', () => assert.ok(!isMutableStatus('expired')))
test('isMutableStatus: archived = false', () => assert.ok(!isMutableStatus('archived')))

// --- CapsuleTransitionError shape ---

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
  const result = transitionCapsule('draft', 'active')
  assert.equal(result, 'active')
})
