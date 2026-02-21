# Supabase RLS — Re-enable & Policy Definition

## Metadata

- Prompt ID: `PRM-SEC-002`
- Version: `1.0.0`
- Owner: `CTO`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P0 CRITICAL`
- Target App: `POC_REAL`

## Purpose

POC_REAL has RLS explicitly disabled via `00002_disable_rls.sql`. All 8 tables are fully open to any authenticated user. A credential leak exposes ALL user data. This task re-enables RLS with proper policies before any real user data enters the system.

## Context

Database tables (8 total):
1. `users` — Profile (owner: self)
2. `capsules` — Capsule metadata (owner: `owner_id`)
3. `contents` — Media files (owner: capsule owner)
4. `collaborators` — Shared access (owner: capsule owner)
5. `designated_persons` — Trust contacts (owner: capsule owner)
6. `beta_invitations` — Admin-only
7. `beta_access` — Admin-only read; user self-read
8. `beta_audit_log` — Admin-only

Current auth pattern:
- Client uses `supabase-js` with anon key
- Middleware calls `getUser()` for auth check
- API routes use service role key for admin operations

## Output Contract

### 1. New migration: `supabase/migrations/00003_enable_rls.sql`

```sql
-- Re-enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE designated_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_audit_log ENABLE ROW LEVEL SECURITY;

-- USERS: self read/write
CREATE POLICY "users_self_select" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_self_update" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_self_insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- CAPSULES: owner + collaborators read; owner write
CREATE POLICY "capsules_owner_all" ON capsules FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "capsules_collab_select" ON capsules FOR SELECT USING (
  EXISTS (SELECT 1 FROM collaborators WHERE capsule_id = capsules.id AND user_id = auth.uid())
);

-- CONTENTS: same as parent capsule
CREATE POLICY "contents_owner_all" ON contents FOR ALL USING (
  EXISTS (SELECT 1 FROM capsules WHERE id = contents.capsule_id AND owner_id = auth.uid())
);
CREATE POLICY "contents_collab_select" ON contents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collaborators c
    JOIN capsules cap ON cap.id = c.capsule_id
    WHERE c.user_id = auth.uid() AND cap.id = contents.capsule_id
  )
);

-- COLLABORATORS: capsule owner manages; self read
CREATE POLICY "collaborators_owner_all" ON collaborators FOR ALL USING (
  EXISTS (SELECT 1 FROM capsules WHERE id = collaborators.capsule_id AND owner_id = auth.uid())
);
CREATE POLICY "collaborators_self_select" ON collaborators FOR SELECT USING (auth.uid() = user_id);

-- DESIGNATED_PERSONS: capsule owner only
CREATE POLICY "designated_capsule_owner" ON designated_persons FOR ALL USING (
  EXISTS (SELECT 1 FROM capsules WHERE id = designated_persons.capsule_id AND owner_id = auth.uid())
);

-- BETA tables: service role only (no anon/authenticated access)
-- No policies = default deny for anon/authenticated (service role bypasses RLS)
```

### 2. Update hooks to handle RLS errors

In `src/hooks/useCapsules.ts`, `useAuth.ts`, `useCapsuleContents.ts`:
- Add error handling for 403/RLS policy violations
- Show user-friendly message instead of raw Supabase error

### 3. Update seed script

`scripts/seed.ts` must use **service role client** (already does via `SUPABASE_SERVICE_ROLE_KEY`). Verify it still works after RLS.

## Quality Gates

- Gate 1: `npx supabase db reset` succeeds with new migration
- Gate 2: `npx tsx scripts/seed.ts` seeds all 5 users successfully
- Gate 3: Login as test user → see ONLY own capsules (not other users')
- Gate 4: Cannot access `/api/capsules` of another user via direct Supabase query
- Gate 5: Admin operations (beta invite, seed) still work via service role

## Verification Steps

1. Read current migration files in `supabase/migrations/`
2. Read all hooks to map every Supabase query (`.from('table').select(...)`)
3. Create RLS policies that match EXACTLY the queries used
4. Test with 2 different users — User A cannot see User B's data
5. Test seed script still works
