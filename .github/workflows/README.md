# Quality Gates CI

This repository runs `quality-gates` on `push` (`master`/`main`) and `pull_request`.

## What It Checks

1. `PREREUNION_ANDREA`
- `npm ci`
- `npx tsc --noEmit`
- `npm run build` (Turbopack production build)
- `ANALYZE=true npx next build --webpack` (bundle analyzer-compatible run)
- Uploads `.next/analyze/*` as artifact `prereunion-analyze-report`

2. `POC_INTERNA/app`
- `npm ci`
- `npx tsc --noEmit`
- `npm run build`

## Local Rerun Commands

```bash
cd PREREUNION_ANDREA
npx tsc --noEmit
npm run build
ANALYZE=true npx next build --webpack
npm run quality:prm-008:full

cd ../POC_INTERNA/app
npx tsc --noEmit
npm run build
```
