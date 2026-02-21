# AUTO-EXEC-001 — Tech Debt Parallel Batch (Non-Security)

## Metadata
- Prompt ID: `AUTO-EXEC-001`
- Version: `1.0.0`
- Status: `executing`
- Last Updated: `2026-02-21`
- Priority: `P1 HIGH`
- Execution: `Parallel subagents (4 lanes)`

## Purpose

Execute 4 independent tech debt items identified in the architectural audit that are NOT covered by SEC-001 through SEC-008. All are parallelizable — zero file overlap between lanes.

## Lane A: Capsule State Machine Module (POC_REAL)

**Problem:** No formal state machine. Transitions are ad-hoc string assignments. `draft` state defined but never used. No transition validation.

**Deliverable:** `POC_REAL/src/lib/capsule-state-machine.ts`
- Define `CapsuleStatus` enum with all 6 states
- Define `VALID_TRANSITIONS` map (from → allowed to[])
- `transitionCapsule(current, target)` — returns new status or throws
- `canTransition(current, target)` — boolean check
- `getAvailableTransitions(current)` — list of valid next states
- Export `IMMUTABLE_STATES` for post-closure guard reuse
- Unit tests inline with node:test

**State graph:**
```
draft → active
active → closed, archived
closed → downloaded, expired
downloaded → archived
expired → archived
archived → (terminal)
```

## Lane B: API Response Type Contracts (PREREUNION_ANDREA)

**Problem:** All API routes construct JSON inline. No response interfaces. Consumers guess shapes.

**Deliverable:** `PREREUNION_ANDREA/src/types/api.ts`
- `CapsuleResponse` interface (serialized Capsule for JSON)
- `CapsuleListResponse` with pagination metadata
- `CapsuleCreateResponse` with id + message
- `WaitlistResponse` with count
- `BiometricConsentResponse` with consent status
- `ErrorResponse` standard shape
- `PaginationMeta` reusable interface
- Update route handlers to use `NextResponse.json<ResponseType>()`

## Lane C: Environment Examples (Both Apps)

**Problem:** No `.env.example` files. New developers must reverse-engineer env vars from code.

**Deliverables:**
- `PREREUNION_ANDREA/.env.example` — All NEXT_PUBLIC_FIREBASE_* + server-side vars (values blanked)
- `POC_REAL/.env.example` — Supabase URL/keys + BETA_GATE_ENABLED + ADMIN_API_SECRET placeholder
- Add both to `.gitignore` verification (should NOT be gitignored — examples are safe to commit)

## Lane D: Firebase Token Refresh (PREREUNION_ANDREA)

**Problem:** `useCapsules.ts` calls `getAuthToken()` per request but has no refresh logic. Firebase ID tokens expire after 1 hour. Dashboard open >1h → 401 errors → "Error al cargar capsulas".

**Deliverable:** Update `PREREUNION_ANDREA/src/hooks/useCapsules.ts`
- Use `firebaseUser.getIdToken(true)` with force-refresh on 401 retry
- Add retry wrapper: attempt → if 401 → force refresh token → retry once
- Maximum 1 retry to avoid infinite loops

## Execution Order

All 4 lanes execute simultaneously. Zero file conflicts:
- Lane A: only touches `POC_REAL/src/lib/capsule-state-machine.ts` (NEW)
- Lane B: only touches `PREREUNION_ANDREA/src/types/api.ts` (NEW)
- Lane C: only touches `.env.example` files (NEW)
- Lane D: only touches `PREREUNION_ANDREA/src/hooks/useCapsules.ts` (EXISTING)

## Quality Gates
- All files compile: `npx tsc --noEmit` in both apps
- State machine tests pass
- Existing behavior unchanged (no breaking changes)
