-- Fix infinite recursion in RLS policies.
-- Problem: capsules policies query collaborators, which query capsules → loop.
-- Solution: SECURITY DEFINER helper functions that bypass RLS for cross-table checks.
BEGIN;

-- Helper: get current authenticated user's internal (users.id) UUID
CREATE OR REPLACE FUNCTION public.auth_user_internal_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1
$$;

-- Helper: check if current user owns a given capsule
CREATE OR REPLACE FUNCTION public.is_capsule_owner(cap_id uuid)
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

-- Helper: check if current user is a collaborator on a given capsule
CREATE OR REPLACE FUNCTION public.is_capsule_collaborator(cap_id uuid)
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

-- ---- CAPSULES: replace recursive policies ----
DROP POLICY IF EXISTS capsules_owner_all ON capsules;
DROP POLICY IF EXISTS capsules_collaborator_select ON capsules;

CREATE POLICY capsules_owner_all
ON capsules FOR ALL
USING (owner_id = public.auth_user_internal_id())
WITH CHECK (owner_id = public.auth_user_internal_id());

CREATE POLICY capsules_collaborator_select
ON capsules FOR SELECT
USING (public.is_capsule_collaborator(id));

-- ---- CONTENTS: replace recursive policies ----
DROP POLICY IF EXISTS contents_owner_all ON contents;
DROP POLICY IF EXISTS contents_collaborator_select ON contents;

CREATE POLICY contents_owner_all
ON contents FOR ALL
USING (public.is_capsule_owner(capsule_id))
WITH CHECK (
  public.is_capsule_owner(capsule_id)
  AND created_by = public.auth_user_internal_id()
);

CREATE POLICY contents_collaborator_select
ON contents FOR SELECT
USING (public.is_capsule_collaborator(capsule_id));

-- ---- COLLABORATORS: replace recursive policies ----
DROP POLICY IF EXISTS collaborators_owner_all ON collaborators;

CREATE POLICY collaborators_owner_all
ON collaborators FOR ALL
USING (public.is_capsule_owner(capsule_id))
WITH CHECK (public.is_capsule_owner(capsule_id));

-- collaborators_self_select: only queries users → no recursion, leave as-is

-- ---- DESIGNATED PERSONS: replace recursive policies ----
DROP POLICY IF EXISTS designated_persons_owner_all ON designated_persons;

CREATE POLICY designated_persons_owner_all
ON designated_persons FOR ALL
USING (public.is_capsule_owner(capsule_id))
WITH CHECK (public.is_capsule_owner(capsule_id));

-- beta_access_self_select: only queries users → no recursion, leave as-is

COMMIT;
