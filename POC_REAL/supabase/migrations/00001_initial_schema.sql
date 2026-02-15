-- NUCLEA POC_REAL — Initial Schema
-- Adapted from POC_INTERNA/04_BACKEND/SUPABASE_SCHEMA.sql
-- RLS disabled for POC simplicity (see 00002)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE capsule_type AS ENUM ('legacy','together','social','pet','life_chapter','origin');
CREATE TYPE capsule_status AS ENUM ('draft','active','closed','downloaded','expired','archived');
CREATE TYPE collaborator_role AS ENUM ('owner','editor','viewer');
CREATE TYPE content_type AS ENUM ('photo','video','audio','text','drawing');

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Capsules
CREATE TABLE capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type capsule_type NOT NULL,
  status capsule_status NOT NULL DEFAULT 'active',
  title TEXT,
  description TEXT,
  cover_image_url TEXT,
  share_token TEXT UNIQUE,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Collaborators
CREATE TABLE collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT collaborators_unique_member UNIQUE (capsule_id, user_id)
);

-- Contents
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  file_path TEXT,
  file_name TEXT,
  file_size_bytes BIGINT,
  mime_type TEXT,
  text_content TEXT,
  title TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Designated Persons
CREATE TABLE designated_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT designated_unique_email_per_capsule UNIQUE (capsule_id, email)
);

-- Indexes
CREATE INDEX idx_capsules_owner ON capsules(owner_id);
CREATE INDEX idx_capsules_share_token ON capsules(share_token);
CREATE INDEX idx_collaborators_capsule ON collaborators(capsule_id);
CREATE INDEX idx_collaborators_user ON collaborators(user_id);
CREATE INDEX idx_contents_capsule ON contents(capsule_id);
CREATE INDEX idx_contents_captured ON contents(captured_at);
CREATE INDEX idx_designated_capsule ON designated_persons(capsule_id);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER capsules_set_updated_at BEFORE UPDATE ON capsules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER contents_set_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('capsule-contents', 'capsule-contents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow all access to storage for POC
CREATE POLICY "public_read" ON storage.objects FOR SELECT USING (bucket_id = 'capsule-contents');
CREATE POLICY "public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'capsule-contents');
CREATE POLICY "public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'capsule-contents');
CREATE POLICY "public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'capsule-contents');

COMMIT;
