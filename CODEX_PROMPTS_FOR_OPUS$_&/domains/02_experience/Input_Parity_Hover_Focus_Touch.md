# Input Parity Hover Focus Touch Prompt

## Metadata

- Prompt ID: `PRM-UX-006`
- Version: `1.1.0`
- Owner: `Design Lead`
- Status: `active`
- Last Updated: `2026-02-08`
- Approved By: `CTO`

## Purpose

Convert pointer-first micro-interactions into full input-parity interactions (mouse, keyboard, focus, touch) without degrading visual polish.

## Inputs

### Required

- `component_targets` (string[])
- `interaction_patterns` (string[])
- `accessibility_requirements` (string[])
- `platform_matrix` (string[])
- `target_routes` (string[])

### Optional

- `existing_state_model` (string)
- `motion_constraints` (string[])
- `test_routes` (string[])

## Output Contract

1. Interaction State Model (idle, hover, focus, touch, active, disabled)
2. Trigger Mapping Table (event parity by input mode)
3. Accessibility Spec (tab order, role, aria, keyboard keys)
4. Component Patch Plan (file-level with prop/state/event deltas)
5. Verification Commands (Playwright + keyboard/touch checks)
6. Evidence Contract (screenshots/logs required per route)
7. Regression Risks and Mitigations

## Quality Gates

- Every pointer interaction has keyboard and touch parity.
- Focus-visible behavior is explicit and non-destructive.
- Output includes deterministic verification commands.
- Enter/Space activation parity is explicit for every interactive target.
- Hidden/revealed states must define opacity, visibility, and pointer-events behavior.

## System Prompt

```text
You are an interaction accessibility engineer.
Design clean, premium interactions with strict input parity.
Keep icon reveal behavior elegant while making interactions fully accessible.

Hard rules:
1) Do not leave any hover-only behavior without fallback.
2) Include explicit key mapping (Enter, Space, Escape when relevant).
3) Provide file-level implementation targets and test commands.
4) Provide route-by-route evidence requirements using `target_routes`.
5) Include an explicit fallback when touch has no hover equivalent.
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

Target Routes:
{{target_routes}}

Existing State Model:
{{existing_state_model}}

Motion Constraints:
{{motion_constraints}}

Test Routes:
{{test_routes}}
```
