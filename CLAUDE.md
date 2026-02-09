# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NUCLEA** is a Spanish digital legacy platform for creating memory capsules with optional AI avatars. This workspace contains business documentation, investor materials, and two Next.js applications.

**Status:** Pre-seed, seeking €150K funding | Feb 2026

**All content is under NDA.** Sensitive stakeholder information has indefinite confidentiality.

## Workspace Layout

```
nuclea/
├── PREREUNION_ANDREA/           # Production app — port 3000, dark theme, Firebase backend
├── POC_INTERNA/                 # Internal POC
│   ├── 01_SPECS/                # Source of truth: design system, user flows, capsule types
│   └── app/                     # Onboarding POC — port 3001, white theme, no backend
├── docs/                        # Target architecture docs (Supabase — NOT current state)
├── POC_INVERSION_NUCLEA/        # Investor documentation
├── DISEÑO_ANDREA_PANTALLAS/     # UI mockups (12 PDFs from Andrea — authoritative reference)
└── *.html                       # Generated reports
```

Each app has its own `CLAUDE.md` with tech details. Sub-app CLAUDE.md files are the reference for app-specific architecture, types, design tokens, and environment variables. This root file covers cross-cutting concerns only.

## Two Applications

| | Production (`PREREUNION_ANDREA/`) | POC (`POC_INTERNA/app/`) |
|---|---|---|
| **Port** | 3000 | 3001 |
| **Theme** | Dark (`#0D0D12`) | White (`#FFFFFF`) |
| **Backend** | Firebase (Auth, Firestore, Storage) | None (pure UI) |
| **Next.js** | 16.1.4 | 15.1.0+ |
| **React** | 18 | 19 |
| **Body Font** | DM Sans | Inter |
| **State** | Zustand | useState only |
| **Path Alias** | `@/*` → `./src/*` | `@/*` → `./src/*` |

## Development Commands

### Production App

```bash
cd PREREUNION_ANDREA && npm install
npm run dev              # localhost:3000
npm run build            # Production build
npm run lint             # ESLint
npm run deploy           # Vercel deploy (--prod)
```

### POC App

```bash
cd POC_INTERNA/app && npm install
npm run dev              # localhost:3001
npm run build            # Production build
npm run lint             # ESLint
```

### POC Autocheck & Healing (automated test-fix loops)

```bash
cd POC_INTERNA/app
npm run autocheck        # Lint + build + runtime flow check + PDF alignment
npm run autocheck:pdf    # Validate copy against source PDFs only
npm run heal:session     # Stops on first successful autocheck; cleans cache between attempts
npm run heal:stability   # 3 full autocheck iterations; fails if any fails
npm run heal:insights    # Rebuild aggregated trends from healing-history/
```

`autocheck` uses `next start` (production runtime) by default. Override: `AUTOCHECK_RUNTIME=dev npm run autocheck`.

### POC Visual Regression Tests (Playwright)

Requires dev server running on port 3001.

```bash
# Python visual regression (28 assertions, P1-P4 + design system)
cd POC_INTERNA/app && python tests/test_onboarding_visual.py

# Playwright screenshot capture
cd POC_INTERNA/app && node screenshots/capture_onboarding.js
```

Screenshots saved to `POC_INTERNA/app/screenshots/` and `screenshots/regression/`.

## Core Concept

The capsule is a **physical emotional object** that opens and releases memories (floating polaroids). This is NOT a file-management app — it's a digital ritual. After capsule closure: download locally, delete from server, zero ongoing storage cost.

## Framer Motion + Headless Browser Gotchas

When working with Playwright or headless browsers against the POC:

- `initial={{ opacity: 0 }}` stays at 0 in headless — rAF-based animations don't fire reliably
- **Solution:** Use `reducedMotion: 'reduce'` in browser context — Framer Motion jumps to final `animate` state instantly, and AnimatePresence `exit` completes instantly
- Do NOT use `forceVisible()` hacks that set all opacity:0 to 1 — breaks AnimatePresence multi-step flows
- React 19 hydration: `Math.random()` in render causes server/client mismatch — use deterministic values like `((i * 37) % 100)`
- `.next` cache corrupts frequently during rapid Playwright sessions on Windows — delete `.next` before restart, add warmup hit before captures, add delays (2-3s) between navigations

## Known Discrepancies

### Capsule Type Mismatch (must be resolved)

| Source | Types | Count |
|--------|-------|-------|
| Production code (`PREREUNION_ANDREA/src/types/index.ts`) | `everlife`, `life-chapter`, `social`, `pet`, `origin` | 5 |
| POC code (`POC_INTERNA/app/src/types/index.ts`) | `legacy`, `together`, `social`, `pet`, `life-chapter`, `origin` | 6 |
| Specs (`POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`) | All 6 documented | 6 |

Key differences: Production uses `everlife` instead of `legacy`, and is missing `together`.

### Backend Stack Transition

- **Current (production code):** Firebase SDK (Auth, Firestore, Storage)
- **Target (docs/):** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- `docs/` describes the Supabase target — **not** the current Firebase state
- Decision documented in `STACK_DECISION_FIREBASE_VS_SUPABASE.html`

## Capsule Types (Canonical — 6 types)

| Type | Purpose | AI Avatar |
|------|---------|-----------|
| `legacy` | Post-mortem inheritance | Yes (EverLife) |
| `together` | Couples shared memories | No |
| `social` | Private diary for friends | No |
| `pet` | Pet memorials | No |
| `life_chapter` | Document life stages | Optional |
| `origin` | Parents → children | Optional |

Detailed specs in `POC_INTERNA/01_SPECS/CAPSULE_TYPES.md`. Per-type docs in `docs/capsules/`.

## Pricing Plans

| Plan | Price | Capsules | Storage | AI Avatar |
|------|-------|----------|---------|-----------|
| Free | €0 | 1 | 500MB | No |
| Esencial | €9.99/mo | 2 | 5GB | No |
| Familiar | €24.99/mo | 10 | 50GB | Yes |
| EverLife | €99 one-time | 1 | 100GB | Yes |

Defined in code at `PREREUNION_ANDREA/src/types/index.ts` as `PLANS`.

## POC Work Rules

When working on `POC_INTERNA/app/`:
- **Read specs first** — always read `01_SPECS/DESIGN_SYSTEM.md` before implementing UI
- **Aesthetics over functionality** — demonstrates the emotional experience
- **Mobile-first** — design for mobile, adapt to desktop
- **Spanish nativo** — all copy in Spain Spanish
- **Follow Andrea's PDFs literally** — do not improvise UI (see `DISEÑO_ANDREA_PANTALLAS/`)

## Multi-Agent Delegation

This project uses multiple AI coding agents. See `POC_INTERNA/DELEGATION_WORKFLOW.md`.

| Agent | Alias | Role |
|-------|-------|------|
| GLM-4.7 | `gy` | Backend, code, logic |
| Kimi K2 | `ky` | Docs, specs, QA |
| MiniMax | `my` | Frontend, UI, prototypes |
| Claude | `cy` | Orchestration, emergencies |

## Document Generation Guidelines

### HTML Reports (DocSidebar Style)
- Sidebar navigation with section anchors
- Academic beige/gray palette (`#FDFDFB`, `#F7F7F4`, `#4A4A4A`)
- PDF-optimized with `@media print` rules
- Sources section with URLs

## Known Issues

**Windows reserved filename:** `nul` file may appear in root. Remove with `bash -c "rm -f nul"`.

**No CI/CD** — deployment is manual via `npm run deploy` (Vercel) in PREREUNION_ANDREA.

---

*Last updated: Feb 2026*
