# NUCLEA System Architecture (Current Runtime)

> Effective state date: February 13, 2026.
> This file describes what is currently live/buildable in this repository.

## Runtime Summary

NUCLEA currently runs as two active application tracks:

1. `PREREUNION_ANDREA` (external-facing app): Next.js + Firebase (Auth, Firestore, Storage, Firebase Admin API routes).
2. `POC_INTERNA/app` (internal onboarding PoC): Next.js onboarding flow with local/static assets and quality automation.

Supabase remains part of the target architecture track and backend specification work, but it is not the primary runtime backend for `PREREUNION_ANDREA` today.

- Target reference: `docs/ARCHITECTURE_TARGET_SUPABASE.md`
- Supabase implementation draft: `POC_INTERNA/04_BACKEND/SUPABASE_SCHEMA.sql`

## Effective Source of Truth

### Production/deploy intent
- `PREREUNION_ANDREA/package.json` -> `deploy: vercel --prod`
- `.github/workflows/quality-gates.yml` validates build/typecheck for both apps

### Backend implementation in use
- Client SDK: `PREREUNION_ANDREA/src/lib/firebase.ts`
- Server/API routes: `PREREUNION_ANDREA/src/app/api/**`

## High-Level Architecture (Current)

```text
Frontend (Next.js App Router)
  |- PREREUNION_ANDREA (landing, auth, dashboard, privacy endpoints)
  |- POC_INTERNA/app (P1-P4 onboarding prototype)

Backend Services
  |- Firebase Auth
  |- Cloud Firestore
  |- Firebase Storage
  |- Firebase Admin (server routes)

Deployment and Quality Gates
  |- Vercel deploy command in PREREUNION_ANDREA
  |- GitHub Actions quality-gates workflow
```

## Data and Trust-Critical Flows

### Waitlist + consent
`/api/waitlist` validates consent fields before insert and stores metadata for auditability.

### Data export (DSAR)
`/api/privacy/export` returns authenticated user profile + capsules export payload.

### Account deletion
`/api/privacy/account` deletes user/capsule records and performs best-effort storage object cleanup.

## Known Gaps (Non-Code or Cross-Track)

1. Legal/compliance closure requires external artifacts (Art. 28 DPA evidence and Art. 44 transfer safeguards).
2. Supabase architecture docs previously represented target state; this file now separates current runtime from target architecture.

## Environment Configuration

### Required Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase client SDK |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project identifier |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | PEM private key |
| `CRON_SECRET` | Yes | Secret for cron job authentication |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TRUST_CONTACT_NOTIFY_BEFORE_HOURS` | 720 | Hours before expiry to notify trust contacts (canonical) |
| `TRUST_CONTACT_INACTIVITY_DAYS` | 120 | Legacy fallback (days) — used only if hours var empty |
| `RATE_LIMIT_REQUESTS` | 10 | Requests per window |
| `RATE_LIMIT_WINDOW_MS` | 60000 | Window duration (ms) |

### Cron Jobs

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/lifecycle` | Hourly | Expiry sweep, video purge, trust contact notifications |
| `/api/cron/biometric-cleanup` | Daily | Cleanup expired biometric consent records |

## Trust-State Classification

- Live and normative:
  - `PREREUNION_ANDREA/src/**`
  - `POC_INTERNA/app/src/**`
  - `.github/workflows/quality-gates.yml`
- Aspirational or target:
  - `docs/ARCHITECTURE_TARGET_SUPABASE.md`
  - `POC_INTERNA/04_BACKEND/**`
