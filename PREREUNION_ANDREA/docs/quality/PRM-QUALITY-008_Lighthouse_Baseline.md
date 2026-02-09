# PRM-QUALITY-008 Lighthouse Baseline

Generated: 2026-02-09T03:16:32.524Z

## Repro Command

```bash
cd PREREUNION_ANDREA
npm run quality:prm-008
```

## Full Rerun (Analyzer + Lighthouse)

```bash
cd PREREUNION_ANDREA
npm run quality:prm-008:full
```

## Evidence

- URL tested: `http://localhost:3100`
- Mobile JSON: `C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\.next\lighthouse\lighthouse-mobile.json`
- Desktop JSON: `C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\.next\lighthouse\lighthouse-desktop.json`
- Analyzer snapshot (from full rerun): `C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\docs\quality\analyze\client.html`, `C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\docs\quality\analyze\edge.html`, `C:\Users\Kaos\scripts\nuclea\PREREUNION_ANDREA\docs\quality\analyze\nodejs.html`

## Metrics

| Profile | Perf Score | LCP (s) | CLS | INP (ms) | TBT (ms) |
|---|---:|---:|---:|---:|---:|
| mobile | 78 | 6.04 | 0 | n/a | 40 |
| desktop | 100 | 0.8 | 0 | n/a | 0 |
