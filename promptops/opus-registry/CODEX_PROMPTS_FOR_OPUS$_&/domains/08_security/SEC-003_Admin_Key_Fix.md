# Fix Admin Key Exposure in Beta API

## Metadata

- Prompt ID: `PRM-SEC-003`
- Version: `1.0.0`
- Owner: `CTO`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P0 CRITICAL`
- Target App: `POC_REAL`

## Purpose

`/api/beta/invite` validates admin access by comparing `x-admin-key` header against `SUPABASE_SERVICE_ROLE_KEY`. This means the service role key must be sent from the client. If this key is intercepted or leaked, an attacker gains **full unrestricted access** to the entire Supabase database (bypasses RLS).

## Current Vulnerable Code

```typescript
// POC_REAL/src/app/api/beta/invite/route.ts
const adminKey = request.headers.get('x-admin-key')
if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Output Contract

### Option A: Dedicated Admin Secret (Recommended for POC)

1. Create new env var `ADMIN_API_SECRET` — a random 64-char hex string separate from any Supabase key
2. Replace all `x-admin-key` checks with `ADMIN_API_SECRET` comparison
3. Update `.env.local` with new variable
4. Update all beta API routes: `/api/beta/invite`, `/api/beta/revoke`

```typescript
// AFTER fix
const adminKey = request.headers.get('x-admin-key')
if (!adminKey || adminKey !== process.env.ADMIN_API_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
// Server-side operations still use SUPABASE_SERVICE_ROLE_KEY internally
// but the key is NEVER sent from or exposed to the client
```

### Option B: Supabase Auth + Admin Role (Production-grade)

1. Add `role` column to `users` table (`'user' | 'admin'`)
2. Beta routes verify JWT + check `role === 'admin'`
3. No custom header needed
4. More scalable but requires admin user management

### Required Changes

For each file, apply the fix:
- `POC_REAL/src/app/api/beta/invite/route.ts` (POST, GET)
- `POC_REAL/src/app/api/beta/revoke/route.ts` (if exists)
- Any other route using `x-admin-key` pattern

### Also fix: Input validation

While in these files, add Zod validation:
```typescript
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  cohort: z.string().min(1).max(50).optional().default('beta-1'),
})
```

Current code has NO email format validation on the invite endpoint.

## Quality Gates

- Gate 1: `SUPABASE_SERVICE_ROLE_KEY` does NOT appear in any client-side code or request headers
- Gate 2: Beta invite still works with new `ADMIN_API_SECRET`
- Gate 3: Invalid admin key returns 401
- Gate 4: Email validation rejects malformed addresses
- Gate 5: `npm run test:beta` passes

## Verification

1. `grep -r "SUPABASE_SERVICE_ROLE_KEY" src/` — should only appear in server-side lib files, NEVER in route handler comparisons
2. `grep -r "x-admin-key" src/` — all instances updated to use ADMIN_API_SECRET
3. Test: send request with wrong key → 401
4. Test: send request with correct key → 200
