import { createHash } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

interface RateLimitConfig {
  namespace: string
  key: string
  limit: number
  windowMs: number
  context: string
  nowMs?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function hashRateLimitKey(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function computeFixedWindowStartMs(nowMs: number, windowMs: number): number {
  return Math.floor(nowMs / windowMs) * windowMs
}

export function buildRateLimitDocId(namespace: string, keyHash: string, windowStartMs: number): string {
  return `${namespace}:${keyHash}:${windowStartMs}`
}

export function resolveClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp?.trim()) {
    return realIp.trim()
  }

  return 'unknown'
}

export async function enforceFixedWindowRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const nowMs = config.nowMs ?? Date.now()
  const windowStartMs = computeFixedWindowStartMs(nowMs, config.windowMs)
  const windowEndMs = windowStartMs + config.windowMs
  const keyHash = hashRateLimitKey(config.key)
  const docId = buildRateLimitDocId(config.namespace, keyHash, windowStartMs)

  const db = getAdminDb(`rate-limit ${config.context}`)
  const docRef = db.collection('_rate_limits').doc(docId)

  const result = await db.runTransaction<RateLimitResult>(async (tx) => {
    const snapshot = await tx.get(docRef)
    const count = snapshot.exists ? Number(snapshot.data()?.count ?? 0) : 0

    if (count >= config.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((windowEndMs - nowMs) / 1000))
      }
    }

    const nextCount = count + 1
    tx.set(docRef, {
      namespace: config.namespace,
      keyHash,
      count: nextCount,
      limit: config.limit,
      windowMs: config.windowMs,
      windowStartMs,
      expiresAt: new Date(windowEndMs),
      updatedAt: new Date(nowMs)
    }, { merge: true })

    return {
      allowed: true,
      remaining: Math.max(0, config.limit - nextCount),
      retryAfterSeconds: 0
    }
  })

  return result
}