# Generate Supabase TypeScript Types

## Metadata

- Prompt ID: `PRM-SEC-007`
- Version: `1.0.0`
- Owner: `CTO`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P1 HIGH`
- Target App: `POC_REAL`

## Purpose

POC_REAL queries Supabase with `.select('*')` returning untyped results. `Capsule.type` is `string` instead of `CapsuleType`, `Capsule.status` is `string` instead of enum. No compile-time safety for database operations. Supabase provides `supabase gen types` to auto-generate TypeScript types from the database schema.

## Output Contract

### 1. Generate types from running Supabase instance

```bash
cd POC_REAL
npx supabase gen types typescript --local > src/lib/database.types.ts
```

### 2. Create typed Supabase client

```typescript
// POC_REAL/src/lib/supabase-client.ts (UPDATE)
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3. Update hooks to use generated types

In `useCapsules.ts`:
```typescript
// BEFORE
export interface Capsule {
  type: string        // ← loose
  status: string      // ← loose
}

// AFTER — delete manual interface, import from generated types
import type { Database } from '@/lib/database.types'
type Capsule = Database['public']['Tables']['capsules']['Row']
```

Same for: `useAuth.ts`, `useCapsuleContents.ts`, `useDesignatedPersons.ts`

### 4. Add npm script for regeneration

```json
// package.json
{
  "scripts": {
    "db:types": "supabase gen types typescript --local > src/lib/database.types.ts"
  }
}
```

### 5. Add to CI (optional)

Verify types don't drift:
```bash
npx supabase gen types typescript --local | diff - src/lib/database.types.ts
```

## Quality Gates

- Gate 1: `database.types.ts` generated successfully from local Supabase
- Gate 2: All hooks compile without errors using generated types
- Gate 3: `Capsule.type` autocompletes as `'legacy' | 'together' | ...` (not `string`)
- Gate 4: `npx tsc --noEmit` passes
- Gate 5: Runtime behavior unchanged

## Dependencies

- Supabase local must be running (`npx supabase start`)
- Migrations must be applied (`npx supabase db reset`)
