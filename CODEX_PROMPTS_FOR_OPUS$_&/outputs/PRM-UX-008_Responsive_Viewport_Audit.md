# PRM-UX-008 Responsive Viewport Audit Output

## Metadata
- Prompt: PRM-UX-008 v1.0.0
- Date: 2026-02-08
- Reviewer: CTO PromptOps (Opus 4.6)
- App: POC_INTERNA/app (port 3001)
- Spec Reference: POC_INTERNA/01_SPECS/DESIGN_SYSTEM.md

---

## 1. Viewport Matrix (Route x Viewport)

| Route | 375px (SE) | 428px (14PM) | 768px (Tablet) | 1024px+ (Desktop) |
|-------|------------|--------------|----------------|-------------------|
| /onboarding P1 | warn | warn | warn | warn |
| /onboarding P2 | fail | fail | fail | fail |
| /onboarding P3 | pass | pass | warn | warn |
| /onboarding P4 | warn | warn | warn | warn |

---

## 2. CRITICAL: Tailwind Breakpoints Mismatch

**File**: `tailwind.config.ts`

Tailwind uses DEFAULT breakpoints, NOT spec breakpoints:

| Tailwind Default | Spec Value | Impact |
|-----------------|------------|--------|
| sm: 640px | 375px | All `sm:` classes trigger 265px too late |
| md: 768px | 428px | All `md:` classes trigger 340px too late |
| lg: 1024px | 768px | Desktop styles apply at tablet instead |
| xl: 1280px | 1024px | Off by 256px |

**Result**: Every responsive class in the codebase applies at wrong screen sizes.

---

## 3. Capsule Sizing Compliance

Spec: 240px mobile, 320px desktop (768px+)

| Component | Base (Mobile) | sm (640px) | lg (1024px) | Compliant |
|-----------|---------------|------------|-------------|-----------|
| CapsulePlaceholder (line 9) | 240px | **280px** (not in spec) | 320px | **FAIL** |
| P1CapsuleClosed (line 52) | 240px | 320px at **640px** | - | **FAIL** (wrong BP) |
| P2CapsuleOpening (line 40-41) | 240px hardcoded JS | - | - | **FAIL** (no responsive) |

---

## 4. Touch Target Violations (<44x44px)

| Component | Element | Actual Size | Spec Min | Status |
|-----------|---------|-------------|----------|--------|
| PolaroidPlaceholder (line 70-87) | Heart button | ~26x26px | 44x44px | **FAIL** |
| PolaroidPlaceholder | Maximize2 button | ~26x26px | 44x44px | **FAIL** |
| PolaroidPlaceholder | Share2 button | ~26x26px | 44x44px | **FAIL** |
| CapsuleTypeCard (line 19) | Full card | ~36-40px h | 44x44px | **FAIL** |
| Header (line 8-14) | Menu button | 44x44px | 44x44px | pass (exact min) |
| Button (line 14) | Primary button | ~64px h | 44x44px | pass |

**4 touch target failures** across 2 components.

---

## 5. Text Sizing vs Spec

| Component | Element | Spec | Actual | Status |
|-----------|---------|------|--------|--------|
| Header (line 15) | Brand text | 16px (body) | **15px** | FAIL |
| CapsuleTypeCard (line 38) | Title | 18px (H3) | **17px** | FAIL |
| CapsuleTypeCard (line 41) | Tagline | 14px (small) | **13px** | FAIL |
| P1CapsuleClosed (line 68) | Hint text | 12px (caption) | **13px** | FAIL |
| P3Manifesto (line 183) | Tagline | 20px | 20px | pass |
| P3Manifesto (line 185) | Body | 16px | 16px | pass |
| P4CapsuleSelection (line 137) | H1 | 28px | 28px | pass |
| P4CapsuleSelection (line 140) | Small text | 14px | **15px** | FAIL |
| Button (line 16) | Label | 16px | 16px | pass |

**5/9 text sizes deviate from spec (55% failure rate)**

---

## 6. Padding Consistency

Spec: 24px horizontal padding (px-6)

| Screen | Actual | Spec | Status |
|--------|--------|------|--------|
| P2 progress bar (line 278) | px-8 (32px) | 24px | **FAIL** |
| P3 content (line 54) | px-6 (24px) | 24px | pass |
| P4 content (line 126) | px-5 (20px) | 24px | **FAIL** |
| Header (line 7) | px-5 (20px) | 24px | **FAIL** |

3 different values (20px, 24px, 32px) instead of standard 24px.

---

## 7. Layout Break Report

| Issue | Component | Severity |
|-------|-----------|----------|
| P2 capsule not responsive (hardcoded 240px JS const) | P2CapsuleOpening lines 40-41 | HIGH |
| P2 polaroid sizes not responsive (fixed px via props) | P2CapsuleOpening lines 18-26 | MEDIUM |
| P3/P4 decorative pills hardcoded sizes (no breakpoints) | P3Manifesto line 15, P4CapsuleSelection line 14 | LOW |
| CapsulePlaceholder has extra 280px size not in spec | CapsulePlaceholder line 9 | MEDIUM |
| No max-width constraint for desktop (content stretches) | All components | MEDIUM |

---

## 8. Responsive Classes Usage

Only 2 components use Tailwind responsive classes:
- `CapsulePlaceholder.tsx`: `sm:w-[280px] lg:w-[320px]` (wrong BPs)
- `P1CapsuleClosed.tsx`: `sm:w-[320px]` (wrong BP)

**0 responsive classes** in: PolaroidPlaceholder, Button, Header, CapsuleTypeCard, P2-P4 components.

---

## 9. Positive Findings

- All onboarding screens use `100dvh` (dynamic viewport height)
- iOS safe area handling implemented (`safe-top`, `safe-bottom` classes)
- `overscroll-behavior-y: none` prevents bounce
- P4 scroll container uses `overflow-y-auto overscroll-none`
- Keyboard navigation and ARIA labels present on P1
- Icon stroke width matches spec (1.5px)

---

## 10. Remediation Backlog (ordered by impact)

| Priority | Issue | File | Fix |
|----------|-------|------|-----|
| P0 | Fix Tailwind breakpoints to match spec | `tailwind.config.ts` | Override screens: {sm:375,md:428,lg:768,xl:1024} |
| P0 | Fix touch targets (polaroid buttons <44px) | `PolaroidPlaceholder.tsx` lines 70-87 | Increase p-1.5 to p-[10px], icon to 24px |
| P0 | Fix touch targets (CapsuleTypeCard <44px) | `CapsuleTypeCard.tsx` line 19 | Change py-[15px] to py-4 (16px) |
| P1 | Make P2 capsule responsive | `P2CapsuleOpening.tsx` lines 40-41 | Replace const with Tailwind responsive |
| P1 | Standardize padding to px-6 (24px) | Header, P2, P4 | Change px-5/px-8 to px-6 |
| P1 | Fix 5 text sizes to spec | Header, CapsuleTypeCard, P1, P4 | See text sizing table above |
| P2 | Remove extra 280px capsule size | `CapsulePlaceholder.tsx` line 9 | Remove sm:w-[280px] |
| P2 | Add responsive polaroid sizes (80->120px) | P2-P4 polaroid props | Add viewport-aware sizing |
| P3 | Add text truncation safeguards | CapsuleTypeCard, long text elements | Add `truncate` / `line-clamp` |

---

## 11. Verification Commands

```bash
# Start dev server
cd POC_INTERNA/app && npm run dev

# Visual regression test (28 assertions)
python tests/test_onboarding_visual.py

# Playwright screenshot at each breakpoint
node screenshots/capture_onboarding.js

# Check computed styles (manual Playwright script)
# page.evaluate(() => getComputedStyle(el).width)
```

---

## 12. Gate Decision

| Category | Gate |
|----------|------|
| Breakpoints | **FAIL** (wrong values in tailwind.config.ts) |
| Capsule sizing | **FAIL** (inconsistent, wrong breakpoints) |
| Touch targets | **FAIL** (4 elements below 44px minimum) |
| Text sizes | **WARN** (5/9 deviate by 1-2px) |
| Padding | **WARN** (3 different values) |
| Layout breaks | **WARN** (hardcoded sizes, no max-width) |

**Overall: FAIL** (27 specific violations, 4 critical touch target failures)

Total issues: 27 violations across 10 component files.
