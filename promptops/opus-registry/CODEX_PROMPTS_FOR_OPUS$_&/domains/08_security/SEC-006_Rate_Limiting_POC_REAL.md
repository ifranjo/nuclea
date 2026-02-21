# Rate Limiting for POC_REAL API Routes

## Metadata

- Prompt ID: `PRM-SEC-006`
- Version: `1.0.0`
- Owner: `CTO`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P0 CRITICAL`
- Target App: `POC_REAL`

## Purpose

POC_REAL has **zero rate limiting** on any API route. The beta invitation system accepts unlimited requests — OTP codes can be brute-forced, tokens can be enumerated, and invitation spam is trivially possible. PREREUNION_ANDREA already has a Firestore-based rate limiter as reference.

## Context

Vulnerable endpoints:
- `POST /api/beta/invite` — Create invitations (admin, but no rate limit)
- `POST /api/beta/accept` — Validate token + send OTP (public)
- `POST /api/beta/complete` — Complete registration (authenticated)
- `POST /api/auth/login` — Login attempts (public)
- `POST /api/auth/register` — Registration (public)

Reference implementation:
- `PREREUNION_ANDREA/src/lib/rate-limit.ts` — Firestore fixed-window limiter

## Output Contract

### 1. Port rate limiter to Supabase

```typescript
// POC_REAL/src/lib/rate-limit.ts (NEW)
import { createClient } from '@supabase/supabase-js'

interface RateLimitConfig {
  namespace: string
  key: string        // e.g., IP address or email
  limit: number      // max requests
  windowMs: number   // window in milliseconds
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
}

export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  // Use beta_rate_limits table (already exists in schema)
  // Supabase service role client for server-side checks
  // Fixed-window algorithm matching PREREUNION_ANDREA pattern
}
```

### 2. Apply to all public endpoints

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `POST /api/auth/login` | 5 attempts | 15 min | IP |
| `POST /api/auth/register` | 3 attempts | 1 hour | IP + email |
| `POST /api/beta/accept` | 5 attempts | 15 min | IP |
| `POST /api/beta/invite` | 10 invites | 1 hour | admin key |
| `POST /api/beta/complete` | 3 attempts | 15 min | user ID |

### 3. Return standard rate limit headers

```typescript
// Add to all rate-limited responses:
headers.set('X-RateLimit-Limit', String(config.limit))
headers.set('X-RateLimit-Remaining', String(result.remaining))
headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt.getTime() / 1000)))

// When blocked:
return NextResponse.json(
  { error: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
  { status: 429, headers }
)
```

## Quality Gates

- Gate 1: 6th login attempt within 15 min returns 429
- Gate 2: Rate limit headers present on all responses
- Gate 3: Different IPs have independent counters
- Gate 4: Window resets correctly after expiry
- Gate 5: Service role operations (seed, admin) are not rate-limited

## Affected Files

- `POC_REAL/src/lib/rate-limit.ts` (NEW)
- `POC_REAL/src/app/api/auth/login/route.ts`
- `POC_REAL/src/app/api/auth/register/route.ts`
- `POC_REAL/src/app/api/beta/accept/route.ts`
- `POC_REAL/src/app/api/beta/invite/route.ts`
- `POC_REAL/src/app/api/beta/complete/route.ts`
