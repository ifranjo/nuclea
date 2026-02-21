import test from 'node:test'
import assert from 'node:assert/strict'
import { estimateUtf8Bytes, getContentSizeBytes, buildCapsuleSizeMap } from '@/lib/storageSize'

test('estimateUtf8Bytes counts ASCII and multibyte chars', () => {
  assert.equal(estimateUtf8Bytes('abc'), 3)
  assert.equal(estimateUtf8Bytes('áéí'), 6)
})

test('getContentSizeBytes prioritizes file_size_bytes', () => {
  assert.equal(getContentSizeBytes({ file_size_bytes: 2048, text_content: 'hello' }), 2048)
})

test('getContentSizeBytes falls back to text content bytes', () => {
  assert.equal(getContentSizeBytes({ file_size_bytes: null, text_content: 'Hola NUCLEA' }), 11)
})

test('buildCapsuleSizeMap aggregates by capsule id', () => {
  const map = buildCapsuleSizeMap([
    { capsule_id: 'a', file_size_bytes: 1024, text_content: null },
    { capsule_id: 'a', file_size_bytes: null, text_content: 'hola' },
    { capsule_id: 'b', file_size_bytes: null, text_content: null },
  ])

  assert.equal(map.a, 1028)
  assert.equal(map.b, 0)
})
