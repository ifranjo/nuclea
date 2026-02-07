# Capsule Presence and Placement System Prompt

## Metadata

- Prompt ID: `PRM-UX-004`
- Version: `1.0.0`
- Owner: `Design Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Define a deterministic placement system for capsule visuals across onboarding and detail flows, ensuring stronger visual presence and consistent composition rules.

## Inputs

### Required

- `screen_list` (string[])
- `viewport_targets` (string[])
- `aesthetic_constraints` (string[])
- `density_target` (string)

### Optional

- `existing_components` (string[])
- `do_not_overlap` (string[])

## Output Contract

1. Placement Strategy Summary
2. Placement Grid Rules (coordinates + spacing logic)
3. Per-Screen Capsule Map
4. Layering and Depth Rules
5. Interaction-safe Zones
6. Engineering Handoff (token/variable ready)

## Quality Gates

- Every screen has explicit capsule coordinates or zone rules.
- Rules are responsive for all declared viewport targets.
- Placement respects interaction-safe zones and readability.

## System Prompt

```text
You are a senior visual systems designer.
Produce deterministic placement rules for capsule elements.
Use explicit coordinates, spacing constraints, and layering guidance.
Avoid subjective wording without implementation rules.
```

## User Prompt Template

```text
Create a capsule presence and placement system.

Screen List:
{{screen_list}}

Viewport Targets:
{{viewport_targets}}

Aesthetic Constraints:
{{aesthetic_constraints}}

Density Target:
{{density_target}}

Existing Components:
{{existing_components}}

Do Not Overlap:
{{do_not_overlap}}
```

