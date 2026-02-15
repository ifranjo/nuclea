# Quality Gates CI

This repository runs `quality-gates` on `push` (`master`/`main`) and `pull_request`.

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
```
