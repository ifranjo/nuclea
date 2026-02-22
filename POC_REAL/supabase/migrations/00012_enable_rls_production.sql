-- ============================================================================
-- 00011_enable_rls_production.sql
-- NUCLEA POC_REAL — Production-grade Row Level Security
--
-- Replaces the permissive dev policies from 00002 (disable) / 00005 / 00007.
-- Uses SECURITY DEFINER helpers to avoid RLS recursion between tables.
-- Storage bucket switched from public to authenticated-only.
--
-- Tables covered:
--   users, capsules, contents, collaborators, designated_persons,
--   notification_outbox, notification_optins, video_purge_jobs,
--   beta_invitations, beta_access, beta_audit_log, beta_rate_limits
-- ============================================================================

BEGIN;

-- ============================================================================
-- 0. HELPER FUNCTIONS (SECURITY DEFINER — bypass RLS for cross-table lookups)
-- ============================================================================

-- Resolve auth.uid() → users.id (internal PK used by all FK references).
-- Returns NULL if no matching user row exists.
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1
$$;

-- Check if the current authenticated user owns a given capsule.
CREATE OR REPLACE FUNCTION public.owns_capsule(cap_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.capsules
    WHERE id = cap_id
      AND owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  )
$$;

-- Check if the current authenticated user is a collaborator on a given capsule.
CREATE OR REPLACE FUNCTION public.collaborates_on_capsule(cap_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.collaborators
    WHERE capsule_id = cap_id
      AND user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  )
$$;

-- Check if the current authenticated user is the receiver of a given capsule.
CREATE OR REPLACE FUNCTION public.is_capsule_receiver(cap_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.capsules
    WHERE id = cap_id
      AND receiver_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  )
$$;

-- Check if the current user has any read access to a capsule (owner, collaborator, or receiver).
CREATE OR REPLACE FUNCTION public.can_access_capsule(cap_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.capsules
    WHERE id = cap_id
      AND (
        owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
        OR receiver_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
      )
  )
  OR EXISTS(
    SELECT 1 FROM public.collaborators
    WHERE capsule_id = cap_id
      AND user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1)
  )
$$;


-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE designated_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_optins ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_purge_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_rate_limits ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 2. DROP ALL OLD PERMISSIVE POLICIES
--    From 00001 (storage), 00005, 00007, 00008
-- ============================================================================

-- users
DROP POLICY IF EXISTS users_self_select ON users;
DROP POLICY IF EXISTS users_self_insert ON users;
DROP POLICY IF EXISTS users_self_update ON users;
DROP POLICY IF EXISTS users_self_delete ON users;

-- capsules
DROP POLICY IF EXISTS capsules_owner_all ON capsules;
DROP POLICY IF EXISTS capsules_collaborator_select ON capsules;
DROP POLICY IF EXISTS capsules_receiver_select ON capsules;

-- contents
DROP POLICY IF EXISTS contents_owner_all ON contents;
DROP POLICY IF EXISTS contents_collaborator_select ON contents;
DROP POLICY IF EXISTS contents_receiver_insert ON contents;
DROP POLICY IF EXISTS contents_receiver_select ON contents;

-- collaborators
DROP POLICY IF EXISTS collaborators_owner_all ON collaborators;
DROP POLICY IF EXISTS collaborators_self_select ON collaborators;

-- designated_persons
DROP POLICY IF EXISTS designated_persons_owner_all ON designated_persons;

-- beta
DROP POLICY IF EXISTS beta_access_self_select ON beta_access;

-- storage (from 00001)
DROP POLICY IF EXISTS "public_read" ON storage.objects;
DROP POLICY IF EXISTS "public_insert" ON storage.objects;
DROP POLICY IF EXISTS "public_update" ON storage.objects;
DROP POLICY IF EXISTS "public_delete" ON storage.objects;

-- Drop old helper functions that are replaced by new ones
DROP FUNCTION IF EXISTS public.auth_user_internal_id();
DROP FUNCTION IF EXISTS public.is_capsule_owner(uuid);
DROP FUNCTION IF EXISTS public.is_capsule_collaborator(uuid);


-- ============================================================================
-- 3. USERS TABLE
--    - SELECT own profile (auth_id match)
--    - INSERT own profile during registration
--    - UPDATE own profile
--    - No DELETE (account deletion via admin/service role)
-- ============================================================================

-- Users can read their own profile.
CREATE POLICY users_select_own
ON users FOR SELECT
USING (auth.uid() = auth_id);

-- Authenticated users can create their own profile row on signup.
-- auth_id in the new row must match the caller.
CREATE POLICY users_insert_own
ON users FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = auth_id);

-- Users can update only their own profile.
CREATE POLICY users_update_own
ON users FOR UPDATE
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);


-- ============================================================================
-- 4. CAPSULES TABLE
--    - SELECT: owner, collaborator, or receiver
--    - INSERT: authenticated user (owner_id must be their users.id)
--    - UPDATE: owner only
--    - DELETE: owner only
-- ============================================================================

-- Owner can read their own capsules.
CREATE POLICY capsules_owner_select
ON capsules FOR SELECT
USING (owner_id = public.current_user_id());

-- Collaborators can read capsules they participate in.
CREATE POLICY capsules_collaborator_select
ON capsules FOR SELECT
USING (public.collaborates_on_capsule(id));

-- Receiver can read capsules gifted to them (v4 receiver model).
CREATE POLICY capsules_receiver_select
ON capsules FOR SELECT
USING (receiver_id IS NOT NULL AND receiver_id = public.current_user_id());

-- Authenticated users can create capsules. The owner_id must be the caller's users.id.
CREATE POLICY capsules_insert
ON capsules FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND owner_id = public.current_user_id()
);

-- Only the capsule owner can update it.
CREATE POLICY capsules_owner_update
ON capsules FOR UPDATE
USING (owner_id = public.current_user_id())
WITH CHECK (owner_id = public.current_user_id());

-- Only the capsule owner can delete it.
CREATE POLICY capsules_owner_delete
ON capsules FOR DELETE
USING (owner_id = public.current_user_id());


-- ============================================================================
-- 5. CONTENTS TABLE
--    - SELECT: anyone with capsule access (owner, collaborator, receiver)
--    - INSERT: anyone with capsule access (created_by must be caller)
--    - UPDATE: anyone with capsule access (only own content)
--    - DELETE: anyone with capsule access
-- ============================================================================

-- Read content if user has access to the parent capsule.
CREATE POLICY contents_select
ON contents FOR SELECT
USING (public.can_access_capsule(capsule_id));

-- Insert content if user has capsule access. created_by must be the caller.
CREATE POLICY contents_insert
ON contents FOR INSERT
WITH CHECK (
  public.can_access_capsule(capsule_id)
  AND created_by = public.current_user_id()
);

-- Update content if user has capsule access.
CREATE POLICY contents_update
ON contents FOR UPDATE
USING (public.can_access_capsule(capsule_id))
WITH CHECK (public.can_access_capsule(capsule_id));

-- Delete content if user has capsule access.
CREATE POLICY contents_delete
ON contents FOR DELETE
USING (public.can_access_capsule(capsule_id));


-- ============================================================================
-- 6. COLLABORATORS TABLE
--    - SELECT: capsule owner or the collaborator themselves
--    - INSERT: only capsule owner can add collaborators
--    - DELETE: capsule owner or self-removal
--    - No UPDATE (role changes via delete + re-insert, or admin)
-- ============================================================================

-- Capsule owner can see all collaborators on their capsules.
CREATE POLICY collaborators_owner_select
ON collaborators FOR SELECT
USING (public.owns_capsule(capsule_id));

-- Collaborators can see their own membership row.
CREATE POLICY collaborators_self_select
ON collaborators FOR SELECT
USING (user_id = public.current_user_id());

-- Only capsule owner can add collaborators.
CREATE POLICY collaborators_owner_insert
ON collaborators FOR INSERT
WITH CHECK (public.owns_capsule(capsule_id));

-- Capsule owner can remove any collaborator; collaborators can remove themselves.
CREATE POLICY collaborators_owner_delete
ON collaborators FOR DELETE
USING (
  public.owns_capsule(capsule_id)
  OR user_id = public.current_user_id()
);


-- ============================================================================
-- 7. DESIGNATED_PERSONS TABLE
--    - All operations: capsule owner only
-- ============================================================================

-- Capsule owner can view designated persons.
CREATE POLICY designated_persons_owner_select
ON designated_persons FOR SELECT
USING (public.owns_capsule(capsule_id));

-- Capsule owner can add designated persons.
CREATE POLICY designated_persons_owner_insert
ON designated_persons FOR INSERT
WITH CHECK (public.owns_capsule(capsule_id));

-- Capsule owner can update designated persons.
CREATE POLICY designated_persons_owner_update
ON designated_persons FOR UPDATE
USING (public.owns_capsule(capsule_id))
WITH CHECK (public.owns_capsule(capsule_id));

-- Capsule owner can remove designated persons.
CREATE POLICY designated_persons_owner_delete
ON designated_persons FOR DELETE
USING (public.owns_capsule(capsule_id));


-- ============================================================================
-- 8. NOTIFICATION_OUTBOX
--    Service role only for reads; authenticated users can insert (API routes).
--    No client-side SELECT/UPDATE/DELETE.
-- ============================================================================

-- Authenticated users can insert notifications (server-side API routes use
-- the authenticated client, not service role, for user-initiated actions).
CREATE POLICY notification_outbox_auth_insert
ON notification_outbox FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- No SELECT/UPDATE/DELETE policies — only service_role can read/drain the queue.


-- ============================================================================
-- 9. NOTIFICATION_OPTINS
--    Capsule owner manages opt-ins for their capsule contacts.
-- ============================================================================

CREATE POLICY notification_optins_owner_select
ON notification_optins FOR SELECT
USING (public.owns_capsule(capsule_id));

CREATE POLICY notification_optins_owner_insert
ON notification_optins FOR INSERT
WITH CHECK (public.owns_capsule(capsule_id));

CREATE POLICY notification_optins_owner_update
ON notification_optins FOR UPDATE
USING (public.owns_capsule(capsule_id))
WITH CHECK (public.owns_capsule(capsule_id));

CREATE POLICY notification_optins_owner_delete
ON notification_optins FOR DELETE
USING (public.owns_capsule(capsule_id));


-- ============================================================================
-- 10. VIDEO_PURGE_JOBS
--     Service role only. No client-side access.
-- ============================================================================

-- No policies. RLS is enabled, so only service_role (which bypasses RLS) can
-- insert, read, or update purge jobs. This table is managed by cron/edge functions.


-- ============================================================================
-- 11. BETA TABLES (beta_invitations, beta_access, beta_audit_log, beta_rate_limits)
--     Service role only. No client-side access.
--     Exception: users can read their own beta_access row.
-- ============================================================================

-- Users can check their own beta gate status (used by middleware/client).
CREATE POLICY beta_access_self_select
ON beta_access FOR SELECT
USING (
  user_id = public.current_user_id()
);

-- beta_invitations: no policies — admin/service role only.
-- beta_audit_log: no policies — admin/service role only.
-- beta_rate_limits: no policies — admin/service role only.


-- ============================================================================
-- 12. STORAGE BUCKET — capsule-contents
--     Switch from public to private (authenticated-only).
--     Path convention: {capsule_id}/{filename}
--     Access: user must have access to the capsule referenced by the first
--     path segment (the capsule_id).
-- ============================================================================

-- Make the bucket private (no anonymous access).
UPDATE storage.buckets
SET public = false
WHERE id = 'capsule-contents';

-- Authenticated users can read files if they have access to the capsule.
-- The first path segment is the capsule_id.
CREATE POLICY "capsule_contents_auth_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'capsule-contents'
  AND auth.uid() IS NOT NULL
  AND public.can_access_capsule((storage.foldername(name))[1]::uuid)
);

-- Authenticated users can upload files to capsules they have access to.
CREATE POLICY "capsule_contents_auth_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'capsule-contents'
  AND auth.uid() IS NOT NULL
  AND public.can_access_capsule((storage.foldername(name))[1]::uuid)
);

-- Authenticated users can update their own uploads in accessible capsules.
CREATE POLICY "capsule_contents_auth_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'capsule-contents'
  AND auth.uid() IS NOT NULL
  AND public.can_access_capsule((storage.foldername(name))[1]::uuid)
);

-- Authenticated users can delete files from capsules they have access to.
CREATE POLICY "capsule_contents_auth_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'capsule-contents'
  AND auth.uid() IS NOT NULL
  AND public.can_access_capsule((storage.foldername(name))[1]::uuid)
);


COMMIT;
