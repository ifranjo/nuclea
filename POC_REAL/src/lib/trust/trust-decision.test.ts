import assert from 'node:assert/strict'
import test from 'node:test'
import {
  normalizeTrustDecision,
  canSubmitTrustDecision,
  type TrustDecisionInput,
  type TrustDecisionSnapshot,
  type TrustDecisionIdentity,
} from './trust-decision'

function input(overrides: Partial<TrustDecisionInput> = {}): TrustDecisionInput {
  return {
    capsuleId: 'cap-1',
    personId: 'person-1',
    decision: 'continue',
    ...overrides,
  }
}

function person(overrides: Partial<TrustDecisionSnapshot> = {}): TrustDecisionSnapshot {
  return {
    id: 'person-1',
    capsuleId: 'cap-1',
    userId: 'user-1',
    email: 'trust@nuclea.test',
    ...overrides,
  }
}

function identity(overrides: Partial<TrustDecisionIdentity> = {}): TrustDecisionIdentity {
  return {
    profileId: 'user-1',
    email: 'trust@nuclea.test',
    ...overrides,
  }
}

test('normalizeTrustDecision accepts both allowed decisions', () => {
  assert.equal(normalizeTrustDecision('continue'), 'continue')
  assert.equal(normalizeTrustDecision('allow-expiration'), 'allow-expiration')
})

test('normalizeTrustDecision rejects unsupported values', () => {
  assert.equal(normalizeTrustDecision('claim'), null)
  assert.equal(normalizeTrustDecision(''), null)
})

test('canSubmitTrustDecision allows user_id match', () => {
  const result = canSubmitTrustDecision(input(), person(), identity({ email: 'other@nuclea.test' }))
  assert.equal(result.ok, true)
})

test('canSubmitTrustDecision allows email match when user_id differs', () => {
  const result = canSubmitTrustDecision(
    input(),
    person({ userId: 'another-user' }),
    identity({ profileId: 'user-1-diff', email: 'TRUST@NUCLEA.TEST' })
  )
  assert.equal(result.ok, true)
})

test('canSubmitTrustDecision allows email match when user_id is null', () => {
  const result = canSubmitTrustDecision(
    input(),
    person({ userId: null, email: 'trust@nuclea.test' }),
    identity({ profileId: 'user-1-diff', email: 'trust@nuclea.test' })
  )
  assert.equal(result.ok, true)
})

test('canSubmitTrustDecision blocks mismatched capsule/person mapping', () => {
  const result = canSubmitTrustDecision(input({ capsuleId: 'cap-2' }), person(), identity())
  assert.equal(result.ok, false)
  assert.match(result.reason || '', /cápsula|capsula/i)
})

test('canSubmitTrustDecision blocks unauthorized person', () => {
  const result = canSubmitTrustDecision(
    input(),
    person({ userId: 'another-user', email: 'other@nuclea.test' }),
    identity()
  )
  assert.equal(result.ok, false)
  assert.match(result.reason || '', /autorizado/i)
})
