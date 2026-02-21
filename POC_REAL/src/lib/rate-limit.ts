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

  const { data: existing, error: readError } = await supabase
    .from('beta_rate_limits')
    .select('count')
    .eq('key', storedKey)
    .eq('window_start', windowStartIso)
    .maybeSingle()

  if (readError) {
    // Fail-open in case of infra issues; operational logs should catch this.
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt,
      limit: config.limit,
    }
  }

  if (existing) {
    if (existing.count >= config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        limit: config.limit,
      }
    }

    await supabase
      .from('beta_rate_limits')
      .update({ count: existing.count + 1 })
      .eq('key', storedKey)
      .eq('window_start', windowStartIso)

    return {
      allowed: true,
      remaining: config.limit - (existing.count + 1),
      resetAt,
      limit: config.limit,
    }
  }

  await supabase.from('beta_rate_limits').insert({
    key: storedKey,
    window_start: windowStartIso,
    count: 1,
  })

  return {
    allowed: true,
    remaining: config.limit - 1,
    resetAt,
    limit: config.limit,
  }
}
