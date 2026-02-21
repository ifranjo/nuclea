# Prompt Status Registry

## Legend

- `active`: stable and delivering target quality
- `needs-tuning`: inconsistent or underperforming
- `retired`: replaced or obsolete

| Prompt ID | File | Domain | Status | Last Review | Next Action |
|---|---|---|---|---|---|
| PRM-PRODUCT-001 | domains/01_product/PRD_Spec_to_Build.md | product | active | 2026-02-07 | Monitor next worker run |
| PRM-PRODUCT-002 | domains/01_product/Frontend_Implementation_Planner.md | product | active | 2026-02-07 | Monitor next worker run |
| PRM-PRODUCT-003 | domains/01_product/Type_System_Contract_Alignment.md | product | active | 2026-02-07 | Use for cross-app type convergence execution |
| PRM-PRODUCT-004 | domains/01_product/Cross_App_Component_Parity_Contract.md | product | active | 2026-02-08 | Run with lint/input-parity batch to lock capsule naming/type parity gates |
| PRM-UX-001 | domains/02_experience/UX_Flow_Critic.md | experience | active | 2026-02-07 | Monitor next worker run |
| PRM-UX-002 | domains/02_experience/Visual_Direction_Art_Direction.md | experience | active | 2026-02-07 | Passed focused v1.1.0 run; monitor implementation fidelity |
| PRM-UX-003 | domains/02_experience/Onboarding_Copy_Engine.md | experience | active | 2026-02-07 | Monitor next worker run |
| PRM-QUALITY-001 | domains/03_quality/QA_Regression_Gate.md | quality | active | 2026-02-07 | Passed focused v1.1.0 run; monitor lint policy drift |
| PRM-QUALITY-002 | domains/03_quality/PromptOps_Prompt_Reviewer.md | quality | active | 2026-02-07 | Use as default tuning engine |
| PRM-QUALITY-003 | domains/03_quality/ESLint_Diagnostics_and_Remediation.md | quality | active | 2026-02-07 | Use when lint/config failures reappear |
| PRM-QUALITY-004 | domains/03_quality/Firebase_Secret_and_Runtime_Gate.md | quality | active | 2026-02-07 | Use for runtime secret/500-risk validation |
| PRM-QUALITY-005 | domains/03_quality/Playwright_PDF_Alignment_Gate.md | quality | active | 2026-02-07 | v1.1 tuned; validate opacity-safe hidden-state checks and lint gate classification |
| PRM-GROWTH-001 | domains/04_growth/Growth_Storytelling.md | growth | active | 2026-02-07 | Monitor next worker run |
| PRM-STAKEHOLDER-001 | domains/05_stakeholder/Investor_Stakeholder_Update.md | stakeholder | active | 2026-02-07 | Monitor next worker run |
| PRM-TRUST-001 | domains/06_trust/Legal_Trust_Messaging.md | trust | active | 2026-02-07 | Monitor next worker run |
| PRM-UX-004 | domains/02_experience/Capsule_Presence_Placement_System.md | experience | active | 2026-02-07 | Use for capsule-density iterations |
| PRM-UX-005 | domains/02_experience/Interactive_Capsule_Hover_Design.md | experience | active | 2026-02-07 | Use for hover/focus refinement; prioritize input-parity remediation for PolaroidPlaceholder |
| PRM-UX-006 | domains/02_experience/Input_Parity_Hover_Focus_Touch.md | experience | active | 2026-02-08 | v1.1 tuned; run focused parity closure on PolaroidPlaceholder with route evidence |
| PRM-UX-007 | domains/02_experience/Capsule_Placement_Tokenization.md | experience | active | 2026-02-07 | Use to centralize placement constants into responsive token system |
| PRM-OPS-001 | domains/07_ops/OPUS46_Work_Packet_Builder.md | ops | active | 2026-02-07 | Default packet generator for worker runs |
| PRM-OPS-002 | domains/07_ops/Remediation_Sprint_Packet.md | ops | active | 2026-02-07 | v1.1 tuned; validate command-evidence strictness on next worker batch |
| PRM-OPS-003 | domains/07_ops/Three_Stage_Self_Check_Chain.md | ops | active | 2026-02-10 | Use as default for 3-stage chained execution with go/hold self-check gates |
| PRM-QUALITY-006 | domains/03_quality/POC_ESLint_Baseline_Restore.md | quality | active | 2026-02-08 | v1.1 tuned; enforce patch-ready config diff and strict lint gate evidence |
| PRM-QUALITY-007 | domains/03_quality/Next16_Lint_CLI_Migration.md | quality | active | 2026-02-08 | v1.1 tuned; enforce script-before/after patch and dual local/CI validation evidence |
| PRM-QUALITY-008 | domains/03_quality/Performance_Budget_Gate.md | quality | active | 2026-02-10 | v1.1.0 applied (dev/prod evidence split, multi-app gate contract, webpack analyzer rule); run chained self-check batch with PRM-UX-008 + PRM-TRUST-002 |
| PRM-UX-008 | domains/02_experience/Responsive_Viewport_Audit.md | experience | active | 2026-02-09 | REV-015 re-run: WARN (was FAIL); 27→10 violations, 0 FAIL remaining; P1: text size 1px deviations, P2: padding consistency |
| PRM-TRUST-002 | domains/06_trust/Privacy_Data_Handling_Compliance.md | trust | active | 2026-02-09 | REV-015 re-run: WARN (was FAIL); 32→58/100; legal pages + consent fixed; P1: data rights (Art. 15/17/20), DPAs (Art. 28) |
| PRM-SEC-001 | domains/08_security/SEC-001_Firestore_Security_Rules.md | security | active | 2026-02-21 | **DONE (Order #1)** — Track ongoing verification in `domains/08_security/SEC-EXECUTION-RUNBOOK.md` Phase 1 |
| PRM-SEC-002 | domains/08_security/SEC-002_Supabase_RLS_Enable.md | security | active | 2026-02-21 | **DONE (Order #4, dependency respected)** — Keep re-verification evidence in Runbook Phase 4 after SEC-003/SEC-006 closure |
| PRM-SEC-003 | domains/08_security/SEC-003_Admin_Key_Fix.md | security | active | 2026-02-21 | **PENDING P0 BLOCKER (Order #2)** — Close remaining admin-secret checks using Runbook Phase 2 checklist |
| PRM-SEC-004 | domains/08_security/SEC-004_Owner_Verification_Guards.md | security | active | 2026-02-21 | **DONE (Parallel P0 lane)** — Use Runbook Parallel P0 evidence template for mutation denial proofs |
| PRM-SEC-005 | domains/08_security/SEC-005_GDPR_Biometric_Enforcement.md | security | active | 2026-02-21 | **DONE (Parallel P0 lane)** — Keep cron+processor-delete evidence in Runbook Parallel P0 checklist |
| PRM-SEC-006 | domains/08_security/SEC-006_Rate_Limiting_POC_REAL.md | security | active | 2026-02-21 | **PENDING P0 BLOCKER (Order #3)** — Complete final endpoint coverage + 429 header proof via Runbook Phase 3 |
| PRM-SEC-007 | domains/08_security/SEC-007_Supabase_Generated_Types.md | security | active | 2026-02-21 | **PARTIAL (Order #5)** — Replace manual type snapshot with canonical CLI generation per Runbook Phase 5 |
| PRM-SEC-008 | domains/08_security/SEC-008_Consent_Fields_POC_REAL.md | security | active | 2026-02-21 | **PARTIAL (Order #6 after SEC-007)** — Final closeout gated by Runbook Phase 6 + SEC-007 completion |
