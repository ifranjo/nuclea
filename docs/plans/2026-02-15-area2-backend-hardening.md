# Area 2 Backend Hardening + Opus QA Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden API boundaries and runtime behavior (validation, rate limiting, fail-fast init, pagination, error boundaries) and complete a focused consent/QA review.

**Architecture:** Introduce shared server-side primitives (`zod` API parsing, rate-limit service, admin init guards) so all route handlers consume consistent boundary checks. Move capsule reads to authenticated cursor pagination via API to reduce Firestore fanout and add graceful UI error boundaries.

**Tech Stack:** Next.js App Router, TypeScript strict mode, Firebase Admin/Firestore, Firebase Web SDK, Zod.

---

### Task 1: Test Harness + Red Tests for New Primitives

**Files:**
- Modify: `PREREUNION_ANDREA/package.json`
- Modify: `PREREUNION_ANDREA/package-lock.json`
- Create: `PREREUNION_ANDREA/src/lib/api-validation.test.ts`
- Create: `PREREUNION_ANDREA/src/lib/rate-limit.test.ts`
- Create: `PREREUNION_ANDREA/src/lib/capsule-pagination.test.ts`

**Step 1: Write failing tests**
- Add tests for invalid waitlist payloads, invalid capsule pagination query params, and rate-limit window accounting behavior.

**Step 2: Run tests to verify red**
- Run: `cd PREREUNION_ANDREA && npm run test:unit`
- Expected: fail because helper modules do not exist yet.

**Step 3: Add minimal test runner wiring**
- Add `tsx` + `test:unit` script.

**Step 4: Re-run to ensure tests execute and remain red for expected reasons**
- Run: `cd PREREUNION_ANDREA && npm run test:unit`

### Task 2: Shared Validation + Rate Limit + Firebase Admin Fail-Fast

**Files:**
- Create: `PREREUNION_ANDREA/src/lib/api-validation.ts`
- Create: `PREREUNION_ANDREA/src/lib/rate-limit.ts`
- Modify: `PREREUNION_ANDREA/src/lib/firebase-admin.ts`

**Step 1: Implement validation helpers**
- Add typed JSON/query parsers with zod-safe error surface.

**Step 2: Implement rate-limit service**
- Add deterministic key hashing, window bucketing, and Firestore-backed counters.

**Step 3: Harden firebase-admin init**
- Replace lazy-warning path with explicit init errors and deterministic singleton init.

**Step 4: Run tests**
- Run: `cd PREREUNION_ANDREA && npm run test:unit`
- Expected: green for primitives.

### Task 3: API Route Hardening + Cursor Pagination

**Files:**
- Modify: `PREREUNION_ANDREA/src/app/api/waitlist/route.ts`
- Modify: `PREREUNION_ANDREA/src/app/api/waitlist/unsubscribe/route.ts`
- Modify: `PREREUNION_ANDREA/src/app/api/capsules/route.ts`
- Modify: `PREREUNION_ANDREA/src/app/api/privacy/account/route.ts`
- Modify: `PREREUNION_ANDREA/src/app/api/privacy/export/route.ts`

**Step 1: Add zod validation to all API routes**
- Validate body/query inputs consistently and return 400 with field-level messages.

**Step 2: Add waitlist POST rate limiting**
- Enforce per-IP and per-email windows before write path.

**Step 3: Add capsule cursor pagination**
- Support `limit` + `cursor`, return `hasMore` + `nextCursor`.

**Step 4: Run tests + lint**
- Run: `cd PREREUNION_ANDREA && npm run test:unit && npm run lint`

### Task 4: Client Pagination + Error Boundaries

**Files:**
- Modify: `PREREUNION_ANDREA/src/hooks/useCapsules.ts`
- Modify: `PREREUNION_ANDREA/src/app/dashboard/page.tsx`
- Modify: `PREREUNION_ANDREA/src/app/capsulas/[id]/page.tsx`
- Create: `PREREUNION_ANDREA/src/app/dashboard/error.tsx`
- Create: `PREREUNION_ANDREA/src/app/capsulas/[id]/error.tsx`

**Step 1: Consume paginated API in hook**
- Fetch first page + load-more path via bearer token.

**Step 2: Surface listener/fetch errors**
- Expose hook error and throw in route segment for boundary capture.

**Step 3: Add route-level error boundaries**
- Add retry/reset UX for dashboard and capsule edit segments.

**Step 4: Re-run checks**
- Run: `cd PREREUNION_ANDREA && npm run test:unit && npm run lint && npx tsc --noEmit`

### Task 5: Verification + Consent QA Review Output

**Files:**
- Modify (if needed): `PREREUNION_ANDREA/src/types/index.ts`
- Modify (if needed): `PREREUNION_ANDREA/src/hooks/useAuth.ts`
- Update: `PREREUNION_ANDREA/docs/quality/PRIVACY_ENDPOINTS_RUNBOOK.md` (if behavior changed)

**Step 1: Execute full verification**
- Run:
  - `cd PREREUNION_ANDREA && npm run build`
  - `cd PREREUNION_ANDREA && npm run smoke:routes`
  - `cd PREREUNION_ANDREA && npm run check:ontology`

**Step 2: Perform Area 1 consent code review**
- Validate GDPR-relevant fields, source provenance, edge-case handling.

**Step 3: Summarize findings with file-level evidence**
- Include fixed issues + residual risks.

**Step 4: Commit**
- `git add ...`
- `git commit -m "feat(prereunion): harden api boundaries and pagination"`