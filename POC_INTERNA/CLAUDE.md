# CLAUDE.md — POC_INTERNA

This file provides guidance to Claude Code and other AI agents working on the internal POC.

See `../CLAUDE.md` for project overview, canonical capsule types, and workspace navigation.

## Purpose

POC_INTERNA is the **source of truth** for NUCLEA's design and specifications:

- `01_SPECS/` — Design system, user flows, capsule types, data model
- `05_PROMPTS/` — AI asset generation prompts (Midjourney/DALL-E)
- `app/` — Runnable Next.js onboarding POC

## Specs Reference (`01_SPECS/`)

| File | Content |
|------|---------|
| `DESIGN_SYSTEM.md` | Colors, typography, spacing, component styles |
| `USER_FLOWS.md` | Complete user journeys |
| `CAPSULE_TYPES.md` | All 6 capsule types with detailed specs |
| `DATA_MODEL.md` | Supabase schema (target backend) |
| `FUTURE_MESSAGES.md` | Post-mortem message system |

**Before coding anything, read the relevant spec first.** These are extracted from Andrea's 12 PDFs and are the authoritative reference.

## Runnable App (`app/`)

Onboarding POC — 4 screens demonstrating the emotional capsule experience.

```bash
cd app && npm install && npm run dev   # http://localhost:3001
cd app && npm install && $env:ANALYZE='true'; npm run build   # PowerShell + bundle-analyzer
```

| Aspect | Value |
|--------|-------|
| Port | **3001** (production app uses 3000) |
| Theme | **White** (`#FFFFFF` bg) — opposite of production's dark theme |
| Backend | None (pure UI, no auth, no API calls) |
| State | Local `useState` only — no Zustand, no external state |

### Stack

| Package | Version |
|---------|---------|
| Next.js | 15.1.0+ |
| React | **19** (production uses React 18) |
| TypeScript | 5.7+ |
| Tailwind CSS | 3.4.17 |
| Framer Motion | 11.15.0 (fade-only, 300ms) |
| Lucide React | 0.469.0 |
| Playwright | 1.58.1 (browser automation) |

### Type System (`app/src/types/index.ts`)

```typescript
type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life-chapter' | 'origin'
type OnboardingStep = 1 | 2 | 3 | 4
```

All 6 capsule types are defined here (production code only has 5 — see root `CLAUDE.md` for discrepancy details).

### Navigation Flow

```
/ → redirect → /onboarding
P1 (tap capsule) → P2 (auto 4s timer, pausable) → P3 (tap "Continuar") → P4 (tap card → console.log)
```

Managed by `useState` in `app/src/app/onboarding/page.tsx` with URL sync via `?step=N` and lightweight step telemetry (`nuclea:onboarding-step` custom event).

### Component Map

| Component | Path | Props |
|-----------|------|-------|
| P1CapsuleClosed | `components/onboarding/` | `onNext` |
| P2CapsuleOpening | `components/onboarding/` | `onNext` |
| P3Manifesto | `components/onboarding/` | `onNext` |
| P4CapsuleSelection | `components/onboarding/` | — |
| CapsulePlaceholder | `components/capsule/` | `size?` |
| PolaroidPlaceholder | `components/capsule/` | `size?, rotation?, className?` |
| CapsuleTypeCard | `components/ui/` | `capsuleType, onClick, isFirst?, isLast?` |
| Button | `components/ui/` | `children, onClick?, className?` |
| Header | `components/ui/` | — |
| CapsuleIcon | `components/icons/` | `type, size?, className?` |

### Design System (White Theme)

| Element | Value | Tailwind Class |
|---------|-------|----------------|
| Background | `#FFFFFF` | `nuclea-bg` |
| Secondary BG | `#FAFAFA` | `nuclea-bg-secondary` |
| Text primary | `#1A1A1A` | `nuclea-text` |
| Text secondary | `#6B6B6B` | `nuclea-text-secondary` |
| Text muted | `#9A9A9A` | `nuclea-text-muted` |
| Gold accent | `#D4AF37` | `nuclea-gold` |
| Border | `#E5E5E5` | `nuclea-border` |
| Sans font | **Inter** | `font-sans` |
| Display font | Cormorant Garamond | `font-display` |

**Note:** POC uses Inter for body text. Production uses DM Sans.

## Core Metaphor

The capsule is a **physical emotional object**:
1. Capsule closed (horizontal, metallic, "NUCLEA" engraved)
2. Tap → opens by splitting apart
3. Polaroids emerge floating organically
4. Transition to content

## Rules for This POC

1. **Aesthetics over functionality** — this POC demonstrates the emotional experience
2. **Extreme minimalism** — every element must justify its existence
3. **Mobile-first** — design for mobile, adapt to desktop
4. **Spain Spanish** — all copy in native Spain Spanish
5. **Follow Andrea's PDFs literally** — do not improvise UI (see `../DISEÑO_ANDREA_PANTALLAS/`)
6. **Write complete files** — no placeholders, functional code only

## Agent Workflow

1. Read this `CLAUDE.md` + relevant specs in `01_SPECS/`
2. For UI: `01_SPECS/DESIGN_SYSTEM.md` + PDFs in `../DISEÑO_ANDREA_PANTALLAS/`
3. For capsule copy: `01_SPECS/CAPSULE_TYPES.md`
4. For user flows: `01_SPECS/USER_FLOWS.md`
5. For AI assets: `05_PROMPTS/` + `app/prompts/`

## External References

| Resource | Path |
|----------|------|
| Andrea's UI mockups (12 PDFs) | `../DISEÑO_ANDREA_PANTALLAS/` |
| Production source code | `../PREREUNION_ANDREA/src/` |
| Delegation plan | `DELEGATION_WORKFLOW.md` |

---

*Last updated: Feb 2026*
