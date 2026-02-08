# CODEX PROMPTS FOR OPUS

Central prompt library for CTO-level execution.  
Scope: product design, UX quality, implementation planning, QA gates, growth messaging, stakeholder communication, and trust/legal copy.

## Folder Structure

- `00_STANDARDS.md`: Governance, naming, versioning, QA rules.
- `01_PROMPT_TEMPLATE.md`: Reusable prompt spec template.
- `02_CTO_OPERATING_MODEL.md`: Delegation-first CTO operating rules.
- `03_OPUS46_RESULT_REVIEW_TEMPLATE.md`: Standard review format for worker outputs.
- `domains/`: Prompt packs by business domain.
  - `01_product/`
  - `02_experience/`
  - `03_quality/`
  - `04_growth/`
  - `05_stakeholder/`
  - `06_trust/`
  - `07_ops/`
- `domains/_retired/`: Retired prompts kept for audit traceability.
- `registry/PROMPT_STATUS.md`: Active/tuning/retired status board.
- `registry/OPUS46_REVIEW_LOG.md`: Iteration-by-iteration result log.
- `99_CHANGELOG.md`: Library change history.

## Prompt Inventory

1. `domains/01_product/PRD_Spec_to_Build.md`
2. `domains/01_product/Frontend_Implementation_Planner.md`
3. `domains/02_experience/UX_Flow_Critic.md`
4. `domains/02_experience/Visual_Direction_Art_Direction.md`
5. `domains/02_experience/Onboarding_Copy_Engine.md`
6. `domains/03_quality/QA_Regression_Gate.md`
7. `domains/03_quality/PromptOps_Prompt_Reviewer.md`
8. `domains/04_growth/Growth_Storytelling.md`
9. `domains/05_stakeholder/Investor_Stakeholder_Update.md`
10. `domains/06_trust/Legal_Trust_Messaging.md`
11. `domains/02_experience/Capsule_Presence_Placement_System.md`
12. `domains/02_experience/Interactive_Capsule_Hover_Design.md`
13. `domains/03_quality/ESLint_Diagnostics_and_Remediation.md`
14. `domains/07_ops/OPUS46_Work_Packet_Builder.md`
15. `domains/01_product/Type_System_Contract_Alignment.md`
16. `domains/03_quality/Firebase_Secret_and_Runtime_Gate.md`
17. `domains/07_ops/Remediation_Sprint_Packet.md`
18. `domains/03_quality/Playwright_PDF_Alignment_Gate.md`
19. `domains/03_quality/POC_ESLint_Baseline_Restore.md`
20. `domains/02_experience/Input_Parity_Hover_Focus_Touch.md`
21. `domains/02_experience/Capsule_Placement_Tokenization.md`
22. `domains/01_product/Cross_App_Component_Parity_Contract.md`
23. `domains/03_quality/Next16_Lint_CLI_Migration.md`

## Operating Model

1. Select prompt by decision domain.
2. Fill required inputs exactly.
3. Enforce output schema and quality gates.
4. Save outputs with date + owner.
5. Review and version prompts through `00_STANDARDS.md`.

## CTO Flow (Delegation-First)

1. `opus4.6` executes scoped worker tasks.
2. Review outputs with `03_OPUS46_RESULT_REVIEW_TEMPLATE.md`.
3. Update `registry/PROMPT_STATUS.md` (`active`, `needs-tuning`, `retired`).
4. Tune or create prompts only when evidence shows a gap.
5. Apply manual code changes only for out-of-scope complexity exceptions.
