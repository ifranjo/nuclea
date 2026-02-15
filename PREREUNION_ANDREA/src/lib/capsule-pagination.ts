const MIN_CAPSULE_PAGE_SIZE = 1
const MAX_CAPSULE_PAGE_SIZE = 50

export function sanitizeCapsulePageSize(size: number): number {
  if (!Number.isFinite(size)) return 12
  if (size < MIN_CAPSULE_PAGE_SIZE) return MIN_CAPSULE_PAGE_SIZE
  if (size > MAX_CAPSULE_PAGE_SIZE) return MAX_CAPSULE_PAGE_SIZE
  return Math.trunc(size)
}

export function encodeCapsulesCursor(docId: string): string {
  return Buffer.from(docId, 'utf8').toString('base64url')
}

export function decodeCapsulesCursor(cursor: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(cursor)) {
    throw new Error('Invalid cursor format')
  }

  const decoded = Buffer.from(cursor, 'base64url').toString('utf8').trim()
  if (!decoded) {
    throw new Error('Invalid cursor payload')
  }

  return decoded
}