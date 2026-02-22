import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildSendCapsuleUpdate,
  canUserSendCapsule,
  hashInvitationToken,
  isInvitationTokenMatch,
  isValidReceiverEmail,
  type SendableCapsuleSnapshot,
} from './send-flow'

const creatorId = '1f6dbeba-f347-4e50-a4ef-32d7e345f44c'

function capsule(overrides: Partial<SendableCapsuleSnapshot> = {}): SendableCapsuleSnapshot {
  return {
    ownerId: creatorId,
    creatorId: null,
    receiverId: null,
    giftState: 'draft',
    status: 'active',
    sentAt: null,
    ...overrides,
  }
}

// --- Email validation ---

test('isValidReceiverEmail accepts valid emails', () => {
  assert.ok(isValidReceiverEmail('bart@nuclea.test'))
  assert.ok(isValidReceiverEmail('  user@example.com  '))
})

test('isValidReceiverEmail rejects invalid emails', () => {
  assert.ok(!isValidReceiverEmail(''))
  assert.ok(!isValidReceiverEmail('not-an-email'))
  assert.ok(!isValidReceiverEmail('@missing.local'))
})

// --- canUserSendCapsule ---

test('canUserSendCapsule allows owner with active draft capsule', () => {
  const result = canUserSendCapsule(capsule(), creatorId)
  assert.equal(result.ok, true)
})

test('canUserSendCapsule blocks non-owner', () => {
  const result = canUserSendCapsule(capsule(), '233eb197-747f-42ad-9917-6be1e6968027')
  assert.equal(result.ok, false)
  assert.match(result.reason!, /propietario/)
})

test('canUserSendCapsule blocks when receiver already assigned', () => {
  const result = canUserSendCapsule(capsule({ receiverId: 'a58784b4-c1ba-49f8-a730-f243d4c10ac2' }), creatorId)
  assert.equal(result.ok, false)
  assert.match(result.reason!, /receptor/)
})

test('canUserSendCapsule blocks when already claimed', () => {
  const result = canUserSendCapsule(capsule({ giftState: 'claimed' }), creatorId)
  assert.equal(result.ok, false)
})

test('canUserSendCapsule blocks self-send', () => {
  const result = canUserSendCapsule(capsule(), creatorId, 'me@nuclea.test', 'me@nuclea.test')
  assert.equal(result.ok, false)
  assert.match(result.reason!, /ti mismo/)
})

test('canUserSendCapsule blocks inactive capsule', () => {
  const result = canUserSendCapsule(capsule({ status: 'draft' }), creatorId)
  assert.equal(result.ok, false)
  assert.match(result.reason!, /activa/)
})

// --- Token helpers ---

test('hashInvitationToken is deterministic sha-256 hex', () => {
  assert.equal(
    hashInvitationToken('abc123'),
    '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090'
  )
})

test('isInvitationTokenMatch validates token against stored hash', () => {
  const hash = hashInvitationToken('invite-token-xyz')
  assert.equal(isInvitationTokenMatch('invite-token-xyz', hash), true)
  assert.equal(isInvitationTokenMatch('wrong-token', hash), false)
  assert.equal(isInvitationTokenMatch('', hash), false)
  assert.equal(isInvitationTokenMatch('anything', null), true)
})

// --- buildSendCapsuleUpdate ---

test('buildSendCapsuleUpdate sets receiver email, sent state and invitation hash', () => {
  const now = new Date('2026-02-22T13:00:00.000Z')
  const token = 'invite-token-123'
  const update = buildSendCapsuleUpdate(capsule(), 'BART@NUCLEA.TEST', token, now)

  assert.equal(update.creator_id, creatorId)
  assert.equal(update.receiver_email, 'bart@nuclea.test')
  assert.equal(update.gift_state, 'sent')
  assert.equal(update.status, 'sent')
  assert.equal(update.sent_at, '2026-02-22T13:00:00.000Z')
  assert.equal(update.lifecycle_last_activity_at, '2026-02-22T13:00:00.000Z')
  assert.equal(update.invitation_token_hash, hashInvitationToken(token))
})

test('buildSendCapsuleUpdate keeps original sent_at on resend', () => {
  const now = new Date('2026-02-28T10:00:00.000Z')
  const update = buildSendCapsuleUpdate(
    capsule({ giftState: 'sent', sentAt: '2026-02-22T13:00:00.000Z' }),
    'bart@nuclea.test',
    'new-token',
    now
  )

  assert.equal(update.sent_at, '2026-02-22T13:00:00.000Z')
  assert.equal(update.invitation_token_hash, hashInvitationToken('new-token'))
})

test('buildSendCapsuleUpdate preserves existing creatorId', () => {
  const update = buildSendCapsuleUpdate(
    capsule({ creatorId: 'original-creator' }),
    'bart@nuclea.test',
    'token',
    new Date()
  )
  assert.equal(update.creator_id, 'original-creator')
})
