import assert from 'node:assert/strict'
import test from 'node:test'
import {
  computeNextRetryAt,
  isRetryableStorageError,
  shouldGiveUpRetrying,
} from './video-purge-retry'

test('supabase retry policy computes bounded backoff', () => {
  const base = new Date('2026-02-21T00:00:00.000Z')
  assert.equal(computeNextRetryAt(base, 1).toISOString(), '2026-02-21T00:00:30.000Z')
  assert.equal(computeNextRetryAt(base, 10).toISOString(), '2026-02-21T00:15:00.000Z')
})

test('supabase retry policy marks transient errors as retryable', () => {
  assert.equal(isRetryableStorageError(new Error('ECONNRESET during delete')), true)
  assert.equal(isRetryableStorageError(new Error('Temporary unavailable')), true)
  assert.equal(isRetryableStorageError(new Error('invalid auth')), false)
})

test('supabase retry policy stop condition', () => {
  assert.equal(shouldGiveUpRetrying(6, 5), true)
  assert.equal(shouldGiveUpRetrying(3, 5), false)
})

