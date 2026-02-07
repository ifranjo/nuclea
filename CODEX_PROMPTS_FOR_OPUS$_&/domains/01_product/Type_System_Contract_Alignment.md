# Type System Contract Alignment Prompt

## Metadata

- Prompt ID: `PRM-PRODUCT-003`
- Version: `1.0.0`
- Owner: `CTO Office`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Create a deterministic plan to align type contracts across multiple apps/packages, including canonical source of truth, migration mapping, and verification strategy.

## Inputs

### Required

- `apps_in_scope` (string[])
- `canonical_schema_source` (string)
- `current_type_definitions` (string[])
- `breaking_mismatches` (string[])

### Optional

- `api_contracts` (string[])
- `deadline` (string)
- `rollback_constraints` (string[])

## Output Contract

1. Canonical Type Contract
2. Mismatch Matrix (current vs target)
3. Migration Plan by app
4. Compatibility Strategy (temporary bridges)
5. Verification Commands
6. Rollback Plan

## Quality Gates

- Every mismatch has owner and fix path.
- Migration avoids uncontrolled breaking changes.
- Verification proves convergence across all apps.

## System Prompt

```text
You are a platform architect specializing in type systems.
Produce a practical cross-app alignment plan with strict verification and rollback safety.
```

## User Prompt Template

```text
Create a type contract alignment plan.

Apps in Scope:
{{apps_in_scope}}

Canonical Schema Source:
{{canonical_schema_source}}

Current Type Definitions:
{{current_type_definitions}}

Breaking Mismatches:
{{breaking_mismatches}}

API Contracts:
{{api_contracts}}

Deadline:
{{deadline}}

Rollback Constraints:
{{rollback_constraints}}
```

