# Trust/Privacy Hardening Backlog (Post-P0)

## Scope

Review performed after P0 remediation to identify remaining trust/privacy gaps without changing product behavior.

Evidence reviewed:
- `PREREUNION_ANDREA/src/hooks/useAuth.ts`
- `PREREUNION_ANDREA/src/app/registro/page.tsx`
- `PREREUNION_ANDREA/src/app/login/page.tsx`
- `PREREUNION_ANDREA/src/app/api/waitlist/route.ts`
- `PREREUNION_ANDREA/src/components/WaitlistForm.tsx`
- `PREREUNION_ANDREA/src/hooks/useCapsules.ts`
- `PREREUNION_ANDREA/src/lib/firebase.ts`
- `PREREUNION_ANDREA/src/app/layout.tsx`

## Findings Snapshot

1. Consent persistence exists for registration, but consent provenance is incomplete (no source, policy hash, user-agent, IP).
2. Waitlist still stores personal email without explicit legal-consent fields and supports direct client writes.
3. Data-subject rights (export/delete flows) remain unimplemented in product/API.
4. Capsule deletion removes Firestore document but does not guarantee Storage object deletion.
5. Region intent is declared client-side, but there is no server-side runtime guard for non-EU infra.

## Progress Update

Implemented in current hardening pass:
- Waitlist is now API-first (client no longer writes directly to Firestore).
- Waitlist requires explicit privacy/terms acceptance before insert.
- Waitlist records now persist `consentVersion`, `consentSource`, acceptance timestamps, and request metadata.
- Login view now includes legal links to `/terminos` and `/privacidad`.
- Capsule deletion now performs best-effort Storage cleanup before Firestore delete.
- Added authenticated DSAR export endpoint (`GET /api/privacy/export`) returning user + capsule data.
- Added authenticated account deletion endpoint (`DELETE /api/privacy/account`) for core Firestore + Auth cleanup.
- Added tokenized waitlist unsubscribe endpoint (`GET/POST /api/waitlist/unsubscribe`).

## P1/P2 Backlog

| Priority | Severity | Gap | Evidence | File Target | Done Criteria |
|---|---|---|---|---|---|
| P1 | High | Waitlist consent not captured | `src/components/WaitlistForm.tsx:23-28`, `src/app/api/waitlist/route.ts:48-53` | `src/components/WaitlistForm.tsx`, `src/app/api/waitlist/route.ts`, `src/types/index.ts` | Waitlist record includes `privacyAcceptedAt`, `consentVersion`, `consentSource`; backend validates consent before insert |
| P1 | High | Client-side bypass for waitlist governance | `src/components/WaitlistForm.tsx:23-28` writes directly to Firestore | `src/components/WaitlistForm.tsx`, `src/app/api/waitlist/route.ts` | Client submit goes through API only; Firestore security rules/documentation updated accordingly |
| P1 | High | Data deletion incomplete for media assets | `src/hooks/useCapsules.ts:114` deletes Firestore doc only | `src/hooks/useCapsules.ts`, server API layer for storage cleanup | Capsule delete removes Firestore + associated Storage files with auditable result |
| P1 | High | Data-subject rights flows missing (access/erasure/portability) | No user-facing/export endpoint references in `src/app` and `src/app/api` | New settings route(s) + API handlers | User can request export and account deletion; request lifecycle tracked |
| P1 | Medium | Consent provenance missing for auth sign-up | `src/hooks/useAuth.ts:73-83`, `src/hooks/useAuth.ts:120-129` | `src/hooks/useAuth.ts`, `src/types/index.ts` | Persist `consentSource`, `consentVersion`, and signed-at semantics consistently for email/Google |
| P2 | Medium | Login flow lacks legal context links | `src/app/login/page.tsx` (no links to `/terminos` and `/privacidad`) | `src/app/login/page.tsx` | Login screen includes legal links and explicit copy for returning/new OAuth users |
| P2 | Medium | No unsubscribe/withdrawal automation for waitlist | `src/app/api/waitlist/route.ts` exposes create/count only | `src/app/api/waitlist/route.ts`, future `/api/waitlist/unsubscribe` | Tokenized unsubscribe endpoint and record-level opt-out status |
| P2 | Medium | EU region intent not enforced server-side | `src/lib/firebase.ts:6-23` warns only in non-prod | `src/lib/firebase.ts`, server boot validation docs | Production fails-fast (or alerts) when configured region diverges from EU baseline |
| P2 | Low | Global metadata lacks legal canonical/organization policy references | `src/app/layout.tsx:26-40` generic metadata only | `src/app/layout.tsx`, legal page metadata blocks | Legal pages include canonical URLs + policy version metadata for traceability |

## Recommended Execution Order

1. P1 consent + waitlist governance (`waitlist` API and client path).
2. P1 data lifecycle (`capsule` delete integrity + DSAR endpoints).
3. P2 legal UX and metadata hardening.
4. P2 operational controls (unsubscribe + EU-region enforcement).
