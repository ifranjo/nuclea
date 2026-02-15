# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NUCLEA** is a Spanish digital legacy platform for creating memory capsules with optional AI avatars. This workspace contains business documentation, investor materials, and two Next.js applications.

**Status:** Pre-seed, seeking €150K funding | Feb 2026

**All content is under NDA.** Sensitive stakeholder information has indefinite confidentiality.

## Workspace Layout

The repo is being reorganized into a cleaner structure. See `docs/plans/2026-02-15-repo-reorganization-plan.md` for the full migration plan.

### Target Structure (in progress)

```
nuclea/
├── apps/                            # Runnable Next.js applications
│   ├── external-web/                # Production app — port 3000, dark theme, Firebase
│   └── internal-onboarding/         # Onboarding POC — port 3001, white theme, no backend
├── product/                         # Product docs, specs, user flows
│   ├── docs/                        # Architecture, API, type contracts
│   ├── specs/                       # Design system, capsule types, data model
│   └── flows/                       # User journeys
├── business/                        # Investor materials, outreach, meeting prep
│   ├── investor/
│   ├── outreach/
│   └── meeting-prep/
├── promptops/                       # AI prompt registry and agent configs
│   └── opus-registry/
├── assets/                          # Static assets (design PDFs, raw photos)
│   ├── design-pdfs/
│   └── photos-raw/
├── automation/                      # Scripts and agent playbooks
│   ├── scripts/
│   └── agent-playbooks/
├── archive/                         # Historical/deprecated material
│   └── legacy-workspaces/
└── *.html                           # Generated reports (root level)
```

### Current Paths (until migration completes)

| Current Path | Target Path | Status |
|---|---|---|
| `PREREUNION_ANDREA/` | `apps/external-web/` | Pending Wave 3-4 |
| `POC_INTERNA/app/` | `apps/internal-onboarding/` | Pending Wave 4 |
| `docs/` | `product/docs/` | Pending Wave 3 |
| `POC_INTERNA/01_SPECS/` | `product/specs/internal-poc/` | Pending Wave 4 |
| `POC_INVERSION_NUCLEA/` | `business/investor/poc/` | Pending Wave 2 |
| `DISEÑO_ANDREA_PANTALLAS/` | `assets/design-pdfs/` | Pending Wave 2 |
| `CODEX_PROMPTS_FOR_OPUS$_&/` | `promptops/opus-registry/` | Pending Wave 2 |

Each app has its own `CLAUDE.md` with tech details. Sub-app CLAUDE.md files are the reference for app-specific architecture, types, design tokens, and environment variables.

## Three Applications

| | Production (`PREREUNION_ANDREA/`) | POC UI (`POC_INTERNA/app/`) | POC Real (`POC_REAL/`) |
|---|---|---|---|
| **Port** | 3000 | 3001 | 3002 |
| **Theme** | Dark (`#0D0D12`) | White (`#FFFFFF`) | White (`#FFFFFF`) |
| **Backend** | Firebase (Auth, Firestore, Storage) | None (pure UI) | Supabase local (Docker) |
| **Next.js** | 16.1.4 | 15.1.0+ | 15.x |
| **React** | 18 | 19 | 19 |
| **Body Font** | DM Sans | Inter | Inter |
| **State** | Zustand | useState only | React hooks + useRef |
| **Path Alias** | `@/*` → `./src/*` | `@/*` → `./src/*` | `@/*` → `./src/*` |
| **Status** | Production | Demo only | Real backend POC |

## Development Commands

### Production App

```bash
cd PREREUNION_ANDREA && npm install
npm run dev              # localhost:3000
npm run build            # Production build
npm run lint             # ESLint
npm run deploy           # Vercel deploy (--prod)
```

### POC App (UI only)

```bash
cd POC_INTERNA/app && npm install
npm run dev              # localhost:3001
npm run build            # Production build
npm run lint             # ESLint
```

### POC Real (Supabase backend)

```bash
cd POC_REAL && npm install
npx supabase start       # Docker must be running
npx supabase db reset    # Apply migrations
npx tsx scripts/seed.ts  # Seed 5 users + capsules + images
npx tsx scripts/seed-beta.ts  # Grant beta access
npm run dev              # localhost:3002
# Supabase Studio: http://localhost:54323
```

### POC Autocheck & Healing

```bash
cd POC_INTERNA/app
npm run autocheck        # Lint + build + runtime flow check + PDF alignment
npm run heal:session     # Stops on first successful autocheck
npm run heal:stability   # 3 full autocheck iterations
```

### POC Visual Regression Tests (Playwright)

Requires dev server running on port 3001.

```bash
cd POC_INTERNA/app && python tests/test_onboarding_visual.py
cd POC_INTERNA/app && node screenshots/capture_onboarding.js
```

## Core Concept

The capsule is a **physical emotional object** that opens and releases memories (floating polaroids). This is NOT a file-management app — it's a digital ritual. After capsule closure: download locally, delete from server, zero ongoing storage cost.

## Framer Motion + Headless Browser Gotchas

- `initial={{ opacity: 0 }}` stays at 0 in headless — use `reducedMotion: 'reduce'` in browser context
- Do NOT use `forceVisible()` hacks — breaks AnimatePresence multi-step flows
- React 19 hydration: avoid `Math.random()` in render — use deterministic values
- `.next` cache corrupts during rapid Playwright sessions on Windows — delete before restart

## Reality Alignment

### Capsule Ontology

Canonical type set: `legacy`, `together`, `social`, `pet`, `life-chapter`, `origin`

Storage compat: `everlife` accepted as legacy alias, normalize at boundary → `legacy`.

### Backend Stack Transition

- **Current:** Firebase SDK (Auth, Firestore, Storage)
- **Target:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- See `docs/ARCHITECTURE.md` (runtime) and `docs/ARCHITECTURE_TARGET_SUPABASE.md` (target)

## Capsule Types (6 canonical)

| Type | Purpose | AI Avatar |
|------|---------|-----------|
| `legacy` | Post-mortem inheritance | Yes (EverLife) |
| `together` | Couples shared memories | No |
| `social` | Private diary for friends | No |
| `pet` | Pet memorials | No |
| `life-chapter` | Document life stages | Optional |
| `origin` | Parents → children | Optional |

## Pricing Plans

| Plan | Price | Capsules | Storage | AI Avatar |
|------|-------|----------|---------|-----------|
| Free | €0 | 1 | 500MB | No |
| Esencial | €9.99/mo | 2 | 5GB | No |
| Familiar | €24.99/mo | 10 | 50GB | Yes |
| EverLife | €99 one-time | 1 | 100GB | Yes |

## POC Work Rules

- **Read specs first** — always read `01_SPECS/DESIGN_SYSTEM.md` before implementing UI
- **Aesthetics over functionality** — demonstrates the emotional experience
- **Mobile-first** — design for mobile, adapt to desktop
- **Spanish nativo** — all copy in Spain Spanish
- **Follow Andrea's PDFs literally** — do not improvise UI

## Multi-Agent Delegation

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

## Known Issues

**Windows reserved filename:** `nul` file may appear in root. Remove with `bash -c "rm -f nul"`.

**Deployment remains manual** via `npm run deploy` (Vercel) in `PREREUNION_ANDREA`.

---

*Last updated: 2026-02-15*
