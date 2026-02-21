-- Re-enable Row Level Security with owner/collaborator policies.
BEGIN;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE designated_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_rate_limits ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- USERS: self access via auth_id
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS users_self_select ON users;
DROP POLICY IF EXISTS users_self_insert ON users;
DROP POLICY IF EXISTS users_self_update ON users;
DROP POLICY IF EXISTS users_self_delete ON users;

CREATE POLICY users_self_select
ON users FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = auth_id);

CREATE POLICY users_self_insert
ON users FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = auth_id);

CREATE POLICY users_self_update
ON users FOR UPDATE
USING (auth.uid() IS NOT NULL AND auth.uid() = auth_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = auth_id);

CREATE POLICY users_self_delete
ON users FOR DELETE
USING (auth.uid() IS NOT NULL AND auth.uid() = auth_id);

-- ---------------------------------------------------------------------------
-- CAPSULES: owner full access + collaborator read
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS capsules_owner_all ON capsules;
DROP POLICY IF EXISTS capsules_collaborator_select ON capsules;

CREATE POLICY capsules_owner_all
ON capsules FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = capsules.owner_id
      AND u.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = capsules.owner_id
      AND u.auth_id = auth.uid()
  )
);

CREATE POLICY capsules_collaborator_select
ON capsules FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM collaborators c
    JOIN users u ON u.id = c.user_id
    WHERE c.capsule_id = capsules.id
      AND u.auth_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- CONTENTS: owner full access + collaborator read
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS contents_owner_all ON contents;
DROP POLICY IF EXISTS contents_collaborator_select ON contents;

CREATE POLICY contents_owner_all
ON contents FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM capsules cap
    JOIN users u ON u.id = cap.owner_id
    WHERE cap.id = contents.capsule_id
      AND u.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM capsules cap
    JOIN users u ON u.id = cap.owner_id
    WHERE cap.id = contents.capsule_id
      AND u.auth_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1
    FROM users u2
    WHERE u2.id = contents.created_by
      AND u2.auth_id = auth.uid()
  )
);

CREATE POLICY contents_collaborator_select
ON contents FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM collaborators c
    JOIN users u ON u.id = c.user_id
    WHERE c.capsule_id = contents.capsule_id
      AND u.auth_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- COLLABORATORS: owner manages + self read
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS collaborators_owner_all ON collaborators;
DROP POLICY IF EXISTS collaborators_self_select ON collaborators;

CREATE POLICY collaborators_owner_all
ON collaborators FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM capsules cap
    JOIN users u ON u.id = cap.owner_id
    WHERE cap.id = collaborators.capsule_id
      AND u.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM capsules cap
    JOIN users u ON u.id = cap.owner_id
    WHERE cap.id = collaborators.capsule_id
      AND u.auth_id = auth.uid()
  )
);

CREATE POLICY collaborators_self_select
ON collaborators FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = collaborators.user_id
      AND u.auth_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- DESIGNATED PERSONS: owner only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS designated_persons_owner_all ON designated_persons;

CREATE POLICY designated_persons_owner_all
ON designated_persons FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM capsules cap
    JOIN users u ON u.id = cap.owner_id
    WHERE cap.id = designated_persons.capsule_id
      AND u.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM capsules cap
    JOIN users u ON u.id = cap.owner_id
    WHERE cap.id = designated_persons.capsule_id
      AND u.auth_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- BETA ACCESS: user can only read their own gate status.
-- Invitations/audit/rate-limit remain service-role only (no client policy).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS beta_access_self_select ON beta_access;

CREATE POLICY beta_access_self_select
ON beta_access FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = beta_access.user_id
      AND u.auth_id = auth.uid()
  )
);

COMMIT;
