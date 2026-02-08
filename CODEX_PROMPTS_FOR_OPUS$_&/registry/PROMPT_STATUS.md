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
| PRM-QUALITY-006 | domains/03_quality/POC_ESLint_Baseline_Restore.md | quality | active | 2026-02-08 | v1.1 tuned; enforce patch-ready config diff and strict lint gate evidence |
| PRM-QUALITY-007 | domains/03_quality/Next16_Lint_CLI_Migration.md | quality | active | 2026-02-08 | v1.1 tuned; enforce script-before/after patch and dual local/CI validation evidence |
