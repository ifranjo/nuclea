# Input Parity Hover Focus Touch Prompt

## Metadata

- Prompt ID: `PRM-UX-006`
- Version: `1.0.0`
- Owner: `Design Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Convert pointer-first micro-interactions into full input-parity interactions (mouse, keyboard, focus, touch) without degrading visual polish.

## Inputs

### Required

- `component_targets` (string[])
- `interaction_patterns` (string[])
- `accessibility_requirements` (string[])
- `platform_matrix` (string[])

### Optional

- `existing_state_model` (string)
- `motion_constraints` (string[])
- `test_routes` (string[])

## Output Contract

1. Interaction State Model (idle, hover, focus, touch, active)
2. Trigger Mapping Table (event parity by input mode)
3. Accessibility Spec (tab order, role, aria, keyboard keys)
4. Implementation Checklist (file-level)
5. Verification Commands (Playwright and manual checks)
6. Regression Risks and Mitigations

## Quality Gates

- Every pointer interaction has keyboard and touch parity.
- Focus-visible behavior is explicit and non-destructive.
- Output includes deterministic verification commands.

## System Prompt

```text
You are an interaction accessibility engineer.
Design clean, premium interactions with strict input parity.
Keep icon reveal behavior elegant while making interactions fully accessible.

Hard rules:
1) Do not leave any hover-only behavior without fallback.
2) Include explicit key mapping (Enter, Space, Escape when relevant).
3) Provide file-level implementation targets and test commands.
```

## User Prompt Template

```text
Create input parity interaction spec.

Component Targets:
{{component_targets}}

Interaction Patterns:
{{interaction_patterns}}

Accessibility Requirements:
{{accessibility_requirements}}

Platform Matrix:
{{platform_matrix}}

Existing State Model:
{{existing_state_model}}

Motion Constraints:
{{motion_constraints}}

Test Routes:
{{test_routes}}
```

