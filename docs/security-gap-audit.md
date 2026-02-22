# NUCLEA Security Gap Audit

Date: 2026-02-22  
Scope: `POC_REAL` and `PREREUNION_ANDREA`

## Current Status

| ID | Priority | Track | Gap | Status | Owner | How to verify |
|---|---|---|---|---|---|---|
| SEC-TC-01 | P0 | POC_REAL | Trust contact identity could point to capsule owner instead of real contact | Done | Backend | `cd POC_REAL && npx tsx --test src/lib/trust/*.test.ts` |
| SEC-TC-02 | P0 | POC_REAL | Trust notification payload missing direct actionable link (`personId`) | Done | Backend | `cd POC_REAL && npx tsx --test src/lib/lifecycle/*.test.ts` |
| SEC-ENV-01 | P0 | POC_REAL | Smoke test had hardcoded Supabase keys | Done | Backend | `cd POC_REAL && node tests/smoke_send_claim.mjs` (with env loaded) |
| SEC-ENV-02 | P0 | POC_REAL | `.env.example` missing operational vars used by scripts | Done | Backend | `cd POC_REAL && rg -n "SEED_IMAGES_DIR|TRUST_CONTACT" .env.example` |
| SEC-CONF-01 | P1 | Cross-track | Inconsistent trust-contact config naming between tracks | Done (compat mode) | Backend | `rg -n "TRUST_CONTACT_NOTIFY_BEFORE_HOURS|TRUST_CONTACT_INACTIVITY_DAYS" POC_REAL PREREUNION_ANDREA` |
| SEC-UX-01 | P1 | POC_REAL | Ambiguous `ComingSoon` markers in critical settings/capsule areas | Done | Frontend | `cd POC_REAL && npm run dev` then review `/settings` and `/capsule/:id` |
| SEC-RLS-01 | P1 | POC_REAL | RLS still disabled intentionally for local velocity | Pending (accepted risk) | Platform | `cd POC_REAL && rg -n "DISABLE ROW LEVEL SECURITY" supabase/migrations/00002_disable_rls.sql` |
| SEC-AUDIT-01 | P2 | Both | Unified security event audit model not centralized yet | Pending | Platform | Review docs + event tables (`notification_outbox`, `beta_audit_log`) |

## Ordering (Execution)

1. P0 trust identity and actionable notifications.
2. P0 secrets/env cleanup.
3. P1 cross-track config harmonization and UX clarity.
4. P1 RLS enablement (only after admin access policy hardening).
5. P2 centralized security audit aggregation.

## Definition Of Done (for this batch)

1. `cd POC_REAL && npx tsx --test src/lib/**/*.test.ts src/lib/lifecycle/*.test.ts src/lib/trust/*.test.ts`
2. `cd POC_REAL && npx tsc --noEmit`
3. `cd POC_REAL && node tests/smoke_send_claim.mjs` (after env setup and seed/reset)
4. `cd PREREUNION_ANDREA && npx tsc --noEmit`
