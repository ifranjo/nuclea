# NUCLEA -- Investor Stakeholder Update

**Prompt ID:** PRM-STAKEHOLDER-001 v1.0.0
**Period:** February 2026 (Week 1)
**Prepared by:** CTO Office
**Date:** 2026-02-07
**Classification:** Confidential -- NDA

---

## 1. Executive Summary

NUCLEA completed its internal proof-of-concept with a 4-screen emotional onboarding flow, codified design system, and 6 capsule types -- all with automated visual QA confirming zero JavaScript errors. The production app (PREREUNION_ANDREA) is live on Vercel with Firebase authentication and capsule CRUD. A 10-prompt CTO-level CODEX library now enables AI-assisted development scaling. We are seeking EUR 150K pre-seed to reach an 18-month runway and begin pilot user acquisition in Q1 2026.

---

## 2. Progress vs Plan

| Planned (Jan-Feb 2026) | Status | Evidence |
|-------------------------|--------|----------|
| Emotional onboarding POC (4 screens) | DONE | POC_INTERNA/app: Welcome, Polaroids, Manifesto, Capsule Selection |
| Design system documentation | DONE | POC_INTERNA/01_SPECS/DESIGN_SYSTEM.md -- palette, typography, spacing, components |
| Capsule type definitions (6 types) | DONE | POC_INTERNA/01_SPECS/CAPSULE_TYPES.md -- legacy, together, social, pet, life-chapter, origin |
| Real photo integration | DONE | 8 family archive photos resized, displayed as interactive polaroids |
| Automated visual QA | DONE | Playwright pipeline: 6 screenshots (4 mobile + 2 desktop), 0 JS errors |
| Production app with auth | DONE | PREREUNION_ANDREA on Vercel: Firebase Auth (Google OAuth + email), Firestore CRUD |
| Prompt operations library | DONE | CODEX_PROMPTS: 10 prompts across 6 domains, governance standard applied |
| Investor documentation | DONE | NUCLEA_POC_DOCUMENTATION.html, AI guide, architecture docs |
| Supabase migration | NOT STARTED | Deferred to post-funding (architecture docs ready) |
| Waitlist launch | NOT STARTED | Scheduled for Month 2 |

**On-track items:** 8 of 10
**Deferred items:** 2 (both planned deferrals, not delays)

---

## 3. KPI Snapshot

### Product Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Functional screens | 5 | 4 onboarding + 1 capsule detail |
| UI components | ~15 | TypeScript/TSX |
| Codebase size | ~2,500 lines | TypeScript + TSX |
| Capsule types defined | 6 | legacy, together, social, pet, life-chapter, origin |
| Automated QA screenshots | 6 | 4 mobile + 2 desktop viewports |
| JS errors in QA | 0 | Playwright headless validation |
| CODEX prompts | 10 | Across 6 domains (product, UX, quality, growth, stakeholder, trust) |

### Market Metrics (Verified Feb 2026)

| Metric | Value | Source |
|--------|-------|--------|
| TAM (2025) | $23B | Mordor Intelligence |
| TAM (2030 projected) | $44B | Mordor Intelligence |
| CAGR | 13.74% | Mordor Intelligence |
| Adults without estate plan | 68% | Caring.com 2024 |
| Plans missing digital assets | 80% | Wealth Management Institute |

### Financial Targets

| Metric | Value |
|--------|-------|
| Pre-seed ask | EUR 150K |
| Monthly burn rate | EUR 8.3K |
| Target runway | 18 months |
| Team size | 2 (CEO + CTO) |
| Blended LTV:CAC target | 5:1 |

---

## 4. Key Risks and Mitigations

| # | Risk | Severity | Likelihood | Mitigation | Owner |
|---|------|----------|------------|------------|-------|
| R1 | **Pre-revenue** -- no paying users yet | High | Certain (current state) | POC validates emotional UX thesis; pilot partnerships being pursued with funeral homes and insurers | CEO |
| R2 | **Single developer** -- bus factor of 1 | High | Current | Documentation codified (DESIGN_SYSTEM.md, CAPSULE_TYPES.md, ARCHITECTURE.md); CODEX prompts enable AI-assisted onboarding of second developer | CTO |
| R3 | **Firebase to Supabase migration pending** -- current backend is temporary | Medium | Planned | Target architecture documented in docs/DATABASE_SCHEMA.md and docs/ARCHITECTURE.md; migration scheduled for Week 4 post-funding | CTO |
| R4 | **No A/B testing or analytics** -- cannot measure conversion | Medium | Current | Analytics and experimentation infrastructure planned for Phase 2 (Month 2-3) | CTO |
| R5 | **Competitor Eternos raised $10.3M** -- well-funded US incumbent | Medium | Ongoing | NUCLEA targets underserved Spanish-language market; pricing 50-100x lower (EUR 9.99-99 vs $5K-15K); only Spanish solution with AI avatars | CEO |

---

## 5. Decisions Needed

### Decision 1: Pre-Seed Investment (EUR 150K)

**Context:** NUCLEA has a functional POC, validated market data ($23B TAM), codified documentation, and a clear 18-month execution plan. The ask is EUR 150K, within the typical Spanish pre-seed range of EUR 145K-500K (EU-Startups benchmark).

**Allocation:**
- Product Development: EUR 55K (37%) -- second developer hire, Supabase migration
- Marketing/Growth: EUR 40K (27%) -- waitlist launch, content, pilot acquisition
- Operations: EUR 30K (20%) -- legal, infrastructure, tools
- Reserve: EUR 25K (16%) -- contingency

**Decision required from:** Investors
**Deadline:** End of February 2026

### Decision 2: Pilot Partner Introductions

**Context:** Revenue depends on converting free users to paid plans (EUR 9.99-99/mo). B2B distribution through funeral homes, insurance companies, and healthcare providers would accelerate adoption and reduce CAC below the EUR 8.50 target.

**Ask:** Introductions to 3-5 potential pilot partners in Spain.
**Decision required from:** Investors / Advisory network
**Deadline:** March 2026

### Decision 3: Legal Counsel Engagement

**Context:** Post-mortem content delivery, GDPR compliance for deceased users' data, and inheritance law intersections require specialized legal review before beta launch.

**Ask:** Recommendation or engagement of legal counsel with GDPR and digital inheritance expertise.
**Decision required from:** CEO + Investors
**Deadline:** Before beta launch (Month 3)

---

## 6. Next Period Plan

### Week 2-3 (Feb 10-21): Capsule Creation Flow

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| Media upload UI | Drag-and-drop photo/video upload with preview | CTO |
| Content editor | Rich text editor for memories and messages | CTO |
| Closure ritual | Animated capsule sealing ceremony (emotional UX) | CTO |
| Andrea design review | CEO reviews POC screenshots against original PDFs | CEO |

### Week 4 (Feb 24-28): Backend Migration

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| Supabase setup | PostgreSQL schema, auth, storage bucket configuration | CTO |
| Auth migration | Replace Firebase Auth with Supabase Auth (Google OAuth + email) | CTO |
| Data migration | Firestore documents to PostgreSQL rows | CTO |

### Month 2 (March): Growth Infrastructure

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| Landing page optimization | Conversion-focused landing with waitlist form | CEO + CTO |
| Waitlist launch | Email capture with automated nurture sequence | CEO |
| Analytics integration | Event tracking for onboarding funnel measurement | CTO |

### Month 3 (April): Beta Launch

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| Beta program | 50 pilot users with guided onboarding | CEO |
| Feedback system | In-app feedback collection and NPS measurement | CTO |
| Legal review complete | GDPR and inheritance compliance validated | CEO + Legal |

### Month 4 (May): First Revenue

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| Payment integration | Stripe for EUR 9.99/mo and EUR 99 one-time plans | CTO |
| Paid capsule activation | Esencial, Familiar, and EverLife plans live | CTO |
| First paying users | Target: 10-20 paid conversions from beta cohort | CEO |

### Dependencies

| Dependency | Blocks | Status |
|------------|--------|--------|
| Funding secured | Second developer hire, marketing spend | Pending investor decision |
| Legal review | Beta launch, post-mortem delivery mechanism | Not started |
| Andrea's design review | Capsule creation flow final design | Scheduled Week 2 |

---

*Generated by PRM-STAKEHOLDER-001 v1.0.0 | 2026-02-07*
*Data verified via JARVIS Protocol (15 searches) | All market figures sourced and cited*
*Next update: February 2026 (Week 3)*
