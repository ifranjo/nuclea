-- NUCLEA POC_REAL — Lifecycle hardening for gift flow
-- Adds: state machine fields, 30-day clock, purge retry queue, trust notifications, WhatsApp opt-in support.

BEGIN;

-- Capsule lifecycle and video no-retention metadata
ALTER TABLE capsules
  ADD COLUMN IF NOT EXISTS gift_state TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS gift_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS gift_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lifecycle_last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS trust_contacts_notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS video_gift_path TEXT,
  ADD COLUMN IF NOT EXISTS video_downloaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS video_purged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS video_purge_status TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'capsules_gift_state_check'
  ) THEN
    ALTER TABLE capsules
      ADD CONSTRAINT capsules_gift_state_check
      CHECK (gift_state IN (
        'draft',
        'sent',
        'claimed',
        'continued',
        'video_purchased',
        'video_downloaded',
        'video_purged',
        'expired',
        'deleted'
      ));
  END IF;
END $$;

-- Extend designated persons with WhatsApp targeting fields.
ALTER TABLE designated_persons
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_source TEXT;

-- Queue for storage purge retries (idempotent per capsule + idempotency key).
CREATE TABLE IF NOT EXISTS video_purge_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_bucket TEXT NOT NULL DEFAULT 'capsule-contents',
  storage_path TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (capsule_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_video_purge_jobs_status_next
  ON video_purge_jobs(status, next_attempt_at);

-- Notification outbox (provider-agnostic, async senders can drain this table).
CREATE TABLE IF NOT EXISTS notification_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_status_created
  ON notification_outbox(status, created_at);

-- Generic WhatsApp consent table (for user or contact level opt-in).
CREATE TABLE IF NOT EXISTS notification_optins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  contact_ref TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp')),
  opted_in BOOLEAN NOT NULL DEFAULT true,
  source TEXT,
  opted_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (capsule_id, contact_ref, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_optins_capsule_channel
  ON notification_optins(capsule_id, channel);

-- Reuse existing updated_at trigger function for new mutable tables.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'video_purge_jobs_set_updated_at'
  ) THEN
    CREATE TRIGGER video_purge_jobs_set_updated_at
      BEFORE UPDATE ON video_purge_jobs
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'notification_outbox_set_updated_at'
  ) THEN
    CREATE TRIGGER notification_outbox_set_updated_at
      BEFORE UPDATE ON notification_outbox
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'notification_optins_set_updated_at'
  ) THEN
    CREATE TRIGGER notification_optins_set_updated_at
      BEFORE UPDATE ON notification_optins
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

COMMIT;

