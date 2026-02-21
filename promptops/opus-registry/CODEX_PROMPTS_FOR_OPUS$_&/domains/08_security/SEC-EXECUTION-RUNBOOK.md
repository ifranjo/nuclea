# Security Execution Runbook (SEC-001..SEC-008)

## Metadata

- Owner: `CTO PromptOps`
- Last Updated: `2026-02-21`
- Scope: `PREREUNION_ANDREA` + `POC_REAL`
- Goal: `Execute security prompts with strict ordering, evidence capture, and real verification`

## Locked Order

1. `SEC-001` (independent Firebase lane)
2. `SEC-003 -> SEC-006 -> SEC-002` (strict P0 Supabase dependency lane)
3. `SEC-004` (parallel P0 lane)
4. `SEC-005` (parallel P0 lane)
5. `SEC-007 -> SEC-008` (P1 sequential lane; types before consent fields)

## Why This Order Is Mandatory

1. `SEC-003` before `SEC-002` prevents activating RLS while admin routes still depend on service-role comparison anti-pattern.
2. `SEC-006` before `SEC-002` ensures public attack surface is rate-limited before tighter data policies go live.
3. `SEC-007` before `SEC-008` avoids schema/type drift while adding consent fields.

## Preflight Checklist

1. Confirm repo root: `C:\Users\Kaos\scripts\nuclea`
2. Confirm env files exist and include required secrets:
   - `PREREUNION_ANDREA/.env.local`
   - `POC_REAL/.env.local`
3. Confirm local infra availability:
   - Firebase CLI authenticated (if deploying rules)
   - Docker Desktop running (if using local Supabase)
4. Capture initial baseline:
   - `git status --short`
   - `npm run lint` + `npx tsc --noEmit` in both apps

## Execution Cards (Actionable)

### SEC-001 — Firestore Security Rules (Firebase)

- Prompt: `SEC-001_Firestore_Security_Rules.md`
- Entry: no dependency
- Work:
  1. Ensure `PREREUNION_ANDREA/firestore.rules` is present and owner-scoped.
  2. Ensure `PREREUNION_ANDREA/firebase.json` points to rules file.
  3. (Optional deploy) `cd PREREUNION_ANDREA && npm run firebase:rules:deploy`
- Verify:
  - Read/write access is owner-scoped; server-only collections denied client writes.

### SEC-003 — Admin Key Exposure Fix (POC_REAL)

- Prompt: `SEC-003_Admin_Key_Fix.md`
- Entry: before SEC-006 and SEC-002
- Work:
  1. Replace `SUPABASE_SERVICE_ROLE_KEY` header checks with `ADMIN_API_SECRET`.
  2. Validate input using `zod` on admin beta routes.
- Verify:
  - Invalid `x-admin-key` => `401`
  - Valid `x-admin-key` => success path

### SEC-006 — Rate Limiting (POC_REAL)

- Prompt: `SEC-006_Rate_Limiting_POC_REAL.md`
- Entry: after SEC-003, before SEC-002
- Work:
  1. Apply fixed-window limits on exposed beta/public routes.
  2. Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Verify:
  - Burst test returns `429` and headers.

### SEC-002 — Re-enable Supabase RLS (POC_REAL)

- Prompt: `SEC-002_Supabase_RLS_Enable.md`
- Entry: after SEC-003 and SEC-006
- Work:
  1. Apply RLS migration and policies on all critical tables.
  2. Validate owner/collaborator read/write behavior.
- Verify:
  - Owner access works.
  - Non-owner mutation blocked.

### SEC-004 — Owner Verification Guards (Both Apps)

- Prompt: `SEC-004_Owner_Verification_Guards.md`
- Entry: parallel P0 lane
- Work:
  1. Add owner checks to all capsule/content mutation paths.
  2. Add state validation guards before transitions.
- Verify:
  - Non-owner mutation attempts fail.
  - Invalid transition attempts fail with explicit errors.

### SEC-005 — GDPR Biometric Enforcement (PREREUNION_ANDREA)

- Prompt: `SEC-005_GDPR_Biometric_Enforcement.md`
- Entry: parallel P0 lane
- Work:
  1. Enforce avatar disabled state when consent is withdrawn.
  2. Add daily cleanup cron for 30+ day revoked biometric records.
  3. Include processor deletion retry bookkeeping.
- Verify:
  - Revoked consent blocks avatar usage.
  - Cron unauthorized => `401`; authorized => cleanup summary payload.

### SEC-007 — Supabase Generated Types (POC_REAL)

- Prompt: `SEC-007_Supabase_Generated_Types.md`
- Entry: before SEC-008
- Work:
  1. Generate `src/lib/database.types.ts` from active Supabase schema.
  2. Ensure Supabase clients/hooks use typed DB contract.
- Verify:
  - `npx tsc --noEmit` passes using generated contract.

### SEC-008 — Consent Fields (POC_REAL)

- Prompt: `SEC-008_Consent_Fields_POC_REAL.md`
- Entry: after SEC-007
- Work:
  1. Add consent columns migration.
  2. Persist consent timestamps/version/source at signup and seed.
  3. Enforce Terms/Privacy acceptance in registration UI.
- Verify:
  - New users persist all consent fields.
  - Migration applies cleanly.

## Evidence Bundle (Required per SEC)

For each SEC item, record:

1. Commands run
2. Files changed
3. Gate results (`pass/warn/fail`)
4. Follow-up risk (if any)

## Final Exit Criteria

1. `lint` and `tsc` pass in both apps.
2. Security order respected with no dependency inversion.
3. Deployment/operational prerequisites documented (secrets, Docker/Firebase, cron schedule).
4. Review log updated with execution evidence reference.
