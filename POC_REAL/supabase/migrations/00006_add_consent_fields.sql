-- Consent tracking for RGPD Art. 7 proof of consent.
BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '2.0',
  ADD COLUMN IF NOT EXISTS consent_source TEXT;

CREATE INDEX IF NOT EXISTS idx_users_consent_version
  ON users(consent_version);

COMMENT ON COLUMN users.terms_accepted_at
  IS 'Timestamp when user accepted Terms of Service (RGPD Art. 7 proof).';
COMMENT ON COLUMN users.privacy_accepted_at
  IS 'Timestamp when user accepted Privacy Policy (RGPD Art. 7 proof).';
COMMENT ON COLUMN users.consent_version
  IS 'Version of legal consent text accepted by the user.';
COMMENT ON COLUMN users.consent_source
  IS 'Acquisition channel where consent was given (signup_email/signup_google/beta_invite/etc).';

COMMIT;
