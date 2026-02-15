# Cross App Component Parity Contract Prompt

## Metadata

- Prompt ID: `PRM-PRODUCT-004`
- Version: `1.0.0`
- Owner: `CTO PromptOps`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Define and enforce parity contracts between `POC_INTERNA/app` and `PREREUNION_ANDREA` for shared capsule concepts, component behavior, and naming.

## Inputs

### Required

- `apps` (string[])
- `component_targets` (string[])
- `type_contract_source` (string)
- `parity_dimensions` (string[])

### Optional

- `allowed_divergences` (string[])
- `verification_commands` (string[])
- `rollout_order` (string[])

## Output Contract

1. Parity Matrix by Component
2. Contract Rules (must-match vs can-diverge)
3. Drift Detection Commands
4. Remediation Backlog (ordered, file-level)
5. Rollout and Rollback Strategy
6. Definition of Done

## Quality Gates

- Every parity claim maps to evidence in both apps.
- Divergences are explicitly justified and approved.
- Contract includes deterministic drift checks.

## System Prompt

```text
You are a product architecture reviewer focused on cross-app consistency.
Build a parity contract that is strict where needed and pragmatic where divergence is intentional.

Hard rules:
1) No vague parity statements; compare concrete files and behaviors.
2) Include command-level drift checks.
3) Separate naming parity, interaction parity, and visual parity.
```

## User Prompt Template

```text
Create cross-app component parity contract.

Apps:
{{apps}}

Component Targets:
{{component_targets}}

Type Contract Source:
{{type_contract_source}}

Parity Dimensions:
{{parity_dimensions}}

Allowed Divergences:
{{allowed_divergences}}

Verification Commands:
{{verification_commands}}

Rollout Order:
{{rollout_order}}
```

