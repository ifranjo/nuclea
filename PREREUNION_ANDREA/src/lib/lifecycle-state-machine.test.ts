import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyLifecycleEvent,
  computeClaimDeadline,
  isValidLifecycleTransition,
  type GiftLifecycleState,
} from './lifecycle-state-machine'

test('state machine allows claim flow and sets 30-day deadline', () => {
  const from: GiftLifecycleState = 'sent'
  const to = applyLifecycleEvent(from, 'claim')

  assert.equal(to, 'claimed')

  const claimedAt = new Date('2026-02-21T10:00:00.000Z')
  const deadline = computeClaimDeadline(claimedAt)
  assert.equal(deadline.toISOString(), '2026-03-23T10:00:00.000Z')
})

test('state machine blocks invalid transitions', () => {
  assert.equal(isValidLifecycleTransition('draft', 'video_downloaded'), false)
  assert.throws(() => applyLifecycleEvent('draft', 'download_video'), /invalid lifecycle transition/i)
})

test('state machine supports video no-retention sequence', () => {
  const claimed = applyLifecycleEvent('sent', 'claim')
  const purchased = applyLifecycleEvent(claimed, 'purchase_video')
  const downloaded = applyLifecycleEvent(purchased, 'download_video')
  const purged = applyLifecycleEvent(downloaded, 'purge_video_copy')

  assert.equal(purged, 'video_purged')
})

