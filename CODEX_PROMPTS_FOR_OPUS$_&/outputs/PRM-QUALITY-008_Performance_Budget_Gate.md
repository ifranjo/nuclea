# PRM-QUALITY-008 Performance Budget Gate Output

## Metadata
- Prompt: PRM-QUALITY-008 v1.0.1
- Date: 2026-02-09
- Reviewer: CTO PromptOps (Opus 4.6)
- Apps: PREREUNION_ANDREA (port 3000) + POC_INTERNA/app (port 3001)
- Baseline: REV-013 (estimates only, gate WARN/FAIL)

---

## 1. TypeScript Check

```
Command: npx tsc --noEmit --pretty
PREREUNION_ANDREA: PASS (0 errors)
POC_INTERNA/app:   PASS (0 errors)
```

---

## 2. Build Output (Measured)

### PREREUNION_ANDREA

```
Command: ANALYZE=true npx next build --webpack
Next.js: 16.1.4 (webpack)
Compile: 6.9s
Static pages: 12 routes, 834ms
Analyzer reports: .next/analyze/{client,edge,nodejs}.html
```

| Route | Type |
|-------|------|
| / | Static |
| /dashboard | Static |
| /login | Static |
| /registro | Static |
| /privacidad | Static |
| /terminos | Static |
| /consentimiento | Static |
| /contacto | Static |
| /api/capsules | Dynamic |
| /api/waitlist | Dynamic |

Top chunks (raw, uncompressed):

| Chunk | Size | Likely Source |
|-------|------|-------------|
| 567-dc84a62b.js | 216 KB | Firebase SDK |
| 4bd1b696-096d35a2.js | 194 KB | React DOM |
| 794-11669f2f.js | 184 KB | Firebase Auth/Firestore |
| bc9e92e6-5027b13a.js | 165 KB | Framer Motion |
| framework-eba4e27f.js | 137 KB | React framework |
| main-e129cb23.js | 126 KB | Next.js main |
| polyfills-42372ed1.js | 110 KB | Polyfills |
| 69806262-a177d727.js | 80 KB | Misc deps |

**Total raw JS: 1.3 MB** (chunks directory)

### POC_INTERNA/app

```
Command: ANALYZE=true npm run build
Next.js: 15.5.12
Compile: 4.4s
Analyzer reports: .next/analyze/{client,edge}.html
```

| Route | Size | First Load JS |
|-------|------|---------------|
| / | 127 B | 102 kB |
| /onboarding | 44.4 kB | 153 kB |
| /onboarding/capsule/[type] | 3.54 kB | 112 kB |

Shared JS: 102 kB
- chunks/255 (framer-motion): 46 kB
- chunks/4bd1b696 (React DOM): 54.2 kB
- other: 1.99 kB

**Total raw JS: 917 KB** (chunks directory)

---

## 3. Lighthouse Scores (Measured)

```
Command: npx lighthouse <url> --output json --chrome-flags="--headless --no-sandbox"
Lighthouse: 13.0.1
Conditions: dev server, headless Chrome, no throttle override, cache-cleared
```

| Metric | PREREUNION_ANDREA | POC_INTERNA | Budget | Gate |
|--------|-------------------|-------------|--------|------|
| Performance | 75 | 53 | >80 | **FAIL** / **FAIL** |
| Accessibility | 96 | 87 | >80 | pass / pass |
| Best Practices | 96 | 96 | >80 | pass / pass |
| SEO | 100 | 100 | >80 | pass / pass |

---

## 4. Core Web Vitals (Measured)

| Metric | PREREUNION_ANDREA | POC_INTERNA | Budget | Gate |
|--------|-------------------|-------------|--------|------|
| LCP | 8.8 s | 14.9 s | <2.5 s | **FAIL** / **FAIL** |
| FCP | 0.8 s | 1.4 s | <1.8 s | pass / pass |
| CLS | 0 | 0 | <0.1 | pass / pass |
| TBT | 90 ms | 1,010 ms | <200 ms | pass / **FAIL** |
| SI | 0.8 s | 2.0 s | <3.4 s | pass / pass |

**Note**: Measured on dev server (no production optimizations). PREREUNION_ANDREA `next start` fails with `ENOENT: prerender-manifest.json` (Next 16 issue). Production Lighthouse requires deployment fix.

---

## 5. Budget Compliance Table

| Metric | Threshold | PREREUNION_ANDREA | POC_INTERNA | Gate |
|--------|-----------|-------------------|-------------|------|
| Performance score | >80 | 75 | 53 | **FAIL** / **FAIL** |
| LCP | <2.5s | 8.8s | 14.9s | **FAIL** / **FAIL** |
| TBT | <200ms | 90ms | 1,010ms | pass / **FAIL** |
| CLS | <0.1 | 0 | 0 | pass / pass |
| Image assets total | <500KB | 0 (CDN) | 310KB | pass / pass |
| Bundle analyzer | configured | YES | YES | pass / pass |
| `next start` works | yes | NO (manifest) | N/A | **FAIL** / N/A |

---

## 6. Framer Motion Bundle Cost (Measured)

| App | Chunk | Raw Size | Role |
|-----|-------|----------|------|
| PREREUNION_ANDREA | bc9e92e6-5027b13a.js | 165 KB | Framer Motion |
| POC_INTERNA | chunks/255-ebd51be4.js | 46 KB | Framer Motion (tree-shaken) |

POC tree-shakes FM down to 46 KB (vs PREREUNION 165 KB) because it uses fewer FM features.

---

## 7. Image Optimization (Measured)

```
Command: ls -lh POC_INTERNA/app/public/images/capsule-*.png
```

| File | REV-013 | REV-015 | Reduction |
|------|---------|---------|-----------|
| capsule-closed.png | 5.4 MB | 243 KB | -96% |
| capsule-closed-nobg.png | 4.0 MB | 67 KB | -98% |
| **Total** | **9.4 MB** | **310 KB** | **-97%** |

---

## 8. Remediation Backlog (by impact)

| Priority | Issue | Target | Expected Impact |
|----------|-------|--------|-----------------|
| P1 | Fix `next start` (prerender-manifest) | PREREUNION_ANDREA next.config.js / build pipeline | Enables production Lighthouse |
| P1 | Reduce POC TBT (1,010ms) — too many FM animations | P2CapsuleOpening.tsx | -800ms TBT |
| P1 | Lazy-load Firebase SDK | PREREUNION_ANDREA/src/lib/firebase.ts | -400KB raw JS |
| P2 | Convert landing to Server Components | PREREUNION_ANDREA/src/app/page.tsx | Better LCP |
| P2 | Reduce font weights (9 → 6) | Both layout.tsx | -3 font files |

---

## 9. Verification Commands

```bash
# TypeScript
cd PREREUNION_ANDREA && npx tsc --noEmit
cd POC_INTERNA/app && npx tsc --noEmit

# Build + analyzer
cd PREREUNION_ANDREA && ANALYZE=true npx next build --webpack
cd POC_INTERNA/app && ANALYZE=true npm run build

# Lighthouse (requires running dev server)
npx lighthouse http://localhost:3000/ --output json --chrome-flags="--headless --no-sandbox"
npx lighthouse http://localhost:3001/onboarding --output json --chrome-flags="--headless --no-sandbox"

# Image sizes
ls -lh POC_INTERNA/app/public/images/capsule-*.png

# Chunk sizes
du -ch PREREUNION_ANDREA/.next/static/chunks/*.js | tail -1
du -ch POC_INTERNA/app/.next/static/chunks/*.js | tail -1
```

---

## 10. Gate Decision

| App | REV-013 Gate | REV-015 Gate | Rationale |
|-----|-------------|-------------|-----------|
| PREREUNION_ANDREA | **FAIL** | **WARN** | Bundle analyzer configured, images optimized, accessibility/BP/SEO pass; Performance 75 <80, LCP 8.8s (dev server), `next start` broken |
| POC_INTERNA/app | **WARN** | **WARN** | Images 310KB <500KB budget, analyzer configured, accessibility/BP/SEO pass; Performance 53, LCP 14.9s, TBT 1,010ms (animation-heavy) |

**Overall: WARN** (infrastructure fixed, LCP/TBT remain above budget on dev server)
