import assert from 'node:assert/strict'
import test from 'node:test'
import {
  computeTrustContactNotifyBeforeIso,
  isWithinTrustContactWindow,
} from './trust-contact-window'

test('computeTrustContactNotifyBeforeIso adds configured hours to now', () => {
  const now = new Date('2026-02-22T10:00:00.000Z')
  const thresholdIso = computeTrustContactNotifyBeforeIso(now, 72)
  assert.equal(thresholdIso, '2026-02-25T10:00:00.000Z')
})

test('isWithinTrustContactWindow only returns true before expiry and inside lookahead window', () => {
  const now = new Date('2026-02-22T10:00:00.000Z')
  assert.equal(isWithinTrustContactWindow('2026-02-24T09:00:00.000Z', now, 72), true)
  assert.equal(isWithinTrustContactWindow('2026-02-28T09:00:00.000Z', now, 72), false)
  assert.equal(isWithinTrustContactWindow('2026-02-22T09:00:00.000Z', now, 72), false)
})
