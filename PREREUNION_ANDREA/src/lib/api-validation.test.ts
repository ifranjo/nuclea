import assert from 'node:assert/strict'
import test from 'node:test'
import {
  waitlistPostBodySchema,
  waitlistUnsubscribeBodySchema,
  waitlistUnsubscribeQuerySchema,
  capsulesListQuerySchema,
  capsulesCreateBodySchema,
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