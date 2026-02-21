import assert from 'node:assert/strict'
import test from 'node:test'
import {
  computeNextRetryAt,
  isRetryableStorageError,
  shouldGiveUpRetrying,
} from './video-purge-retry'

test('computeNextRetryAt uses exponential backoff with cap', () => {
  const base = new Date('2026-02-21T00:00:00.000Z')

  const first = computeNextRetryAt(base, 1)
  const second = computeNextRetryAt(base, 2)
  const high = computeNextRetryAt(base, 10)

  assert.equal(first.toISOString(), '2026-02-21T00:00:30.000Z')
  assert.equal(second.toISOString(), '2026-02-21T00:01:00.000Z')
  assert.equal(high.toISOString(), '2026-02-21T00:15:00.000Z')
})

test('retry policy treats transient/network failures as retryable', () => {
  assert.equal(isRetryableStorageError(new Error('ETIMEDOUT while deleting object')), true)
  assert.equal(isRetryableStorageError(new Error('network connection lost')), true)
  assert.equal(isRetryableStorageError(new Error('permission denied')), false)
})

test('retry policy gives up after max attempts', () => {
  assert.equal(shouldGiveUpRetrying(5, 5), true)
  assert.equal(shouldGiveUpRetrying(4, 5), false)
})

