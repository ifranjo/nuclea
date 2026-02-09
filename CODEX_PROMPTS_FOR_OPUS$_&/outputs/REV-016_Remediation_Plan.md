# REV-016 Remediation Plan

## Metadata
- Source: REV-015 gate results (all 3 WARN)
- Objective: Move all 3 gates from WARN to PASS
- Constraint: Plan only — no code implementation in this document

---

## Front 1: Performance (PRM-QUALITY-008)

### P1-PERF-01: Fix `next start` for PREREUNION_ANDREA

- **Objective**: Enable production Lighthouse (currently blocked by ENOENT prerender-manifest.json)
- **Files**: `PREREUNION_ANDREA/next.config.js`, build pipeline
- **Verification**: `cd PREREUNION_ANDREA && npm run build && npx next start -p 3000` → no ENOENT error
- **Done criteria**: `next start` serves pages without crash
- **Risk**: Medium — Next 16.1.4 may require config change or downgrade to 15.x

### P1-PERF-02: Reduce POC TBT (1,010ms → <200ms)

- **Objective**: Cut Total Blocking Time from animation-heavy P2 component
- **Files**: `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx`
- **Verification**: `npx lighthouse http://localhost:3001/onboarding --output json --chrome-flags="--headless --no-sandbox"` → TBT < 200ms
- **Done criteria**: Lighthouse TBT < 200ms
- **Risk**: Low — reduce simultaneous Framer Motion animations, use `will-change` hints

### P1-PERF-03: Lazy-load Firebase SDK in PREREUNION_ANDREA

- **Objective**: Reduce initial JS from 1.3MB raw — Firebase SDK accounts for ~400KB across 2 chunks
- **Files**: `PREREUNION_ANDREA/src/lib/firebase.ts`
- **Verification**: `cd PREREUNION_ANDREA && ANALYZE=true npx next build --webpack && du -ch .next/static/chunks/*.js | tail -1` → total < 900KB
- **Done criteria**: Firebase chunks loaded dynamically, initial bundle < 900KB raw
- **Risk**: Medium — requires dynamic import() + code split boundary; auth flow must still work on page load

### P2-PERF-04: Convert landing to Server Components

- **Objective**: Improve PREREUNION LCP (8.8s → <2.5s)
- **Files**: `PREREUNION_ANDREA/src/app/page.tsx`, related client components
- **Verification**: `npx lighthouse http://localhost:3000/ --chrome-flags="--headless --no-sandbox"` → LCP < 2.5s
- **Done criteria**: LCP < 2.5s on dev server
- **Risk**: Low — landing page has no interactive state requirements

### P2-PERF-05: Reduce font weights (9 → 6)

- **Objective**: Remove unused font weight variants to reduce network requests
- **Files**: `PREREUNION_ANDREA/src/app/layout.tsx`, `POC_INTERNA/app/src/app/layout.tsx`
- **Verification**: Network tab shows ≤6 font file requests on page load
- **Done criteria**: Font files reduced from 9 to ≤6
- **Risk**: Low — verify no component uses removed weights

---

## Front 2: Responsive (PRM-UX-008)

### P1-RESP-01: Fix CapsuleTypeCard text sizes

- **Objective**: Title 17→18px, tagline 13→14px (spec compliance)
- **Files**: `POC_INTERNA/app/src/components/ui/CapsuleTypeCard.tsx:38,41`
- **Verification**: `grep 'text-\[' POC_INTERNA/app/src/components/ui/CapsuleTypeCard.tsx` → no 17px or 13px values
- **Done criteria**: Title renders at 18px, tagline at 14px
- **Risk**: None

### P1-RESP-02: Make P2 capsule responsive

- **Objective**: Capsule size 240px mobile → 320px at lg breakpoint (currently hardcoded 240px)
- **Files**: `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx:40-41`
- **Verification**: Playwright screenshot at 1440px shows capsule at 320px width
- **Done criteria**: Capsule width responds to breakpoint
- **Risk**: Low — may need to convert JS const to CSS responsive class or conditional logic

### P2-RESP-03: Fix padding consistency

- **Objective**: P2 px-8→px-6, P4 px-5→px-6 (standard 24px)
- **Files**: `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx:278`, `POC_INTERNA/app/src/components/onboarding/P4CapsuleSelection.tsx:126`
- **Verification**: `grep 'px-[58]' POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx POC_INTERNA/app/src/components/onboarding/P4CapsuleSelection.tsx` → no matches
- **Done criteria**: Both screens use px-6 (24px)
- **Risk**: None

### P2-RESP-04: Fix hint/small text sizes

- **Objective**: P1 hint 13→12px, P4 small text 15→14px
- **Files**: `POC_INTERNA/app/src/components/onboarding/P1CapsuleClosed.tsx:68`, `POC_INTERNA/app/src/components/onboarding/P4CapsuleSelection.tsx:140`
- **Verification**: `grep 'text-\[13px\]' P1CapsuleClosed.tsx` → no match; `grep 'text-\[15px\]' P4CapsuleSelection.tsx` → no match
- **Done criteria**: Hint text at 12px (text-xs), small text at 14px (text-sm)
- **Risk**: None

### P3-RESP-05: Add max-width constraint

- **Objective**: Prevent content stretching beyond comfortable reading width on desktop
- **Files**: All onboarding screen components (P1-P4)
- **Verification**: Desktop screenshot at 1440px shows content constrained to max-w-md
- **Done criteria**: Content does not stretch full-width on large screens
- **Risk**: Low — may affect existing layout proportions

### P3-RESP-06: Fix 2xl breakpoint

- **Objective**: 2xl 1280→1440px (spec compliance)
- **Files**: `POC_INTERNA/app/tailwind.config.ts:13`
- **Verification**: `grep '2xl' POC_INTERNA/app/tailwind.config.ts` → shows 1440px
- **Done criteria**: 2xl breakpoint at 1440px
- **Risk**: None

---

## Front 3: Privacy (PRM-TRUST-002)

### P1-PRIV-01: Implement data export (Art. 15, 20)

- **Objective**: Allow users to download their data as JSON/ZIP
- **Files**: New: settings page or API route in PREREUNION_ANDREA
- **Verification**: User can trigger export → receives JSON with capsules, profile, media links
- **Done criteria**: Data export feature accessible from user settings
- **Risk**: Medium — requires Firestore query + Storage URL aggregation

### P1-PRIV-02: Fix Storage file deletion on capsule delete (Art. 17)

- **Objective**: Delete associated Storage files when capsule is deleted (currently orphaned)
- **Files**: `PREREUNION_ANDREA/src/hooks/useCapsules.ts:110-124`
- **Verification**: Delete capsule → verify Storage bucket shows no orphaned files for that capsule ID
- **Done criteria**: `listAll()` + `deleteObject()` called for capsule storage path before Firestore delete
- **Risk**: Medium — must handle partial failures (some files deleted, some not)

### P1-PRIV-03: Implement account deletion flow (Art. 17)

- **Objective**: Allow users to delete their account and all associated data
- **Files**: New: settings page in PREREUNION_ANDREA
- **Verification**: User triggers account deletion → Firestore profile deleted + Auth user deleted + Storage files deleted
- **Done criteria**: Complete data erasure flow with confirmation dialog
- **Risk**: High — must cascade delete across Auth, Firestore, and Storage; irreversible

### P1-PRIV-04: Configure Firebase region (Art. 44)

- **Objective**: Set Firebase to EU region (eu-west1) for GDPR data residency
- **Files**: `PREREUNION_ANDREA/src/lib/firebase.ts`, Firebase console
- **Verification**: `grep 'eu-west' PREREUNION_ANDREA/src/lib/firebase.ts` → region configured
- **Done criteria**: All Firebase services configured with EU region
- **Risk**: High — may require new Firebase project; existing data would need migration

### P1-PRIV-05: Sign Google Cloud DPA (Art. 28)

- **Objective**: Execute Data Processing Agreement with Google Cloud for Firebase
- **Files**: External process (Google Cloud Console → Compliance)
- **Verification**: DPA document signed and archived
- **Done criteria**: Signed DPA on file
- **Risk**: Low — administrative process, no code change

### P2-PRIV-06: Waitlist consent + unsubscribe (Art. 21)

- **Objective**: Add explicit consent checkbox to waitlist form, provide unsubscribe mechanism
- **Files**: `PREREUNION_ANDREA/src/app/api/waitlist/route.ts`, waitlist form component
- **Verification**: Waitlist signup requires consent checkbox; unsubscribe link works
- **Done criteria**: Consent persisted + unsubscribe endpoint functional
- **Risk**: Low

### P2-PRIV-07: AI Avatar biometric consent document (Art. 9)

- **Objective**: Create explicit consent document for voice/face processing in AI Avatar feature
- **Files**: New: `PREREUNION_ANDREA/public/legal/consentimiento-biometrico.pdf` or page
- **Verification**: Consent document accessible, references Art. 9 GDPR explicit consent
- **Done criteria**: Document exists and is linked from avatar creation flow
- **Risk**: Medium — requires legal review

### P2-PRIV-08: Audit logging

- **Objective**: Log consent events, data access, and deletion requests for accountability
- **Files**: New: middleware or utility in PREREUNION_ANDREA
- **Verification**: Consent acceptance creates audit log entry in Firestore
- **Done criteria**: Key privacy events logged with timestamp, user ID, action type
- **Risk**: Low

### P3-PRIV-09: Automated data retention cleanup

- **Objective**: Implement cron job to purge data beyond retention period
- **Files**: New: Cloud Function or cron in PREREUNION_ANDREA
- **Verification**: Expired data automatically flagged/deleted per retention policy
- **Done criteria**: Automated cleanup runs on schedule
- **Risk**: Low — can implement after launch

---

## Summary

| Front | P1 Tasks | P2 Tasks | P3 Tasks | Target Gate |
|-------|----------|----------|----------|-------------|
| Performance | 3 | 2 | 0 | PASS (Perf >80, LCP <2.5s) |
| Responsive | 2 | 2 | 2 | PASS (0 WARN remaining) |
| Privacy | 5 | 3 | 1 | PASS (score >80/100) |
| **Total** | **10** | **7** | **3** | All PASS |

## Execution Order

1. P1-RESP-01, P1-RESP-02 (quick wins, zero risk)
2. P1-PERF-01 (unblocks production Lighthouse)
3. P1-PERF-02 (TBT reduction, high impact)
4. P1-PRIV-02 (Storage file deletion, high GDPR risk)
5. P1-PRIV-05 (DPA signing, no code dependency)
6. P1-PERF-03 (Firebase lazy-load, medium complexity)
7. P1-PRIV-01, P1-PRIV-03 (data rights, new pages)
8. P1-PRIV-04 (Firebase region, highest risk — may require new project)
9. P2 tasks in parallel
10. P3 tasks post-launch
