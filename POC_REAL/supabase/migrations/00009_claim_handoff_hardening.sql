-- Receiver handoff hardening (Q2 + Q4)
-- Once a capsule is claimed, ownership is transferred to the receiver (1:1 strict model).

BEGIN;

-- Keep creator reference on legacy rows where creator_id was still empty.
UPDATE capsules
SET creator_id = owner_id
WHERE creator_id IS NULL;

-- Backfill receiver/owner consistency for already-claimed rows.
UPDATE capsules
SET receiver_id = owner_id
WHERE gift_claimed_at IS NOT NULL
  AND receiver_id IS NULL;

UPDATE capsules
SET owner_id = receiver_id
WHERE gift_claimed_at IS NOT NULL
  AND receiver_id IS NOT NULL
  AND owner_id <> receiver_id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'capsules_claim_requires_receiver_check'
  ) THEN
    ALTER TABLE capsules
      ADD CONSTRAINT capsules_claim_requires_receiver_check
      CHECK (
        gift_claimed_at IS NULL
        OR receiver_id IS NOT NULL
      )
      NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'capsules_claim_handoff_owner_check'
  ) THEN
    ALTER TABLE capsules
      ADD CONSTRAINT capsules_claim_handoff_owner_check
      CHECK (
        gift_claimed_at IS NULL
        OR owner_id = receiver_id
      )
      NOT VALID;
  END IF;
END $$;

COMMIT;
