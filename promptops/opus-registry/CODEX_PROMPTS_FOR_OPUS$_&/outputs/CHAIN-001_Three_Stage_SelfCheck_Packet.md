# CHAIN-001 Three-Stage Self-Check Packet

## 1) Chain ID and Objective

- Chain ID: `CHAIN-001`
- Objective: Move current `WARN` fronts to `PASS` through chained execution with hard `go/hold` gates:
  1. Responsive (`PRM-UX-008`)
  2. Privacy (`PRM-TRUST-002`)
  3. Performance (`PRM-QUALITY-008 v1.1.0`)

## 2) Stage 1 Packet (Responsive)

- Prompt: `PRM-UX-008`
- Scope:
  - Close remaining responsive WARN items from REV-015.
  - Ensure zero FAIL and zero WARN for viewport/touch/text/padding checks.
- Target files:
  - `POC_INTERNA/app/src/components/onboarding/P1CapsuleClosed.tsx`
  - `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx`
  - `POC_INTERNA/app/src/components/onboarding/P4CapsuleSelection.tsx`
  - `POC_INTERNA/app/src/components/ui/CapsuleTypeCard.tsx`
- Verification commands:
  1. `cd POC_INTERNA/app && npm run lint`
     - Expected: exit code `0`
  2. `cd POC_INTERNA/app && python tests/test_onboarding_visual.py`
     - Expected: regression screenshots generated without FAIL markers
  3. `cd POC_INTERNA/app && npm run autocheck`
     - Expected: no responsive FAIL and no lint FAIL in report

## 3) Stage 1 Self-Check Gate

- Gate: `go` only if all conditions pass:
  - All 3 verification commands pass.
  - No responsive FAIL/WARN items remain in stage output.
  - Evidence paths included (screenshots + command output references).
- Gate: `hold` if any command fails, or responsive WARN persists.
- Rollback trigger:
  - If visual regression introduces new FAIL on P1-P4 baseline, revert stage-specific edits and rerun stage.

## 4) Stage 2 Packet (Privacy)

- Prompt: `PRM-TRUST-002`
- Scope:
  - Close P1 legal/compliance gaps from REV-015.
  - Cover Art. 15/17/20 (data rights), Art. 28 (DPA evidence), and deletion guarantees.
- Target files:
  - `PREREUNION_ANDREA/src/app/api/privacy/export/route.ts`
  - `PREREUNION_ANDREA/src/app/api/privacy/account/route.ts`
  - `PREREUNION_ANDREA/src/hooks/useCapsules.ts`
  - `PREREUNION_ANDREA/src/app/privacidad/page.tsx`
  - `PREREUNION_ANDREA/src/app/terminos/page.tsx`
- Verification commands:
  1. `cd PREREUNION_ANDREA && npm run lint`
     - Expected: exit code `0`
  2. `cd PREREUNION_ANDREA && npx tsc --noEmit`
     - Expected: exit code `0`
  3. `cd PREREUNION_ANDREA && npm run build`
     - Expected: build success, no privacy-route runtime errors

## 5) Stage 2 Self-Check Gate

- Prerequisite: Stage 1 gate must be `go`.
- Gate: `go` only if:
  - All 3 verification commands pass.
  - Data export + account deletion + storage deletion evidence included.
  - Compliance delta demonstrates closure of Art. 15/17/20 and Art. 28 blockers.
- Gate: `hold` if any legal blocker remains open without owner/date.
- Rollback trigger:
  - If deletion/export flows fail build or typecheck, rollback flow-specific changes and split into atomic patches.

## 6) Stage 3 Packet (Performance)

- Prompt: `PRM-QUALITY-008 v1.1.0`
- Scope:
  - Re-measure with production-preferred evidence.
  - Target PASS on LCP/TBT/performance budgets or produce bounded WARN with explicit blocker evidence.
- Target files:
  - `PREREUNION_ANDREA/next.config.js`
  - `PREREUNION_ANDREA/src/lib/firebase.ts`
  - `PREREUNION_ANDREA/src/app/page.tsx`
  - `POC_INTERNA/app/src/components/onboarding/P2CapsuleOpening.tsx`
- Verification commands:
  1. `cd PREREUNION_ANDREA && ANALYZE=true npx next build --webpack`
     - Expected: analyzer artifacts generated in `.next/analyze`
  2. `cd PREREUNION_ANDREA && npx next start -p 3000`
     - Expected: server starts without `prerender-manifest` crash
  3. `npx lighthouse http://localhost:3000/ --output json --chrome-flags="--headless --no-sandbox"`
     - Expected: measured production-style evidence captured
  4. `npx lighthouse http://localhost:3001/onboarding --output json --chrome-flags="--headless --no-sandbox"`
     - Expected: measured TBT/LCP update after animation remediation

## 7) Stage 3 Self-Check Gate

- Prerequisite: Stage 2 gate must be `go`.
- Gate: `go` only if:
  - Performance evidence is command-backed (no estimate-only sections).
  - Per-app and overall gate decisions are present.
  - PASS achieved, or residual WARN has explicit blocker + owner + next command.
- Gate: `hold` if production evidence missing or metric claims are unverified.
- Rollback trigger:
  - If performance edits regress core UX behavior, rollback highest-risk optimization first (lazy-load boundary changes).

## 8) Final Consolidated Gate

- `pass`: all 3 stages gated `go` and final combined status reaches PASS targets.
- `warn`: all stages gated `go` but at least one front remains WARN with bounded blockers and owners.
- `fail`: any stage `hold`, missing evidence, or unresolved critical blocker.

## 9) Rollback and Escalation Conditions

- Escalate immediately if:
  - Stage command repeatedly fails with same root cause after 2 attempts.
  - Legal blocker cannot be closed with code-only changes (requires policy/admin action).
  - Production measurement remains impossible due framework/runtime blocker.
- Rollback policy:
  - Revert only the stage-local patch set.
  - Keep evidence artifacts.
  - Re-run stage from first verification command.
