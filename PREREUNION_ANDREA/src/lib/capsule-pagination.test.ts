import assert from 'node:assert/strict'
import test from 'node:test'
import {
  encodeCapsulesCursor,
  decodeCapsulesCursor,
  sanitizeCapsulePageSize,
} from './capsule-pagination'

test('sanitizeCapsulePageSize enforces min/max bounds', () => {
  assert.equal(sanitizeCapsulePageSize(1), 1)
  assert.equal(sanitizeCapsulePageSize(25), 25)
  assert.equal(sanitizeCapsulePageSize(0), 1)
  assert.equal(sanitizeCapsulePageSize(500), 50)
})

test('cursor encode/decode roundtrip', () => {
  const cursor = encodeCapsulesCursor('doc_abc')
  const decoded = decodeCapsulesCursor(cursor)
  assert.equal(decoded, 'doc_abc')
})

test('decodeCapsulesCursor rejects malformed cursor', () => {
  assert.throws(() => decodeCapsulesCursor('%%%'), /cursor/i)
})