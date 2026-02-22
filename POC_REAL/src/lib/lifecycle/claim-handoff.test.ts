import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildClaimHandoffUpdate,
  canUserClaimCapsule,
  type ClaimableCapsuleSnapshot,
  type ClaimIdentity,
} from './claim-handoff'

const creatorId = '8a4bb7a0-1ce0-4fda-84ce-41f17f8a1ff1'
const receiverId = 'b7d7f35e-845a-4316-978b-7ca83f7054ca'

function buildIdentity(overrides: Partial<ClaimIdentity> = {}): ClaimIdentity {
  return {
    profileId: receiverId,
    email: 'receiver@nuclea.app',
    ...overrides,
  }
}

function buildCapsule(overrides: Partial<ClaimableCapsuleSnapshot> = {}): ClaimableCapsuleSnapshot {
  return {
    ownerId: creatorId,
    creatorId: null,
    receiverId: null,
    receiverEmail: null,
    giftState: 'sent',
    giftClaimedAt: null,
    giftExpiresAt: null,
    ...overrides,
  }
}

test('claim is blocked for the creator when receiver is not set', () => {
  const capsule = buildCapsule()
  const creatorIdentity = buildIdentity({ profileId: creatorId, email: 'creator@nuclea.app' })
  assert.equal(canUserClaimCapsule(capsule, creatorIdentity), false)
})

test('claim is allowed only for assigned receiver when receiver_id is already set', () => {
  const capsule = buildCapsule({ receiverId })
  assert.equal(canUserClaimCapsule(capsule, buildIdentity({ profileId: receiverId })), true)
  assert.equal(
    canUserClaimCapsule(capsule, buildIdentity({ profileId: '7f8f5f0f-e812-43f1-9f20-6e5129d9b763' })),
    false
  )
})

test('claim respects receiver_email when invitation is email-locked', () => {
  const capsule = buildCapsule({ receiverEmail: 'receiver@nuclea.app' })
  assert.equal(canUserClaimCapsule(capsule, buildIdentity({ email: 'receiver@nuclea.app' })), true)
  assert.equal(canUserClaimCapsule(capsule, buildIdentity({ email: 'other@nuclea.app' })), false)
})

test('claim handoff update transfers ownership to receiver and preserves creator', () => {
  const now = new Date('2026-02-22T12:00:00.000Z')
  const capsule = buildCapsule({ giftState: 'sent' })
  const identity = buildIdentity()

  const update = buildClaimHandoffUpdate(capsule, identity, now)

  assert.equal(update.creator_id, creatorId)
  assert.equal(update.owner_id, receiverId)
  assert.equal(update.receiver_id, receiverId)
  assert.equal(update.gift_state, 'claimed')
  assert.equal(update.gift_claimed_at, '2026-02-22T12:00:00.000Z')
  assert.equal(update.gift_expires_at, '2026-03-24T12:00:00.000Z')
  assert.equal(update.status, 'claimed')
})

test('claim handoff is idempotent and keeps original deadline when already claimed by receiver', () => {
  const now = new Date('2026-03-01T08:00:00.000Z')
  const capsule = buildCapsule({
    ownerId: receiverId,
    creatorId,
    receiverId,
    giftState: 'claimed',
    giftClaimedAt: '2026-02-22T12:00:00.000Z',
    giftExpiresAt: '2026-03-24T12:00:00.000Z',
  })

  const update = buildClaimHandoffUpdate(capsule, buildIdentity(), now)

  assert.equal(update.gift_claimed_at, '2026-02-22T12:00:00.000Z')
  assert.equal(update.gift_expires_at, '2026-03-24T12:00:00.000Z')
})
