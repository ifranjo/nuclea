# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| Task | Command |
|------|---------|
| Run production app | `cd PREREUNION_ANDREA && npm run dev` (port 3000) |
| Run POC UI | `cd POC_INTERNA/app && npm run dev` (port 3001) |
| Run POC Real | `cd POC_REAL && npx supabase start && npm run dev` (port 3002) |
| Run unit tests | `npm run test:unit` (PREREUNION_ANDREA) |
| Run E2E tests | `npm run test:e2e` (POC_REAL, needs dev server) |
| Lint all | `npm run lint` (per app) |
| Typecheck | `npx tsc --noEmit` (per app) |
| Build verify | `npx next build` (all 3 apps build clean, zero warnings) |

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
npm run test:unit              # Unit tests (tsx --test, node:test runner)
npm run smoke:routes           # Runtime route smoke tests (9 routes)
npm run smoke:routes:ci        # Build + smoke tests (CI mode)
npm run check:ontology         # Capsule type drift detection
npm run quality:prm-008        # Lighthouse audit
npm run quality:prm-008:full   # Full quality suite (Lighthouse + bundle)
npm run deploy                 # Vercel deploy (--prod)
npx tsc --noEmit               # Typecheck (used in CI)
```

### POC App — UI only (POC_INTERNA/app)

```bash
cd POC_INTERNA/app && npm install
npm run dev                    # localhost:3001
npm run build                  # Production build
npm run lint                   # ESLint
npm run autocheck              # Lint + build + runtime flow + PDF alignment
npm run heal:session           # Stop on first successful autocheck
npm run heal:stability         # 3 full autocheck iterations
npx tsc --noEmit               # Typecheck (used in CI)
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
npx supabase db reset           # Apply migrations
npx tsx scripts/seed.ts         # Seed 5 test users + capsules + images
npx tsx scripts/seed-beta.ts    # Grant beta access to test users
npm run dev                    # localhost:3002
# Supabase Studio: http://localhost:54323

npm run test:ceo               # CEO bug verification tests
npm run test:beta              # Beta QA tests
npm run test:upload            # Upload flow e2e tests
npm run test:playwright        # Full Playwright test suite
npm run test:e2e               # Playwright E2E suite (35 tests, 5 specs)
npm run test:e2e:headed        # E2E with visible browser
npm run test:install           # Install Playwright Chromium
```

## CI Pipeline

`.github/workflows/quality-gates.yml` runs on push to master and PRs:

1. **docs-governance** — `node docs/scripts/check-source-of-truth-coverage.mjs`
2. **prereunion-quality** — lint → typecheck → ontology drift → build (Turbopack) → smoke routes → bundle analysis (Webpack)
3. **poc-quality** — lint → typecheck → build

Node 20, `npm ci` for installs.

## Architecture

### Path Alias

All apps: `@/*` → `./src/*`

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
| `/api/consent/biometric` | POST | Bearer | Sign biometric consent |
| `/api/consent/biometric` | GET | Bearer | Get consent status |
| `/api/consent/biometric` | DELETE | Bearer | Revoke consent |
| `/api/capsules` | GET/POST | Bearer | List/create capsules |
| `/api/waitlist` | GET/POST | No | Waitlist management |

### Legal Pages

PREREUNION_ANDREA: `/privacidad`, `/terminos`, `/consentimiento`, `/contacto` (server components)

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

The repo is being reorganized. See `docs/plans/2026-02-15-repo-reorganization-plan.md` for the full plan.

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

## Production Readiness (22 Feb 2026)

### All 3 Apps — Build Clean
- `PREREUNION_ANDREA`: 19 routes, `npx next build` zero warnings, tsc clean
- `POC_INTERNA`: 10 routes, `npx next build` zero warnings, tsc clean
- `POC_REAL`: 30 routes, `npx next build` zero warnings, tsc clean

### Test Coverage
- **Unit tests**: 14/14 passing (PREREUNION_ANDREA)
- **Smoke tests**: 9/9 passing (PREREUNION_ANDREA)
- **E2E tests**: 35 Playwright tests (POC_REAL — auth, dashboard, capsule, share, onboarding)

### Security Hardening (this session)
- RLS migration 00012 ready for production (POC_REAL)
- Atomic rate limiter (no race condition)
- Share page column whitelist (no secret exposure)
- All API routes use Zod validation (including WhatsApp opt-in)
- Error boundaries on all routes across all 3 apps
- Loading skeletons on key routes across all 3 apps

### Accessibility (this session)
- htmlFor/id pairs on all forms
- aria-labels on all icon-only buttons
- role=dialog on modals, role=progressbar on progress bars
- Viewport zoom enabled (WCAG 1.4.4)
- MotionConfig reducedMotion support

### Remaining for Deploy
- Supabase Cloud setup (migrate from local Docker)
- Vercel deployment for POC_REAL
- Apply RLS migration 00012 in production
- Email delivery service for transactional emails
- ZIP export feature (implemented, needs live testing)
