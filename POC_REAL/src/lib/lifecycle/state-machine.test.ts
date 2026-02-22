import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyLifecycleEvent,
  canAddContentAfterClaim,
  canDownloadPurchasedVideo,
  canPurchaseVideoGift,
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

test('video regalo purchase is available only from claimed or continued', () => {
  assert.equal(canPurchaseVideoGift('claimed'), true)
  assert.equal(canPurchaseVideoGift('continued'), true)
  assert.equal(canPurchaseVideoGift('sent'), false)
  assert.equal(canPurchaseVideoGift('video_downloaded'), false)
})

test('receiver can add new content only after continue_story', () => {
  assert.equal(canAddContentAfterClaim('claimed'), false)
  assert.equal(canAddContentAfterClaim('continued'), true)
  assert.equal(canAddContentAfterClaim('video_purchased'), true)
  assert.equal(canAddContentAfterClaim('video_purged'), true)
  assert.equal(canAddContentAfterClaim('expired'), false)
})

test('video download is allowed only after purchase event', () => {
  assert.equal(canDownloadPurchasedVideo('video_purchased'), true)
  assert.equal(canDownloadPurchasedVideo('claimed'), false)
  assert.equal(canDownloadPurchasedVideo('continued'), false)
  assert.equal(canDownloadPurchasedVideo('sent'), false)
})
