const BASE_RETRY_SECONDS = 30
const MAX_RETRY_SECONDS = 15 * 60

export function computeNextRetryAt(from: Date, attempt: number): Date {
  const safeAttempt = Math.max(1, attempt)
  const delaySeconds = Math.min(
    BASE_RETRY_SECONDS * (2 ** (safeAttempt - 1)),
    MAX_RETRY_SECONDS
  )
  return new Date(from.getTime() + delaySeconds * 1000)
}

export function isRetryableStorageError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  const retryableTokens = [
    'timeout',
    'timedout',
    'network',
    'econnreset',
    'tempor',
    '503',
    '429',
    'unavailable',
    'rate limit',
  ]

  return retryableTokens.some((token) => message.includes(token))
}

export function shouldGiveUpRetrying(attempt: number, maxAttempts = 5): boolean {
  return attempt >= maxAttempts
}

