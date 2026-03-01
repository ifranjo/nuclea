# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| Task | Command |
|------|---------|
| Run production app | `cd PREREUNION_ANDREA && npm run dev` (port 3000) |
| Run POC UI | `cd POC_INTERNA/app && npm run dev` (port 3001) |
| Run POC Real | `cd POC_REAL && npx supabase start && npm run dev` (port 3002) |
| Run unit tests (prod) | `cd PREREUNION_ANDREA && npm run test:unit` |
| Run unit tests (POC Real) | `cd POC_REAL && npx tsx --test src/lib/**/*.test.ts src/lib/lifecycle/*.test.ts src/lib/trust/*.test.ts` |
| Run E2E tests | `cd POC_REAL && npm run test:e2e` (needs dev server on :3002) |
| Lint | `npm run lint` (per app) |
| Typecheck | `npx tsc --noEmit` (per app) |
| Build verify | `npx next build` (per app, all build clean) |
| Regen DB types | `cd POC_REAL && npm run db:types` |

## Project Overview

**NUCLEA** is a Spanish digital legacy platform for creating memory capsules with optional AI avatars. The capsule is a **physical emotional object** that opens and releases memories (floating polaroids) — this is a digital ritual, NOT a file-management app. After capsule closure: download locally, delete from server, zero ongoing storage cost.

**Status:** Pre-seed, seeking €150K funding | **All content under NDA.**

## Three Applications

| | Production (`PREREUNION_ANDREA/`) | POC UI (`POC_INTERNA/app/`) | POC Real (`POC_REAL/`) |
|---|---|---|---|
| **Port** | 3000 | 3001 | 3002 |
| **Theme** | Dark (`#0D0D12`) | White (`#FFFFFF`) | White (`#FFFFFF`) |
| **Backend** | Firebase (Auth, Firestore, Storage) | None (pure UI) | Supabase local (Docker) |
| **Next.js** | 16.1.4 | 15.1.0+ | 15.1.0+ |
| **React** | 18 | 19 | 19 |
| **Body Font** | DM Sans | Inter | Inter |
| **State** | Zustand + hooks | useState only | React hooks + useRef |
| **ESLint** | Flat config (`eslint.config.mjs`) | JSON (`.eslintrc.json`) | JSON (`.eslintrc.json`) |

Each app has its own `CLAUDE.md` with app-specific architecture, types, design tokens, and environment variables.

## Development Commands

### Production App (PREREUNION_ANDREA)

```bash
cd PREREUNION_ANDREA && npm install
npm run dev                    # localhost:3000
npm run build                  # Production build (Turbopack)
npm run lint                   # ESLint
npm run test:unit              # Unit tests (tsx --test src/lib/*.test.ts)
npm run test:e2e               # Playwright E2E suite
npm run smoke:routes           # Runtime route smoke tests (9 routes)
npm run smoke:routes:ci        # Build + smoke tests (CI mode)
npm run check:ontology         # Capsule type drift detection
npm run quality:prm-008        # Lighthouse audit
npm run quality:prm-008:full   # Full quality suite (Lighthouse + bundle)
npm run deploy                 # Vercel deploy (--prod)
npx tsc --noEmit               # Typecheck
# Bundle analysis:
$env:ANALYZE='true'; npx next build --webpack
```

### POC App — UI only (POC_INTERNA/app)

```bash
cd POC_INTERNA/app && npm install
npm run dev                    # localhost:3001
npm run build                  # Production build
npm run lint                   # ESLint
npm run autocheck              # Lint + build + runtime flow + PDF alignment
npm run autocheck:pdf          # PDF alignment check only
npm run heal:session           # Stop on first successful autocheck
npm run heal:stability         # 3 full autocheck iterations
npm run heal:insights          # Rebuild trend data from healing history
npx tsc --noEmit               # Typecheck
```

Visual regression tests (requires dev server on :3001):
```bash
python tests/test_onboarding_visual.py    # 28 assertions, P1-P4 + design system
node screenshots/capture_onboarding.js    # Playwright screenshot capture
```

### POC Real — Supabase backend (POC_REAL)

```bash
cd POC_REAL && npm install
npx supabase start             # Docker must be running
npx supabase db reset           # Apply all 12 migrations
npm run seed                   # Seed 5 test users + capsules + images
npx tsx scripts/seed-beta.ts    # Grant beta access to test users
npm run dev                    # localhost:3002
# Supabase Studio: http://localhost:54323
# Inbucket (email testing): http://localhost:54324

# Testing
npm run test:e2e               # Playwright E2E suite (5 spec files)
npm run test:e2e:headed        # E2E with visible browser
npm run test:e2e:ui            # Playwright UI mode
npm run test:ceo               # CEO bug verification tests
npm run test:beta              # Beta QA tests
npm run test:upload            # Upload flow e2e tests
npm run test:send-claim        # Smoke send/claim flow
npm run test:health            # Healthcheck
npm run test:install           # Install Playwright Chromium

# Soak testing (Windows PowerShell)
npm run soak:dry-run           # 6-minute soak test
npm run soak:10h               # 10-hour soak runner
npm run soak:20h               # 20-hour soak runner

# Schema
npm run db:types               # Regen src/lib/database.types.ts from local schema
npm run typecheck              # tsc --noEmit
```

## CI Pipeline

`.github/workflows/quality-gates.yml` runs on push to `master`/`main`, PRs, and `workflow_dispatch`:

1. **docs-governance** — `node docs/scripts/check-source-of-truth-coverage.mjs`
2. **prereunion-quality** — lint → typecheck → ontology drift → build (Turbopack) → smoke routes → bundle analysis (Webpack)
3. **poc-quality** — lint → typecheck → build (POC_INTERNA)
4. **poc-real-quality** — lint → typecheck → unit tests → build (POC_REAL)
5. **poc-real-smoke-stack** — starts Supabase Docker stack, resets DB, seeds, starts app, runs `smoke_send_claim.mjs` (depends on poc-real-quality)

Node 20, `npm ci` for installs.

## Code Style

- TypeScript `strict` mode; explicit types at module boundaries
- 2-space indentation, single quotes, no semicolons in TS/TSX
- `@/*` path alias → `./src/*` in all apps
- Components: `PascalCase.tsx`, hooks: `useX.ts`, API routes: `src/app/api/**/route.ts`
- Commits: Conventional Commits — `feat(scope):`, `fix(scope):`, `chore(scope):`, `test(scope):`

## Architecture

### Type System (`src/types/index.ts`)

Shared across all apps. Single source of truth for:
- `CapsuleType`: `'legacy' | 'together' | 'social' | 'pet' | 'life-chapter' | 'origin'`
- `StoredCapsuleType`: includes `'everlife'` as backward-compat alias → normalize to `'legacy'`
- `CAPSULE_TYPE_VALUES`: readonly array (single source of truth)
- Type guards: `isCapsuleType()`, `isMigratedCapsuleType()`
- `normalizeCapsuleType()`: default fallback is `'legacy'` (NOT `'life-chapter'`)
- `CURRENT_CONSENT_VERSION = '2.0'`

### State Management

- **PREREUNION_ANDREA**: `useAppStore` (Zustand) for UI state + `useAuth`/`useCapsules` hooks for Firebase subscriptions
- **POC_INTERNA**: Local `useState` only
- **POC_REAL**: React hooks + `useRef(createClient())` for Supabase client stability

### API Validation

PREREUNION_ANDREA uses Zod schemas (`src/lib/api-validation.ts`) on all API routes. Rate limiting via Firestore fixed-window (`src/lib/rate-limit.ts`). Capsule pagination is cursor-based (`src/lib/capsule-pagination.ts`).

### Key API Routes (PREREUNION_ANDREA)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/consent/biometric` | POST/GET/DELETE | Bearer | Sign/check/revoke biometric consent |
| `/api/capsules` | GET/POST | Bearer | List/create capsules |
| `/api/waitlist` | GET/POST | No | Waitlist management |
| `/api/waitlist/unsubscribe` | DELETE | No | Unsubscribe from waitlist |
| `/api/privacy/export` | GET | Bearer | GDPR data export |
| `/api/privacy/account` | DELETE | Bearer | Account deletion |
| `/api/cron/lifecycle` | GET | Internal | Capsule lifecycle transitions |
| `/api/cron/biometric-cleanup` | GET | Internal | Expired consent cleanup |
| `/api/notifications/whatsapp/opt-in` | POST | Bearer | WhatsApp notification opt-in |

### Key API Routes (POC_REAL)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/capsules/[id]/send` | POST | Send capsule to designated person |
| `/api/capsules/[id]/claim` | POST | Claim a received capsule |
| `/api/capsules/[id]/video/download-complete` | POST | Mark video download complete |
| `/api/trust/decision` | POST | Trust decision processing |
| `/api/cron/lifecycle` | POST | Lifecycle state transitions |
| `/api/notifications/whatsapp/opt-in` | POST | WhatsApp opt-in |
| `/api/beta/*` | Various | Beta invitation system (invite, accept, complete, access, audit, revoke, resend) |

### POC_REAL Lifecycle Engine

`src/lib/lifecycle/` — capsule state machine with 10 states:
`draft → active → closed → downloaded / sent → claimed → experience_active → expiring_soon → expired / archived`

Key modules:
- `state-machine.ts` — state transition rules
- `send-flow.ts` — capsule delivery
- `claim-handoff.ts` — recipient claim process
- `trust-contact-window.ts` / `trust-contact-links.ts` — trust verification
- `video-purge-retry.ts` — video cleanup with retry
- `notifications.ts` — notification dispatch

`src/lib/trust/` — designated person identity verification and trust decisions

### Email (POC_REAL)

Implemented via Resend SDK (`src/lib/email.ts` + `email-templates.ts`). Transactional email is functional, not pending.

### Backend Stack Transition

- **Current:** Firebase SDK (Auth, Firestore, Storage) in PREREUNION_ANDREA
- **Target:** Supabase (Auth, PostgreSQL, Storage, Edge Functions) — prototyped in POC_REAL
- Architecture docs: `docs/ARCHITECTURE.md` (current), `docs/ARCHITECTURE_TARGET_SUPABASE.md` (target)

## Environment Variables

### PREREUNION_ANDREA (`.env.local`)
```
NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID,
NEXT_PUBLIC_FIREBASE_REGION=europe-west1
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
```

### POC_REAL (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start>
BETA_GATE_ENABLED=true|false
```

### Supabase Local Ports
| Service | Port |
|---------|------|
| API | 54321 |
| DB (PostgreSQL 17) | 54322 |
| Studio | 54323 |
| Inbucket (email test UI) | 54324 |
| Analytics | 54327 |

Storage limit: 50MiB/file. JWT expiry: 3600s. Email confirmations disabled locally.

## Critical Patterns & Gotchas

### Supabase Client (POC_REAL)
**CRITICAL**: All hooks MUST use `useRef(createClient())` — NOT bare `createClient()`. Without useRef, re-renders create new Supabase instances → auth state inconsistent → pages stuck loading. Middleware must wrap `getUser()` in try/catch (throws during logout with corrupted cookies).

### Framer Motion + Headless Playwright
- `initial={{ opacity: 0 }}` stays at 0 in headless — use `reducedMotion: 'reduce'` in browser context
- Do NOT use `forceVisible()` hacks — breaks AnimatePresence multi-step flows
- `.next` cache corrupts during rapid Playwright sessions on Windows — delete `.next` before restart

### React 19 Hydration
- Avoid `Math.random()` in render — use deterministic values like `((i * 37) % 100)`

### Firebase Auth (PREREUNION_ANDREA)
- `useAuth` does NOT auto-create profiles — only explicit registration flows do
- Consent persistence: always include `termsAcceptedAt`, `privacyAcceptedAt`, `consentVersion`, `consentSource`
- Dates: `serverTimestamp()` on write, `.toDate()` on read
- `FIREBASE_PRIVATE_KEY` may have escaped newlines — preserve restoration logic in API handlers

### Playwright (POC_REAL)
- Config enforces `workers: 1`, `fullyParallel: false`, 60s test timeout
- `reducedMotion: 'reduce'` set globally
- `webServer.timeout` is 30s

## POC Work Rules

- **Read specs first** — always read `POC_INTERNA/01_SPECS/DESIGN_SYSTEM.md` before implementing UI
- **Mobile-first** — design for mobile (390x844), adapt to desktop (1440x900)
- **Spanish nativo** — all copy in Spain Spanish
- **Follow Andrea's PDFs literally** — do not improvise UI (`DISEÑO_ANDREA_PANTALLAS/`)

## Capsule Types (6 canonical)

| Type | Purpose | AI Avatar |
|------|---------|-----------|
| `legacy` | Post-mortem inheritance | Yes (EverLife) |
| `together` | Couples shared memories | No |
| `social` | Private diary for friends | No |
| `pet` | Pet memorials | No |
| `life-chapter` | Document life stages | Optional |
| `origin` | Parents → children | Optional |

## Workspace Migration

The repo is being reorganized. See `docs/plans/2026-02-15-repo-reorganization-plan.md` for the full plan. Empty scaffold dirs already exist in `apps/`.

| Current Path | Target Path |
|---|---|
| `PREREUNION_ANDREA/` | `apps/external-web/` |
| `POC_INTERNA/app/` | `apps/internal-onboarding/` |
| `POC_REAL/` | `apps/poc-real/` |
| `docs/` | `product/docs/` |
| `POC_INVERSION_NUCLEA/` | `business/investor/poc/` |
| `DISEÑO_ANDREA_PANTALLAS/` | `assets/design-pdfs/` |

## Known Issues

- **Windows `nul` file**: Remove with `bash -c "rm -f nul"`
- **Firebase SDK bundle**: 489KB vendor (tree-shaking limited)
- **No Jest/Vitest**: Unit tests use `node:test` runner via `tsx --test`

## Remaining for Deploy

- Supabase Cloud setup (migrate from local Docker)
- Vercel deployment for POC_REAL
- Apply RLS migration 00012 in production
- ZIP export live testing (implemented via jszip + file-saver)
