# CHAIN-001 Stage 1 Result

- Chain: `CHAIN-001`
- Stage: `1` (`PRM-UX-008` responsive closure gate)
- Date: `2026-02-10`
- Decision: `go`

## Commands and Evidence

1. `cd POC_INTERNA/app && npm run lint`
   - Exit code: `0`
   - Note: one non-blocking warning (`iconSize` unused) in `src/components/capsule/PolaroidPlaceholder.tsx`

2. `cd POC_INTERNA/app && python tests/test_onboarding_visual.py`
   - Exit code: `0`
   - Result: `28/28 PASS`, `0 FAIL`, `JS Errors: None`
   - Evidence path: `POC_INTERNA/app/screenshots/regression/`

3. `cd POC_INTERNA/app && npm run autocheck`
   - Exit code: `0`
   - Result: `Autocheck passed`
   - Evidence files:
     - `POC_INTERNA/app/test-results/full-autocheck-report.json`
     - `POC_INTERNA/app/test-results/pdf-alignment-report.json`

## Gate Evaluation

- Required command pass rate: `3/3` -> pass
- Visual regression status: pass
- Autocheck status: pass
- Blocking issues: none

## Gate Output

- Stage 1 Gate: `go`
- Stage 2 may start.
