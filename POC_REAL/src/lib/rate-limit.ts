import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export interface RateLimitConfig {
  namespace: string
  key: string
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  limit: number
}

function truncateToWindow(now: number, windowMs: number): number {
  return Math.floor(now / windowMs) * windowMs
}

export function hashRateLimitKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export function buildRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Limit', String(result.limit))
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt.getTime() / 1000)))
  return headers
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const supabase = createAdminClient()
  const now = Date.now()
  const windowStartMs = truncateToWindow(now, config.windowMs)
  const windowStartIso = new Date(windowStartMs).toISOString()
  const resetAt = new Date(windowStartMs + config.windowMs)
  const storedKey = `${config.namespace}:${config.key}`

  // Atomic increment via raw SQL: INSERT … ON CONFLICT DO UPDATE SET count = count + 1
  // This requires a UNIQUE constraint on (key, window_start) in beta_rate_limits.
  // The RETURNING clause gives us the post-increment count in a single round-trip,
  // eliminating the SELECT-then-UPDATE race condition.
  const { data, error } = await supabase.rpc('upsert_rate_limit_count', {
    p_key: storedKey,
    p_window_start: windowStartIso,
  })

  if (error || data === null || data === undefined) {
    // Fail-open in case of infra issues (e.g. RPC not yet deployed);
    // operational logs should catch this.
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt,
      limit: config.limit,
    }
  }

  // data is the scalar count returned by the RPC (RETURNS integer)
  const currentCount = data as number

  return {
    allowed: currentCount <= config.limit,
    remaining: Math.max(0, config.limit - currentCount),
    resetAt,
    limit: config.limit,
  }
}
