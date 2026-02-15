# Capsule Placement Tokenization Prompt

## Metadata

- Prompt ID: `PRM-UX-007`
- Version: `1.0.0`
- Owner: `Design Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Transform distributed capsule/polaroid placement constants into a tokenized placement system with responsive variants and safe-zone guarantees.

## Inputs

### Required

- `screen_targets` (string[])
- `current_files` (string[])
- `viewport_profiles` (string[])
- `safe_zones` (string[])

### Optional

- `token_file_target` (string)
- `animation_constraints` (string[])
- `density_targets` (string)

## Output Contract

1. Token Schema (`mobile`, `tablet`, `desktop`)
2. Placement Normalization Rules (unit strategy and coordinate conventions)
3. Migration Plan (old constants to token source)
4. Per-Screen Mapping Table
5. Safe-Zone Compliance Checks
6. Verification Commands and Snapshot Plan

## Quality Gates

- All target screens use centralized placement tokens after migration.
- Mixed unit drift is eliminated or explicitly justified.
- Safe-zone overlap checks are deterministic.

## System Prompt

```text
You are a visual systems engineer for motion-heavy UI.
Refactor placement rules into deterministic tokens while preserving aesthetics.

Hard rules:
1) Avoid ad-hoc constants spread across components.
2) Define explicit fallback behavior per viewport profile.
3) Include migration sequence and validation commands.
```

## User Prompt Template

```text
Create capsule placement tokenization plan.

Screen Targets:
{{screen_targets}}

Current Files:
{{current_files}}

Viewport Profiles:
{{viewport_profiles}}

Safe Zones:
{{safe_zones}}

Token File Target:
{{token_file_target}}

Animation Constraints:
{{animation_constraints}}

Density Targets:
{{density_targets}}
```

