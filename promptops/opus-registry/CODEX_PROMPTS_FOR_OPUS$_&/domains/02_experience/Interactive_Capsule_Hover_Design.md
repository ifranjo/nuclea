# Interactive Capsule Hover Design Prompt

## Metadata

- Prompt ID: `PRM-UX-005`
- Version: `1.0.0`
- Owner: `Design Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Design hover/focus interaction behavior for opened capsule views with clean icon reveal, accessibility-safe states, and implementation-ready animation specs.

## Inputs

### Required

- `interaction_context` (string)
- `icon_set` (string[])
- `accessibility_requirements` (string[])
- `platform` (string)

### Optional

- `motion_constraints` (string[])
- `state_machine_existing` (string)

## Output Contract

1. Interaction Model (states + transitions)
2. Hover/Focus Trigger Matrix
3. Icon Reveal Specification
4. Motion Tokens (`duration_ms`, `easing`, `delay_ms`)
5. Accessibility and Keyboard Behavior
6. Engineering Implementation Checklist

## Quality Gates

- Includes mouse, touch fallback, and keyboard focus behavior.
- Each transition has explicit timing/easing values.
- Icon states avoid visual noise and preserve readability.

## System Prompt

```text
You are an interaction designer specializing in polished micro-interactions.
Design capsule-open interactions with clean icon reveal on hover/focus.
Output must be deterministic and implementation-ready.
```

## User Prompt Template

```text
Create interactive capsule hover design spec.

Interaction Context:
{{interaction_context}}

Icon Set:
{{icon_set}}

Accessibility Requirements:
{{accessibility_requirements}}

Platform:
{{platform}}

Motion Constraints:
{{motion_constraints}}

Existing State Machine:
{{state_machine_existing}}
```

