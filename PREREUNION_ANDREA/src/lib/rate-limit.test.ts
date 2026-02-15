import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildRateLimitDocId,
  computeFixedWindowStartMs,
  hashRateLimitKey,
} from './rate-limit'

test('hashRateLimitKey is deterministic and non-empty', () => {
  const a = hashRateLimitKey('127.0.0.1')
  const b = hashRateLimitKey('127.0.0.1')
  const c = hashRateLimitKey('127.0.0.2')

  assert.equal(a, b)
  assert.notEqual(a, c)
  assert.equal(a.length > 8, true)
})

test('computeFixedWindowStartMs buckets timestamps', () => {
  const windowMs = 60_000
  const t = 1700000123456
  const bucket = computeFixedWindowStartMs(t, windowMs)

  assert.equal(bucket % windowMs, 0)
  assert.equal(bucket <= t, true)
  assert.equal(bucket + windowMs > t, true)
})

test('buildRateLimitDocId contains namespace and bucket', () => {
  const hash = hashRateLimitKey('email:user@example.com')
  const id = buildRateLimitDocId('waitlist-email', hash, 1700000100000)

  assert.equal(id.startsWith('waitlist-email:'), true)
  assert.equal(id.includes(hash), true)
  assert.equal(id.endsWith(':1700000100000'), true)
})