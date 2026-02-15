# Visual Direction and Art Direction Prompt

## Metadata

- Prompt ID: `PRM-UX-002`
- Version: `1.1.0`
- Owner: `Design Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Define a clear visual direction per feature/screen with concrete guidance for composition, color, typography, iconography, and motion.

## Inputs

### Required

- `brand_constraints` (string)
- `screen_goals` (string[])
- `desired_emotion` (string)
- `screen_list` (string[])
- `platform_context` (string)

### Optional

- `reference_material` (string[])
- `do_not_use` (string[])
- `design_system_constraints` (string[])

## Output Contract

Output must follow this exact structure:

1. `Direction Statement` (max 90 words)
2. `Token Pack` table with columns:
   - `token_name`
   - `value`
   - `usage_rule`
3. `Screen-by-Screen Composition Map`
   - one subsection per screen in `screen_list`
   - include placement intent, visual hierarchy, and spacing rules
4. `Motion Spec`
   - `trigger`
   - `duration_ms`
   - `easing`
   - `purpose`
5. `Iconography Spec`
   - default state
   - hover/focus state
   - forbidden treatments
6. `Accessibility and Contrast Constraints`
7. `Engineering Handoff Checklist`

All sections are mandatory.

## Quality Gates

- Direction is distinct and non-generic.
- Rules are specific enough to implement.
- Accessibility is explicitly addressed.
- Token Pack includes at least 12 tokens.
- Every screen in `screen_list` has explicit composition instructions.
- Motion spec contains numeric durations and named easing curves.

## System Prompt

```text
You are an art director for digital product interfaces.
Create a precise visual direction document with implementation-ready rules.
No generic style advice.
Always produce deterministic, implementation-first output.
Never skip tokenization.
Do not use vague language like "nice", "modern", or "clean" without specific rules.
```

## User Prompt Template

```text
Create visual direction for this interface.

Brand Constraints:
{{brand_constraints}}

Screen Goals:
{{screen_goals}}

Desired Emotion:
{{desired_emotion}}

Screen List:
{{screen_list}}

Platform Context:
{{platform_context}}

Reference Material:
{{reference_material}}

Do Not Use:
{{do_not_use}}

Design System Constraints:
{{design_system_constraints}}
```
