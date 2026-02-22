-- Trust decision values hardening for manual trust-contact flow.
-- Keep legacy values and add v4 values used by UI/API.

BEGIN;

ALTER TABLE designated_persons
  DROP CONSTRAINT IF EXISTS designated_persons_decision_check;

ALTER TABLE designated_persons
  ADD CONSTRAINT designated_persons_decision_check
  CHECK (
    decision IS NULL OR decision IN (
      'continue',
      'allow-expiration',
      'claim',
      'download',
      'delete',
      'pending'
    )
  );

COMMIT;
