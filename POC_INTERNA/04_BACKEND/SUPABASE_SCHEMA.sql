-- NUCLEA - Supabase executable schema draft
-- Scope: users, capsules, collaboration, content, future messages, billing, audit
-- Run in Supabase SQL editor.

BEGIN;

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Drop previous objects (safe re-run)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS check_storage_before_write ON contents;
DROP TRIGGER IF EXISTS content_storage_trigger ON contents;
DROP TRIGGER IF EXISTS users_set_updated_at ON users;
DROP TRIGGER IF EXISTS capsules_set_updated_at ON capsules;
DROP TRIGGER IF EXISTS collaborators_set_updated_at ON collaborators;
DROP TRIGGER IF EXISTS contents_set_updated_at ON contents;
DROP TRIGGER IF EXISTS future_messages_set_updated_at ON future_messages;
DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS designated_persons_set_updated_at ON designated_persons;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS calculate_capsule_storage(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_capsule_storage() CASCADE;
DROP FUNCTION IF EXISTS check_storage_limit() CASCADE;

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS designated_persons CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS future_messages CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS collaborators CASCADE;
DROP TABLE IF EXISTS capsules CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS plan_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS content_type CASCADE;
DROP TYPE IF EXISTS collaborator_role CASCADE;
DROP TYPE IF EXISTS capsule_status CASCADE;
DROP TYPE IF EXISTS capsule_type CASCADE;

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
CREATE TYPE capsule_type AS ENUM (
  'legacy',
  'together',
  'social',
  'pet',
  'life_chapter',
  'origin'
);

CREATE TYPE capsule_status AS ENUM (
  'draft',
  'active',
  'closed',
  'downloaded',
  'expired',
  'archived'
);

CREATE TYPE collaborator_role AS ENUM (
  'owner',
  'editor',
  'viewer'
);

CREATE TYPE content_type AS ENUM (
  'photo',
  'video',
  'audio',
  'text',
  'drawing'
);

CREATE TYPE message_status AS ENUM (
  'scheduled',
  'delivered',
  'downloaded',
  'expired',
  'cancelled'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'past_due',
  'cancelled',
  'expired'
);

CREATE TYPE plan_type AS ENUM (
  'free',
  'esencial',
  'familiar',
  'everlife'
);

-- -----------------------------------------------------------------------------
-- Core tables
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  country_code TEXT DEFAULT 'ES',
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type capsule_type NOT NULL,
  status capsule_status NOT NULL DEFAULT 'draft',
  title TEXT,
  description TEXT,
  cover_image_url TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 524288000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  invite_email TEXT,
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT collaborators_user_or_email_chk
    CHECK (user_id IS NOT NULL OR invite_email IS NOT NULL),
  CONSTRAINT collaborators_unique_member UNIQUE (capsule_id, user_id)
);

CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  file_path TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  text_content TEXT,
  title TEXT,
  description TEXT,
  captured_at TIMESTAMPTZ,
  location JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  chapter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT contents_payload_chk CHECK (
    (type = 'text' AND text_content IS NOT NULL)
    OR
    (type <> 'text' AND file_path IS NOT NULL)
  )
);

CREATE TABLE future_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type content_type NOT NULL,
  encrypted_content BYTEA NOT NULL,
  encryption_key_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  status message_status NOT NULL DEFAULT 'scheduled',
  delivered_at TIMESTAMPTZ,
  download_deadline TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  last_delivery_attempt TIMESTAMPTZ
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan plan_type NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE designated_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  relationship TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  delivery_priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT designated_unique_email_per_capsule UNIQUE (capsule_id, email)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_capsules_owner ON capsules(owner_id);
CREATE INDEX idx_capsules_type ON capsules(type);
CREATE INDEX idx_capsules_status ON capsules(status);

CREATE INDEX idx_collaborators_capsule ON collaborators(capsule_id);
CREATE INDEX idx_collaborators_user ON collaborators(user_id);
CREATE INDEX idx_collaborators_token ON collaborators(invite_token);

CREATE INDEX idx_contents_capsule ON contents(capsule_id);
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_contents_created_at ON contents(created_at);

CREATE INDEX idx_future_messages_capsule ON future_messages(capsule_id);
CREATE INDEX idx_future_messages_scheduled ON future_messages(scheduled_date);
CREATE INDEX idx_future_messages_status ON future_messages(status);
CREATE INDEX idx_future_messages_recipient ON future_messages(recipient_email);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

CREATE INDEX idx_designated_user ON designated_persons(user_id);
CREATE INDEX idx_designated_capsule ON designated_persons(capsule_id);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- -----------------------------------------------------------------------------
-- Utility functions and triggers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER capsules_set_updated_at
BEFORE UPDATE ON capsules
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER collaborators_set_updated_at
BEFORE UPDATE ON collaborators
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER contents_set_updated_at
BEFORE UPDATE ON contents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER future_messages_set_updated_at
BEFORE UPDATE ON future_messages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER designated_persons_set_updated_at
BEFORE UPDATE ON designated_persons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION calculate_capsule_storage(capsule_uuid UUID)
RETURNS BIGINT AS $$
  SELECT COALESCE(SUM(COALESCE(file_size_bytes, 0)), 0)
  FROM contents
  WHERE capsule_id = capsule_uuid
    AND deleted_at IS NULL;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION update_capsule_storage()
RETURNS TRIGGER AS $$
DECLARE
  target_capsule UUID;
BEGIN
  target_capsule := COALESCE(NEW.capsule_id, OLD.capsule_id);

  UPDATE capsules
  SET storage_used_bytes = calculate_capsule_storage(target_capsule),
      updated_at = NOW()
  WHERE id = target_capsule;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_storage_trigger
AFTER INSERT OR UPDATE OR DELETE ON contents
FOR EACH ROW EXECUTE FUNCTION update_capsule_storage();

CREATE OR REPLACE FUNCTION check_storage_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_storage BIGINT;
  storage_limit BIGINT;
  candidate BIGINT;
BEGIN
  IF NEW.file_size_bytes IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT storage_used_bytes, storage_limit_bytes
    INTO current_storage, storage_limit
  FROM capsules
  WHERE id = NEW.capsule_id
  FOR UPDATE;

  IF TG_OP = 'INSERT' THEN
    candidate := current_storage + NEW.file_size_bytes;
  ELSE
    candidate := current_storage - COALESCE(OLD.file_size_bytes, 0) + NEW.file_size_bytes;
  END IF;

  IF candidate > storage_limit THEN
    RAISE EXCEPTION 'Storage limit exceeded for capsule %', NEW.capsule_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_storage_before_write
BEFORE INSERT OR UPDATE ON contents
FOR EACH ROW EXECUTE FUNCTION check_storage_limit();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE designated_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY users_select_own
ON users FOR SELECT
USING (id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY users_insert_own
ON users FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY users_update_own
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- capsules
CREATE POLICY capsules_select_owner_or_collaborator
ON capsules FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM collaborators c
      WHERE c.capsule_id = capsules.id
        AND c.user_id = auth.uid()
        AND c.accepted_at IS NOT NULL
    )
  )
);

CREATE POLICY capsules_insert_owner
ON capsules FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY capsules_update_owner_or_editor
ON capsules FOR UPDATE
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM collaborators c
    WHERE c.capsule_id = capsules.id
      AND c.user_id = auth.uid()
      AND c.accepted_at IS NOT NULL
      AND c.role IN ('owner', 'editor')
  )
)
WITH CHECK (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM collaborators c
    WHERE c.capsule_id = capsules.id
      AND c.user_id = auth.uid()
      AND c.accepted_at IS NOT NULL
      AND c.role IN ('owner', 'editor')
  )
);

CREATE POLICY capsules_delete_owner
ON capsules FOR DELETE
USING (owner_id = auth.uid());

-- collaborators
CREATE POLICY collaborators_select_relevant
ON collaborators FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = collaborators.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

CREATE POLICY collaborators_insert_owner
ON collaborators FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = collaborators.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

CREATE POLICY collaborators_update_owner_or_self
ON collaborators FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = collaborators.capsule_id
      AND cp.owner_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = collaborators.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

CREATE POLICY collaborators_delete_owner
ON collaborators FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = collaborators.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

-- contents
CREATE POLICY contents_select_member
ON contents FOR SELECT
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = contents.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.user_id = auth.uid()
      )
  )
);

CREATE POLICY contents_insert_owner_or_editor
ON contents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = contents.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
  AND created_by = auth.uid()
);

CREATE POLICY contents_update_owner_editor_or_creator
ON contents FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = contents.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
)
WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = contents.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

CREATE POLICY contents_delete_owner_editor_or_creator
ON contents FOR DELETE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = contents.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

-- future_messages
CREATE POLICY future_messages_select_owner_or_editor
ON future_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = future_messages.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

CREATE POLICY future_messages_insert_owner_or_editor
ON future_messages FOR INSERT
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = future_messages.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

CREATE POLICY future_messages_update_owner_or_editor
ON future_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = future_messages.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = future_messages.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

CREATE POLICY future_messages_delete_owner_or_editor
ON future_messages FOR DELETE
USING (
  status = 'scheduled'
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id = future_messages.capsule_id
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

-- subscriptions
CREATE POLICY subscriptions_select_own
ON subscriptions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY subscriptions_insert_own
ON subscriptions FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY subscriptions_update_own
ON subscriptions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- designated_persons
CREATE POLICY designated_persons_select_owner
ON designated_persons FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = designated_persons.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

CREATE POLICY designated_persons_insert_owner
ON designated_persons FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = designated_persons.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

CREATE POLICY designated_persons_update_owner
ON designated_persons FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = designated_persons.capsule_id
      AND cp.owner_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = designated_persons.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

CREATE POLICY designated_persons_delete_owner
ON designated_persons FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM capsules cp
    WHERE cp.id = designated_persons.capsule_id
      AND cp.owner_id = auth.uid()
  )
);

-- audit_logs
CREATE POLICY audit_logs_select_own
ON audit_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY audit_logs_insert_own
ON audit_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Storage buckets + basic policies (optional but convenient)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('capsule-contents', 'capsule-contents', false),
  ('avatars', 'avatars', false),
  ('future-messages', 'future-messages', false),
  ('downloads-temp', 'downloads-temp', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = EXCLUDED.public;

-- Avatars: user manages own file by path "{user_id}/..."
DROP POLICY IF EXISTS avatars_select_own ON storage.objects;
CREATE POLICY avatars_select_own
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS avatars_insert_own ON storage.objects;
CREATE POLICY avatars_insert_own
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS avatars_update_own ON storage.objects;
CREATE POLICY avatars_update_own
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
);

DROP POLICY IF EXISTS avatars_delete_own ON storage.objects;
CREATE POLICY avatars_delete_own
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Capsule contents: members can read, owners/editors can write
DROP POLICY IF EXISTS capsule_contents_select_member ON storage.objects;
CREATE POLICY capsule_contents_select_member
ON storage.objects FOR SELECT
USING (
  bucket_id = 'capsule-contents'
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id::text = split_part(name, '/', 2)
      AND (
        cp.owner_id = auth.uid()
        OR c.user_id = auth.uid()
      )
  )
);

DROP POLICY IF EXISTS capsule_contents_insert_owner_editor ON storage.objects;
CREATE POLICY capsule_contents_insert_owner_editor
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'capsule-contents'
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id::text = split_part(name, '/', 2)
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

DROP POLICY IF EXISTS capsule_contents_update_owner_editor ON storage.objects;
CREATE POLICY capsule_contents_update_owner_editor
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'capsule-contents'
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id::text = split_part(name, '/', 2)
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
)
WITH CHECK (
  bucket_id = 'capsule-contents'
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id::text = split_part(name, '/', 2)
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

DROP POLICY IF EXISTS capsule_contents_delete_owner_editor ON storage.objects;
CREATE POLICY capsule_contents_delete_owner_editor
ON storage.objects FOR DELETE
USING (
  bucket_id = 'capsule-contents'
  AND EXISTS (
    SELECT 1
    FROM capsules cp
    LEFT JOIN collaborators c
      ON c.capsule_id = cp.id
     AND c.user_id = auth.uid()
     AND c.accepted_at IS NOT NULL
    WHERE cp.id::text = split_part(name, '/', 2)
      AND (
        cp.owner_id = auth.uid()
        OR c.role IN ('owner', 'editor')
      )
  )
);

-- future-messages + downloads-temp restricted to service role
DROP POLICY IF EXISTS future_messages_service_only ON storage.objects;
CREATE POLICY future_messages_service_only
ON storage.objects FOR ALL
USING (
  bucket_id = 'future-messages'
  AND auth.role() = 'service_role'
)
WITH CHECK (
  bucket_id = 'future-messages'
  AND auth.role() = 'service_role'
);

DROP POLICY IF EXISTS downloads_temp_service_only ON storage.objects;
CREATE POLICY downloads_temp_service_only
ON storage.objects FOR ALL
USING (
  bucket_id = 'downloads-temp'
  AND auth.role() = 'service_role'
)
WITH CHECK (
  bucket_id = 'downloads-temp'
  AND auth.role() = 'service_role'
);

COMMIT;

