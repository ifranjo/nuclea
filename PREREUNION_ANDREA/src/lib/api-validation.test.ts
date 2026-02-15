import assert from 'node:assert/strict'
import test from 'node:test'
import {
  waitlistPostBodySchema,
  waitlistUnsubscribeBodySchema,
  waitlistUnsubscribeQuerySchema,
  capsulesListQuerySchema,
  capsulesCreateBodySchema,
  biometricConsentSchema,
  revokeConsentSchema,
} from './api-validation'

test('waitlistPostBodySchema normalizes and validates payload', () => {
  const parsed = waitlistPostBodySchema.parse({
    email: '  USER@Example.COM ',
    acceptedPrivacy: true,
    source: 'landing',
    consentVersion: '1.0',
  })

  assert.equal(parsed.email, 'user@example.com')
  assert.equal(parsed.acceptedPrivacy, true)
  assert.equal(parsed.source, 'landing')
  assert.equal(parsed.consentVersion, '1.0')
})

test('waitlistPostBodySchema rejects invalid email', () => {
  assert.throws(
    () => waitlistPostBodySchema.parse({ email: 'bad', acceptedPrivacy: true }),
    /email/i
  )
})

test('unsubscribe schemas require token', () => {
  const bodyParsed = waitlistUnsubscribeBodySchema.parse({ token: 'abc123' })
  const queryParsed = waitlistUnsubscribeQuerySchema.parse({ token: 'abc123' })

  assert.equal(bodyParsed.token, 'abc123')
  assert.equal(queryParsed.token, 'abc123')
})

test('capsules list query schema parses bounds', () => {
  const parsed = capsulesListQuerySchema.parse({ limit: '20', cursor: 'doc_1' })
  assert.equal(parsed.limit, 20)
  assert.equal(parsed.cursor, 'doc_1')
})

test('capsules create schema requires title and valid type', () => {
  const parsed = capsulesCreateBodySchema.parse({
    type: 'legacy',
    title: 'Memorias',
    description: 'Texto',
  })

  assert.equal(parsed.type, 'legacy')
  assert.equal(parsed.title, 'Memorias')

  assert.throws(
    () => capsulesCreateBodySchema.parse({ type: 'invalid', title: 'x' }),
    /type/i
  )
})

// ---------------------------------------------------------------------------
// Biometric Consent Schemas
// ---------------------------------------------------------------------------

test('biometricConsentSchema accepts all three consents true', () => {
  const parsed = biometricConsentSchema.parse({
    voiceConsent: true,
    faceConsent: true,
    personalityConsent: true,
  })

  assert.equal(parsed.voiceConsent, true)
  assert.equal(parsed.faceConsent, true)
  assert.equal(parsed.personalityConsent, true)
})

test('biometricConsentSchema accepts partial consent (at least one true)', () => {
  const voiceOnly = biometricConsentSchema.parse({
    voiceConsent: true,
    faceConsent: false,
    personalityConsent: false,
  })
  assert.equal(voiceOnly.voiceConsent, true)
  assert.equal(voiceOnly.faceConsent, false)

  const faceOnly = biometricConsentSchema.parse({
    voiceConsent: false,
    faceConsent: true,
    personalityConsent: false,
  })
  assert.equal(faceOnly.faceConsent, true)

  const personalityOnly = biometricConsentSchema.parse({
    voiceConsent: false,
    faceConsent: false,
    personalityConsent: true,
  })
  assert.equal(personalityOnly.personalityConsent, true)
})

test('biometricConsentSchema rejects all false', () => {
  assert.throws(
    () => biometricConsentSchema.parse({
      voiceConsent: false,
      faceConsent: false,
      personalityConsent: false,
    }),
    /al menos un tipo/i
  )
})

test('biometricConsentSchema rejects missing fields', () => {
  assert.throws(
    () => biometricConsentSchema.parse({ voiceConsent: true }),
  )
})

test('biometricConsentSchema rejects non-boolean values', () => {
  assert.throws(
    () => biometricConsentSchema.parse({
      voiceConsent: 'yes',
      faceConsent: true,
      personalityConsent: true,
    }),
  )
})

test('revokeConsentSchema accepts valid input', () => {
  const parsed = revokeConsentSchema.parse({
    consentId: 'abc123',
    reason: 'Ya no quiero participar',
  })

  assert.equal(parsed.consentId, 'abc123')
  assert.equal(parsed.reason, 'Ya no quiero participar')
})

test('revokeConsentSchema accepts without reason', () => {
  const parsed = revokeConsentSchema.parse({ consentId: 'abc123' })
  assert.equal(parsed.consentId, 'abc123')
  assert.equal(parsed.reason, undefined)
})

test('revokeConsentSchema rejects empty consentId', () => {
  assert.throws(
    () => revokeConsentSchema.parse({ consentId: '' }),
    /consentId/i
  )
})

test('revokeConsentSchema rejects missing consentId', () => {
  assert.throws(
    () => revokeConsentSchema.parse({}),
  )
})