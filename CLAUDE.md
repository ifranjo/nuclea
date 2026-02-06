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
├── docs/                        # Target architecture docs (Supabase)
├── POC_INVERSION_NUCLEA/        # Investor documentation (5 folders)
├── DISEÑO_ANDREA_PANTALLAS/     # UI mockups (12 PDFs from Andrea)
└── *.html                       # Generated reports
```

Each app directory has its own `CLAUDE.md` with technical details. This root file covers cross-cutting concerns.

## Two Applications

| | Production (`PREREUNION_ANDREA/`) | POC (`POC_INTERNA/app/`) |
|---|---|---|
| **Port** | 3000 | 3001 |
| **Theme** | Dark (`#0D0D12`) | White (`#FFFFFF`) |
| **Backend** | Firebase (Auth, Firestore, Storage) | None (pure UI) |
| **Next.js** | 16.1.4 | 15+ |
| **React** | 18 | 19 |
| **Body Font** | DM Sans | Inter |
| **Purpose** | Functional MVP with auth, CRUD, payments | Emotional onboarding demo |

### Development Commands

```bash
# Production app
cd PREREUNION_ANDREA && npm install && npm run dev    # localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run deploy       # Vercel deploy

# POC app
cd POC_INTERNA/app && npm install && npm run dev      # localhost:3001
```

## Core Concept

The capsule is a **physical emotional object** that opens and releases memories (floating polaroids). This is NOT a file-management app — it's a digital ritual. After capsule closure: download locally, delete from server, zero ongoing storage cost.

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
- Decision documented in `STACK_DECISION_FIREBASE_VS_SUPABASE.html`
- `docs/DATABASE_SCHEMA.md` and `docs/ARCHITECTURE.md` describe the Supabase target — not the current Firebase state

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

## Team

| Role | Name |
|------|------|
| CEO/Founder | Andrea Box López |
| CTO/Technical | Imanol Franjo Álvarez |

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

### Market Data
When updating market data, use JARVIS research protocol (5+ web searches) to verify. Current verified data is in `NUCLEA_POC_DOCUMENTATION.html`.

```bash
# Open key documents
start "" "NUCLEA_POC_DOCUMENTATION.html"
start "" "GUIA_PRACTICA_IA_NUCLEA.html"
```

## POC Work Rules

When working on `POC_INTERNA/app/`:
- **Aesthetics over functionality** — demonstrates the emotional experience
- **Mobile-first** — design for mobile, adapt to desktop
- **Spanish nativo** — all copy in Spain Spanish
- **Follow Andrea's PDFs literally** — do not improvise UI (see `DISEÑO_ANDREA_PANTALLAS/`)

## Known Issues

**Windows reserved filename:** `nul` file may exist in root. Remove with:
```bash
bash -c "rm -f nul"
```

**No testing infrastructure** — neither app has Jest/Vitest config or test files.

**No CI/CD** — deployment is manual via `npm run deploy` (Vercel).

---

*Last updated: Feb 2026*
