# Quality Gates CI

This repository runs `quality-gates` on `push` (`master`/`main`) and `pull_request`.
It also supports manual execution via `workflow_dispatch`.

## What It Checks

0. `docs-governance`
- `node docs/scripts/check-source-of-truth-coverage.mjs` (fails if any `docs/**/*.md` file is not classified in `docs/SOURCE_OF_TRUTH.md`)

1. `PREREUNION_ANDREA`
- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run check:ontology` (capsule type and legacy-token drift gate)
- `npm run build` (Turbopack production build)
- `npm run smoke:routes` (runtime smoke checks on key pages and auth-protected APIs)
- `ANALYZE=true npx next build --webpack` (bundle analyzer-compatible run)
- Uploads `.next/analyze/*` as artifact `prereunion-analyze-report`

2. `POC_INTERNA/app`
- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

3. `POC_REAL` (quality)
- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npx tsx --test src/lib/**/*.test.ts src/lib/lifecycle/*.test.ts src/lib/trust/*.test.ts`
- `npx next build`

4. `POC_REAL` (smoke stack)
- `npx supabase start`
- `npx supabase db reset --local`
- `npx tsx scripts/seed.ts`
- `npx tsx scripts/seed-beta.ts`
- `npm run dev` (background, waits for `/login`)
- `node tests/smoke_send_claim.mjs`
- Upload diagnostics (`/tmp/poc-real-dev.log`, screenshots)
- `npx supabase stop --no-backup`

## Local Rerun Commands

```bash
node docs/scripts/check-source-of-truth-coverage.mjs
```

```bash
cd PREREUNION_ANDREA
npm run lint
npx tsc --noEmit
npm run check:ontology
npm run build
npm run smoke:routes
ANALYZE=true npx next build --webpack
npm run quality:prm-008:full

cd ../POC_INTERNA/app
npm run lint
npx tsc --noEmit
npm run build

cd ../../POC_REAL
npm run lint
npx tsc --noEmit
npx tsx --test src/lib/**/*.test.ts src/lib/lifecycle/*.test.ts src/lib/trust/*.test.ts
npx next build
```
