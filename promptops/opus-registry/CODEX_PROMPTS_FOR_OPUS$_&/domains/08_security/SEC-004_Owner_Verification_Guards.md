# Owner Verification on All Capsule Mutations

## Metadata

- Prompt ID: `PRM-SEC-004`
- Version: `1.0.0`
- Owner: `CTO`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P0 CRITICAL`
- Target App: `POC_REAL` + `PREREUNION_ANDREA`

## Purpose

`closeCapsule()`, `updateCapsule()`, `deleteCapsule()`, and `addContent()` perform no owner permission checks. Any authenticated user can mutate any capsule by knowing its ID. This task adds owner verification guards to ALL capsule mutation operations.

## Current Vulnerable Code (POC_REAL)

```typescript
// useCapsules.ts — closeCapsule
const closeCapsule = useCallback(async (id: string) => {
  const { error } = await supabase
    .from('capsules')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id)   // ← NO owner check!
  // ...
})
```

## Output Contract

### 1. Add owner filter to ALL Supabase mutations (POC_REAL)

Every `.update()`, `.delete()`, `.insert()` on `capsules` must include `.eq('owner_id', user.id)`:

```typescript
// AFTER fix — closeCapsule
const closeCapsule = useCallback(async (id: string) => {
  if (!user?.id) return { error: new Error('Not authenticated') }

  const { error } = await supabase
    .from('capsules')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id)  // ← OWNER GUARD
  // ...
})
```

Apply same pattern to:
- `updateCapsule()`
- `deleteCapsule()` (if exists)
- `closeCapsule()`
- Content operations on child tables

### 2. Add state validation before transitions

```typescript
// AFTER fix — closeCapsule with state check
const closeCapsule = useCallback(async (id: string) => {
  if (!user?.id) return { error: new Error('Not authenticated') }

  // Only close if currently 'active'
  const { data: capsule } = await supabase
    .from('capsules')
    .select('status')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!capsule) return { error: new Error('Capsule not found or not yours') }
  if (capsule.status !== 'active') return { error: new Error(`Cannot close capsule in '${capsule.status}' state`) }

  const { error } = await supabase
    .from('capsules')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id)
    .eq('status', 'active')  // Optimistic lock: reject if status changed between read and write

  // ...
})
```

### 3. Add owner check to PREREUNION_ANDREA API routes

In `/api/capsules/route.ts`:
```typescript
// GET — already filters by userId (verify)
// POST — already verifies Bearer token userId (verify)
// Ensure no endpoint allows cross-user access
```

### 4. Add post-closure readonly guard

Create middleware or helper that rejects mutations on closed/expired/archived capsules:

```typescript
function assertCapsuleMutable(status: string): void {
  const immutableStates = ['closed', 'downloaded', 'expired', 'archived']
  if (immutableStates.includes(status)) {
    throw new Error(`Capsule is ${status} and cannot be modified`)
  }
}
```

## Quality Gates

- Gate 1: User A cannot close User B's capsule (returns error)
- Gate 2: Cannot close already-closed capsule (returns state error)
- Gate 3: Cannot upload content to closed capsule
- Gate 4: All existing tests pass
- Gate 5: RLS policies (SEC-002) provide defense-in-depth (belt + suspenders)

## Affected Files

- `POC_REAL/src/hooks/useCapsules.ts` — closeCapsule, updateCapsule, createCapsule
- `POC_REAL/src/hooks/useCapsuleContents.ts` — uploadFile, deleteFile
- `PREREUNION_ANDREA/src/hooks/useCapsules.ts` — all mutations
- `PREREUNION_ANDREA/src/app/api/capsules/route.ts` — GET/POST handlers
