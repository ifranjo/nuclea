import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyLifecycleEvent,
  computeClaimDeadline,
  isValidLifecycleTransition,
  type GiftLifecycleState,
} from './state-machine'

test('supabase lifecycle supports claim and 30-day deadline', () => {
  const from: GiftLifecycleState = 'sent'
  const claimed = applyLifecycleEvent(from, 'claim')
  assert.equal(claimed, 'claimed')

  const deadline = computeClaimDeadline(new Date('2026-02-21T12:00:00.000Z'))
  assert.equal(deadline.toISOString(), '2026-03-23T12:00:00.000Z')
})

test('supabase lifecycle rejects invalid transitions', () => {
  assert.equal(isValidLifecycleTransition('draft', 'video_downloaded'), false)
  assert.throws(() => applyLifecycleEvent('draft', 'download_video'), /invalid lifecycle transition/i)
})

