# PRM-QUALITY-008 Performance Budget Gate Output

## Metadata
- Prompt: PRM-QUALITY-008 v1.0.0
- Date: 2026-02-08
- Reviewer: CTO PromptOps (Opus 4.6)
- Apps: PREREUNION_ANDREA (port 3000) + POC_INTERNA/app (port 3001)

---

## 1. Bundle Analysis

### PREREUNION_ANDREA Dependencies (10 prod + 6 dev = 16 total)

| Package | Version | Size Category | Estimated gzipped |
|---------|---------|---------------|-------------------|
| firebase | ^10.14.1 | **HEAVY** | ~250KB |
| firebase-admin | ^12.7.0 | **HEAVY** | ~150KB |
| framer-motion | ^11.15.0 | **HEAVY** | ~60KB |
| zustand | ^5.0.2 | Light | ~3KB |
| zod | ^3.24.1 | Medium | ~13KB |
| date-fns | ^4.1.0 | Medium | ~7KB (tree-shaken) |
| react-hot-toast | ^2.4.1 | Light | ~5KB |
| uuid | ^11.0.4 | Light | ~1KB |
| lucide-react | ^0.469.0 | Medium | tree-shakeable |

**Estimated vendor bundle: ~489KB gzipped (Firebase dominates)**

### POC_INTERNA/app Dependencies (5 prod + 8 dev = 13 total)

| Package | Version | Size Category | Estimated gzipped |
|---------|---------|---------------|-------------------|
| framer-motion | ^11.15.0 | **HEAVY** | ~60KB |
| lucide-react | ^0.469.0 | Medium | tree-shakeable |
| playwright | ^1.58.1 | Dev only | NOT bundled |

**Estimated vendor bundle: ~60KB gzipped (Framer Motion only)**

### Bundle Analyzer: NOT CONFIGURED in either app
- Command to verify: `npm ls @next/bundle-analyzer` returns not found
- Recommendation: Install `@next/bundle-analyzer` in both apps

---

## 2. Lighthouse Score Matrix (Static Analysis Estimate)

No Lighthouse run was performed (apps not running). Estimates based on code analysis:

| Metric | PREREUNION_ANDREA | POC_INTERNA/app | Budget |
|--------|-------------------|-----------------|--------|
| Performance | warn (~60-70) | warn (~65-75) | >80 |
| Accessibility | warn (~70-80) | pass (~85-90) | >80 |
| Best Practices | warn (~70) | pass (~85) | >80 |
| SEO | pass (~90) | warn (~70) | >80 |

---

## 3. Core Web Vitals Risk Assessment

### LCP (Largest Contentful Paint)
- **PREREUNION_ANDREA**: ALL pages are `'use client'` (no SSR) -> LCP risk HIGH
  - Evidence: `page.tsx` line 1, `dashboard/page.tsx` line 1, `login/page.tsx` line 1, `registro/page.tsx` line 1
- **POC_INTERNA**: Only `/` is server (redirect); `/onboarding` is client
  - 9.4MB capsule PNGs loaded via next/image (optimized on-demand but source huge)
  - `capsule-closed.png` = 5.4MB, `capsule-closed-nobg.png` = 4.0MB

### CLS (Cumulative Layout Shift)
- Both apps use `next/font/google` with `display: 'swap'` -> CLS risk from font swap
- POC: 56 concurrent Framer Motion animations could cause layout shifts

### FID/INP (Interaction Delay)
- POC P2: 25 simultaneous animations (8 polaroids + 5 pills + 12 particles) -> main thread blocking risk

---

## 4. Budget Compliance Table

| Metric | Threshold | PREREUNION_ANDREA | POC_INTERNA | Gate |
|--------|-----------|-------------------|-------------|------|
| JS bundle (vendor) | <200KB gz | ~489KB | ~60KB | **FAIL** / pass |
| Image assets total | <500KB | 0 (CDN) | 9.5MB | pass / **FAIL** |
| Font files loaded | <=6 | 9 | 9 | **FAIL** / **FAIL** |
| Client components ratio | <50% | 100% (4/4) | 100% (1/1) | **FAIL** / **FAIL** |
| Bundle analyzer | configured | NO | NO | **FAIL** / **FAIL** |
| next.config optimizations | present | minimal | empty | **FAIL** / **FAIL** |

---

## 5. Framer Motion Bundle Cost

### PREREUNION_ANDREA: 8 components import framer-motion
- WaitlistForm.tsx, Capsules.tsx, Waitlist.tsx, Pricing.tsx
- Hero.tsx, AISection.tsx, Header.tsx, CapsuleCard.tsx
- **Impact**: Entire ~60KB library loads on first page visit (landing page)

### POC_INTERNA/app: ALL 4 onboarding screens + page orchestrator
- P1: 3 animations (float, glow, hint fade)
- P2: **25 animations** (capsule split, 8 polaroids, 5 pills, 12 particles)
- P3: ~15 animations (9 pills, 5 polaroids, capsule breathing)
- P4: ~13 animations (8 pills, 4 polaroids, fade-ins)
- **TOTAL: ~56 concurrent animations across onboarding flow**

---

## 6. Font Loading Analysis

### PREREUNION_ANDREA (layout.tsx lines 6-18)
- DM Sans: 5 weights (300,400,500,600,700) = **5 font files**
- Cormorant Garamond: 4 weights (400,500,600,700) = **4 font files**
- Total: **9 font files**, `display: 'swap'`, subset `latin`

### POC_INTERNA/app (layout.tsx lines 5-18)
- Inter: 3 weights (400,500,600) = **3 font files**
- Cormorant Garamond: 3 weights x 2 styles (normal+italic) = **6 font files**
- Total: **9 font files**, `display: 'swap'`, subset `latin`

---

## 7. Remediation Backlog (ordered by impact)

| Priority | Issue | File Target | Estimated Impact |
|----------|-------|-------------|------------------|
| P0 | Optimize capsule PNGs (9.4MB -> <400KB) | `public/images/capsule-*.png` | -9MB transfer |
| P0 | Install @next/bundle-analyzer | both `package.json` + `next.config.js` | enables measurement |
| P1 | Lazy-load Firebase SDK | `PREREUNION_ANDREA/src/lib/firebase.ts` | -270KB initial bundle |
| P1 | Convert landing sections to Server Components | `PREREUNION_ANDREA/src/app/page.tsx` | SSR benefits, better LCP |
| P1 | Reduce P2 animations from 25 to <10 | `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx` | less main thread blocking |
| P2 | Reduce font weights (DM Sans: drop 300,700) | `PREREUNION_ANDREA/src/app/layout.tsx` | -2 font files |
| P2 | Use CSS animations for simple float/fade | all P1-P4 components | reduce FM dependency |
| P2 | Add webpack splitChunks config | both `next.config.js` | better code splitting |

---

## 8. Verification Commands

```bash
# Install bundle analyzer
cd PREREUNION_ANDREA && npm install --save-dev @next/bundle-analyzer

# Run bundle analysis
ANALYZE=true npm run build

# Check image sizes
ls -la POC_INTERNA/app/public/images/capsule-*.png

# Check font file count
grep -c "weight:" PREREUNION_ANDREA/src/app/layout.tsx
grep -c "weight:" POC_INTERNA/app/src/app/layout.tsx

# Verify client components
grep -rl "'use client'" PREREUNION_ANDREA/src/app/
grep -rl "'use client'" POC_INTERNA/app/src/app/
```

---

## 9. Gate Decision

| App | Gate | Rationale |
|-----|------|-----------|
| PREREUNION_ANDREA | **FAIL** | 489KB vendor bundle (Firebase), 100% client components, no bundle analyzer |
| POC_INTERNA/app | **WARN** | 9.4MB image assets, 56 concurrent animations, but lightweight JS bundle |

**Overall: WARN** (POC is demo-quality acceptable, production app needs optimization before launch)
