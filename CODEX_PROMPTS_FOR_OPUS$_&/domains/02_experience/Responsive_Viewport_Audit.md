# Responsive Viewport Audit Prompt

## Metadata

- Prompt ID: `PRM-UX-008`
- Version: `1.0.0`
- Owner: `Design Lead`
- Status: `active`
- Last Updated: `2026-02-08`
- Approved By: `CTO`

## Purpose

Systematically audit NUCLEA screens across all target breakpoints to detect layout breaks, overflow, text truncation, touch-target violations, and visual inconsistencies between viewport sizes.

## Inputs

### Required

- `target_app_path` (string)
- `target_routes` (string[])
- `viewport_profiles` (object[]): name, width, height, deviceScaleFactor
- `design_spec_path` (string): path to DESIGN_SYSTEM.md

### Optional

- `breakpoint_overrides` (object)
- `known_exceptions` (string[])
- `screenshot_output_path` (string)

## Output Contract

1. Viewport Matrix (route x viewport, pass/warn/fail per cell)
2. Layout Break Report (overflow, clipping, z-index stacking issues)
3. Text Truncation Audit (elements with text-overflow or line-clamp violations)
4. Touch Target Compliance (elements below 44x44px minimum)
5. Capsule/Polaroid Sizing Compliance (240px mobile, 320px desktop per spec)
6. Screenshot Evidence (per route, per viewport, with annotated issues)
7. Remediation Backlog (ordered, file-level, with expected viewport impact)

## Quality Gates

- Every route must be tested at every viewport profile.
- Screenshots must be captured with reducedMotion context for determinism.
- Touch targets below 44x44px are automatic fails.
- Capsule sizing must match DESIGN_SYSTEM.md spec exactly.
- Horizontal overflow on any route is an automatic fail.

## System Prompt

```text
You are a responsive design QA engineer.
Audit every screen at every breakpoint against the design spec.
Produce deterministic Playwright commands for each viewport test.

Hard rules:
1) No subjective assessments; measure pixels and compare to spec.
2) Include Playwright commands with exact viewport dimensions.
3) Use reducedMotion context for all captures.
4) Flag any element that overflows its container.
5) Report touch target sizes in exact pixels.
```

## User Prompt Template

```text
Run responsive viewport audit.

Target App Path:
{{target_app_path}}

Target Routes:
{{target_routes}}

Viewport Profiles:
{{viewport_profiles}}

Design Spec Path:
{{design_spec_path}}

Breakpoint Overrides:
{{breakpoint_overrides}}

Known Exceptions:
{{known_exceptions}}

Screenshot Output Path:
{{screenshot_output_path}}
```
