import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTrustDecisionPath, buildTrustDecisionUrl } from './trust-contact-links'

test('buildTrustDecisionPath includes encoded capsuleId and personId', () => {
  const result = buildTrustDecisionPath('capsule/1', 'person 1')
  assert.equal(result, '/trust/decision/capsule%2F1?personId=person%201')
})

test('buildTrustDecisionUrl builds absolute URL when NEXT_PUBLIC_APP_URL is valid', () => {
  const result = buildTrustDecisionUrl('https://app.nuclea.test/', 'cap-1', 'person-1')
  assert.equal(result, 'https://app.nuclea.test/trust/decision/cap-1?personId=person-1')
})

test('buildTrustDecisionUrl falls back to relative path when app URL is missing/invalid', () => {
  assert.equal(
    buildTrustDecisionUrl('', 'cap-1', 'person-1'),
    '/trust/decision/cap-1?personId=person-1'
  )
  assert.equal(
    buildTrustDecisionUrl('nuclea.local', 'cap-1', 'person-1'),
    '/trust/decision/cap-1?personId=person-1'
  )
})
