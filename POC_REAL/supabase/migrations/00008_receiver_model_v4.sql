-- v4 Receiver Model: capsule as transferable gift
-- Decisions: 1:1 receiver, creator loses access on send, 30-day experience TTL
BEGIN;

-- New statuses for receiver lifecycle
ALTER TYPE capsule_status ADD VALUE IF NOT EXISTS 'sent';
ALTER TYPE capsule_status ADD VALUE IF NOT EXISTS 'claimed';
ALTER TYPE capsule_status ADD VALUE IF NOT EXISTS 'experience_active';
ALTER TYPE capsule_status ADD VALUE IF NOT EXISTS 'expiring_soon';

COMMIT;

-- Enum changes require separate transaction
BEGIN;

-- Receiver fields on capsules
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id);
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES users(id);
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS receiver_email TEXT;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS experience_expires_at TIMESTAMPTZ;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS invitation_token_hash TEXT;

-- Video Regalo fields
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS video_regalo_status TEXT DEFAULT 'none'
  CHECK (video_regalo_status IN ('none','generating','preview_ready','paid','delivered','purged'));
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS video_regalo_paid_at TIMESTAMPTZ;
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS video_regalo_url TEXT;

-- Trust contact notification tracking
ALTER TABLE capsules ADD COLUMN IF NOT EXISTS trust_notified_at TIMESTAMPTZ;

-- Backfill creator_id from owner_id for existing capsules
UPDATE capsules SET creator_id = owner_id WHERE creator_id IS NULL;

-- Indexes for receiver queries
CREATE INDEX IF NOT EXISTS idx_capsules_receiver ON capsules(receiver_id);
CREATE INDEX IF NOT EXISTS idx_capsules_receiver_email ON capsules(receiver_email);
CREATE INDEX IF NOT EXISTS idx_capsules_experience_expires ON capsules(experience_expires_at)
  WHERE experience_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_capsules_invitation_token ON capsules(invitation_token_hash)
  WHERE invitation_token_hash IS NOT NULL;

-- Extend designated_persons to all types except social (trust contacts v4)
-- Add notification fields
ALTER TABLE designated_persons ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;
ALTER TABLE designated_persons ADD COLUMN IF NOT EXISTS decision TEXT
  CHECK (decision IN ('claim','download','delete','pending'));
ALTER TABLE designated_persons ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;

-- RLS: receiver can SELECT their claimed capsules
DROP POLICY IF EXISTS capsules_receiver_select ON capsules;
CREATE POLICY capsules_receiver_select
ON capsules FOR SELECT
USING (receiver_id = public.auth_user_internal_id());

-- RLS: receiver can INSERT contents on claimed capsules (Continuar Herencia)
DROP POLICY IF EXISTS contents_receiver_insert ON contents;
CREATE POLICY contents_receiver_insert
ON contents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM capsules
    WHERE capsules.id = contents.capsule_id
      AND capsules.receiver_id = public.auth_user_internal_id()
      AND capsules.status IN ('claimed', 'experience_active')
  )
  AND contents.created_by = public.auth_user_internal_id()
);

-- RLS: receiver can SELECT contents of their capsules
DROP POLICY IF EXISTS contents_receiver_select ON contents;
CREATE POLICY contents_receiver_select
ON contents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM capsules
    WHERE capsules.id = contents.capsule_id
      AND capsules.receiver_id = public.auth_user_internal_id()
  )
);

-- Comments
COMMENT ON COLUMN capsules.creator_id IS 'Original creator (preserved after ownership transfer)';
COMMENT ON COLUMN capsules.receiver_id IS 'Gift recipient (NULL until claimed)';
COMMENT ON COLUMN capsules.experience_expires_at IS 'claimed_at + 30 days — auto-expiry deadline';
COMMENT ON COLUMN capsules.video_regalo_status IS 'Video Regalo pipeline state';
COMMENT ON COLUMN capsules.trust_notified_at IS 'When trust contacts were notified about pending expiry';

COMMIT;
