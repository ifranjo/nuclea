import test from 'node:test'
import assert from 'node:assert/strict'
import {
  EXPIRY_WINDOW_DAYS,
  getExpiryBannerModel,
  getUrgencyLevel,
  buildCapsuleEmailTemplates,
} from '@/lib/recipientExperience'

test('getUrgencyLevel classifies remaining days into visual urgency tiers', () => {
  assert.equal(getUrgencyLevel(15), 'calm')
  assert.equal(getUrgencyLevel(7), 'warning')
  assert.equal(getUrgencyLevel(2), 'critical')
  assert.equal(getUrgencyLevel(0), 'expired')
})

test('getExpiryBannerModel computes days remaining against 30-day window', () => {
  const now = new Date('2026-02-21T12:00:00.000Z')
  const createdAt = '2026-02-01T10:00:00.000Z'
  const model = getExpiryBannerModel(createdAt, now)

  assert.equal(model.windowDays, EXPIRY_WINDOW_DAYS)
  assert.equal(model.daysRemaining, 10)
  assert.equal(model.level, 'warning')
})

test('buildCapsuleEmailTemplates returns expected subject lines', () => {
  const templates = buildCapsuleEmailTemplates({
    recipientName: 'Andrea',
    capsuleTitle: 'Cápsula Legacy',
    actionUrl: 'https://nuclea.app/r/demo',
    daysRemaining: 2,
  })

  assert.match(templates.received.subject, /has recibido/i)
  assert.match(templates.reminder.subject, /faltan 2 días/i)
  assert.match(templates.expirationWarning.subject, /expira/i)
})
