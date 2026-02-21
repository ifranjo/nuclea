# Add Consent Fields to POC_REAL Users Table

## Metadata

- Prompt ID: `PRM-SEC-008`
- Version: `1.0.0`
- Owner: `CTO`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P1 HIGH`
- Target App: `POC_REAL`
- Legal: `Art. 7 RGPD — Proof of consent`

## Purpose

POC_REAL's `users` table has no consent tracking fields. When migrating from Firebase to Supabase, consent timestamps (`termsAcceptedAt`, `privacyAcceptedAt`, `consentVersion`) will be lost. Art. 7 RGPD requires the controller to prove consent was given with a timestamp.

PREREUNION_ANDREA stores these fields in the Firestore `users/{uid}` document. POC_REAL must have equivalent fields.

## Output Contract

### 1. Migration: `supabase/migrations/00004_add_consent_fields.sql`

```sql
-- Consent tracking (RGPD Art. 7 compliance)
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '2.0';
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_source TEXT; -- 'signup_email' | 'signup_google' | 'beta_invite'

-- Index for consent audit queries
CREATE INDEX IF NOT EXISTS idx_users_consent_version ON users(consent_version);

-- Comment for schema documentation
COMMENT ON COLUMN users.terms_accepted_at IS 'Timestamp when user accepted Terms of Service (RGPD Art. 7)';
COMMENT ON COLUMN users.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy (RGPD Art. 7)';
COMMENT ON COLUMN users.consent_version IS 'Version of consent text accepted (currently 2.0)';
COMMENT ON COLUMN users.consent_source IS 'Channel through which consent was given';
```

### 2. Update registration flow

In `src/app/api/auth/register/route.ts` (or hook):
```typescript
// After successful Supabase auth signup, persist consent
await supabase.from('users').update({
  terms_accepted_at: new Date().toISOString(),
  privacy_accepted_at: new Date().toISOString(),
  consent_version: '2.0',
  consent_source: 'signup_email',  // or 'beta_invite'
}).eq('id', user.id)
```

### 3. Update registration UI

Registration form must include:
- Checkbox: "Acepto los Términos de Servicio" (required)
- Checkbox: "Acepto la Política de Privacidad" (required)
- Both must be checked before submit is enabled
- Timestamp captured at click, not at page load

### 4. Update seed script

`scripts/seed.ts` should set consent fields for test users:
```typescript
terms_accepted_at: new Date().toISOString(),
privacy_accepted_at: new Date().toISOString(),
consent_version: '2.0',
consent_source: 'seed_script',
```

### 5. Align type system

Update `POC_REAL/src/types/index.ts` or generated types to include consent fields.

## Quality Gates

- Gate 1: `npx supabase db reset` applies migration successfully
- Gate 2: Registration stores all 4 consent fields
- Gate 3: Seed users have consent fields populated
- Gate 4: Dashboard can query `consent_version` for future version bumps
- Gate 5: `SELECT * FROM users WHERE consent_version IS NULL` returns 0 rows after seed

## Dependencies

- Depends on SEC-002 (RLS) — consent fields need same user-self policy
- Should run AFTER SEC-007 (generated types) to get new columns in TypeScript
