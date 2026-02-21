import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildCapsuleZipName,
  buildContentEntryName,
  buildMetadataPayload,
  sanitizeFileSegment,
} from '@/lib/capsuleExport'

test('sanitizeFileSegment removes unsafe filename characters', () => {
  const value = sanitizeFileSegment('Mi cápsula: verano/2026?', 'fallback')
  assert.equal(value, 'Mi-capsula-verano-2026')
})

test('buildCapsuleZipName uses title and short id', () => {
  const name = buildCapsuleZipName('Cápsula de Origen', '12345678-aaaa-bbbb-cccc-abcdefabcdef')
  assert.equal(name, 'capsula_Capsula-de-Origen_12345678.zip')
})

test('buildContentEntryName keeps folders by type', () => {
  const name = buildContentEntryName(
    {
      type: 'photo',
      file_name: 'familia.jpg',
      title: null,
      captured_at: '2026-02-15T10:30:00.000Z',
      mime_type: 'image/jpeg',
    },
    1
  )
  assert.match(name, /^photos\/2026-02-15_103000_01_familia\.jpg$/)
})

test('buildMetadataPayload returns stable structure', () => {
  const payload = buildMetadataPayload({
    capsule: { id: 'cap-1', title: 'Test', type: 'legacy', status: 'active' },
    ownerEmail: 'homer@nuclea.test',
    contentsCount: 3,
    personsCount: 1,
    exportedAt: '2026-02-20T12:00:00.000Z',
  })

  assert.deepEqual(payload, {
    exportedAt: '2026-02-20T12:00:00.000Z',
    capsule: { id: 'cap-1', title: 'Test', type: 'legacy', status: 'active' },
    ownerEmail: 'homer@nuclea.test',
    summary: { contents: 3, designatedPersons: 1 },
  })
})
