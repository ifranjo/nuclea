-- Beta Invitation System
-- Supports: invite by email, token-based acceptance, cohort tracking, audit log

BEGIN;

-- Beta invitations
CREATE TABLE beta_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  cohort TEXT NOT NULL DEFAULT 'c1',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT beta_invitations_email_unique UNIQUE (email)
);

-- Beta access (per-user gate)
CREATE TABLE beta_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  cohort TEXT NOT NULL DEFAULT 'c1',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- Audit log for beta events
CREATE TABLE beta_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL CHECK (event IN ('invited', 'accepted', 'revoked', 'login_failed', 'access_granted', 'access_revoked', 'token_expired')),
  email TEXT,
  user_id UUID REFERENCES users(id),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rate limiting for beta accept endpoint
CREATE TABLE beta_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  count INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT beta_rate_limits_key_window UNIQUE (key, window_start)
);

-- Indexes
CREATE INDEX idx_beta_invitations_email ON beta_invitations(email);
CREATE INDEX idx_beta_invitations_token_hash ON beta_invitations(token_hash);
CREATE INDEX idx_beta_invitations_status ON beta_invitations(status);
CREATE INDEX idx_beta_access_user ON beta_access(user_id);
CREATE INDEX idx_beta_access_enabled ON beta_access(enabled);
CREATE INDEX idx_beta_audit_event ON beta_audit_log(event);
CREATE INDEX idx_beta_audit_created ON beta_audit_log(created_at);
CREATE INDEX idx_beta_rate_key ON beta_rate_limits(key);

-- RLS policies for beta_access (controls access to product tables)
-- When RLS is re-enabled on capsules/contents, add:
-- CREATE POLICY "beta_users_only" ON capsules FOR ALL
--   USING (EXISTS (SELECT 1 FROM beta_access WHERE user_id = auth.uid() AND enabled = true));

-- Disable RLS for POC (consistent with 00002)
ALTER TABLE beta_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE beta_access DISABLE ROW LEVEL SECURITY;
ALTER TABLE beta_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE beta_rate_limits DISABLE ROW LEVEL SECURITY;

COMMIT;
