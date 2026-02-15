# Stage 2 Legal Blockers (Trust/Privacy)

Last updated: 2026-02-13

This document tracks non-code dependencies that block full closure of the trust/privacy gate.

## Open External Dependencies

1. Art. 28 processor agreements (DPA evidence)
- Services: Firebase/Google Cloud and other processors in production scope.
- Required artifact: signed DPA or equivalent contractual evidence.
- Owner: legal/business.

2. Art. 44 international transfer safeguards
- Required artifact: transfer mechanism evidence (for example SCC references and provider documentation path).
- Owner: legal/business.

## Internal Engineering Follow-Up (After Artifacts Exist)

1. Attach evidence references to trust gate outputs (`CODEX_PROMPTS_FOR_OPUS$_&/outputs/*`).
2. Re-run trust/compliance gate and capture decision.
3. Update runbook and status board with artifact locations and gate date.

## Status

- Code-level privacy endpoints exist (`/api/privacy/export`, `/api/privacy/account`).
- Final PASS remains blocked until legal artifacts are attached.
