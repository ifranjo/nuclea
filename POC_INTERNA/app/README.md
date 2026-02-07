# NUCLEA POC App (Onboarding)

Runnable Next.js prototype for the internal onboarding flow.

## Scope

- Implements onboarding screens `P1 -> P4`.
- Uses placeholder visuals and curated copy from PoC specs.
- Runs isolated from the other app on port `3001`.

## Prerequisites

- Node.js 20+ recommended
- npm

## Run locally

```bash
cd POC_INTERNA/app
npm install
npm run dev
```

Open `http://localhost:3001`.

## Available scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Start local app on port `3001` |
| Production build | `npm run build` | Build app |
| Production start | `npm run start` | Start built app on port `3001` |
| Lint | `npm run lint` | Run lint checks (if ESLint config is present) |
| PDF alignment only | `npm run autocheck:pdf` | Validate key copy against source PDFs |
| Full autocheck | `npm run autocheck` | Lint + build + runtime flow check + PDF alignment |
| Healing session | `npm run heal:session` | Stops on first successful `autocheck`; cleans cache/screens between failed attempts |
| Stability run (3x) | `npm run heal:stability` | Runs exactly 3 full `autocheck` iterations and fails if any iteration fails |

## Current route map

| Route | Behavior |
|-------|----------|
| `/` | Redirects to `/onboarding` |
| `/onboarding` | 4-step onboarding flow with Framer Motion fade transitions |
| `/onboarding/capsule/[type]` | Placeholder detail page after selecting a capsule in P4 |

Route sources:
- `src/app/page.tsx`
- `src/app/onboarding/page.tsx`

## Onboarding screen mapping

| Step | Component | Notes |
|------|-----------|-------|
| P1 | `src/components/onboarding/P1CapsuleClosed.tsx` | Click/tap or keyboard to advance |
| P2 | `src/components/onboarding/P2CapsuleOpening.tsx` | Auto-advance after 4s |
| P3 | `src/components/onboarding/P3Manifesto.tsx` | CTA button advances to P4 |
| P4 | `src/components/onboarding/P4CapsuleSelection.tsx` | Shows 6 capsule types from shared constants |

## Key implementation files

| Path | Purpose |
|------|---------|
| `src/types/index.ts` | `CapsuleType`, `OnboardingStep`, and `CAPSULE_TYPES` content |
| `src/components/ui/` | UI primitives (`Button`, `Header`, `CapsuleTypeCard`) |
| `src/components/icons/CapsuleIcons.tsx` | Capsule icon mapping |
| `src/components/capsule/` | Placeholder visual blocks for capsule/polaroids |
| `src/app/globals.css` | Theme tokens and base styles |
| `public/images/` | Static images used by onboarding |
| `prompts/` | Image generation prompts and guidance |

## Screenshot capture

The repo includes Playwright scripts to capture onboarding visuals:

- `screenshots/capture_onboarding.js` (headless capture with dvh fix)
- `screenshots/capture.mjs` (simple capture flow)

Typical usage (with dev server running):

```bash
cd POC_INTERNA/app
node screenshots/capture_onboarding.js
```

Screenshots are saved under `POC_INTERNA/app/screenshots/`.

## Common troubleshooting

1. Port already in use:
   - Stop other process on `3001` or run with a different port.
2. Missing dependencies:
   - Run `npm install` again in `POC_INTERNA/app`.
3. Screenshot script fails:
   - Confirm app is running at `http://localhost:3001/onboarding`.
   - Confirm `playwright` is installed (already declared in dependencies).
4. `autocheck` fails only on some runs:
   - Execute `npm run heal:stability` to reproduce flaky behavior under repeated full runs.
   - Inspect `test-results/full-autocheck-report.json` from the failed iteration.
