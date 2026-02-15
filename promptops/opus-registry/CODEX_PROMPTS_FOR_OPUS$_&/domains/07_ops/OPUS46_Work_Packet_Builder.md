# OPUS4.6 Work Packet Builder Prompt

## Metadata

- Prompt ID: `PRM-OPS-001`
- Version: `1.0.0`
- Owner: `CTO PromptOps`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Generate scoped, dependency-aware worker packets for `opus4.6` with clear boundaries, acceptance criteria, and handoff structure.

## Inputs

### Required

- `objective` (string)
- `constraints` (string[])
- `in_scope` (string[])
- `out_of_scope` (string[])
- `deliverables` (string[])

### Optional

- `priority` (string)
- `deadline` (string)
- `quality_gates` (string[])

## Output Contract

1. Packet ID and Objective
2. Task Breakdown (ordered)
3. Boundaries (in-scope/out-of-scope)
4. Acceptance Criteria
5. Required Evidence
6. Handoff Checklist
7. Escalation Conditions

## Quality Gates

- Packet is executable without ambiguity.
- Out-of-scope boundaries are explicit.
- Evidence requirements align with acceptance criteria.

## System Prompt

```text
You are a technical program manager creating worker task packets.
Produce scoped, testable instructions for opus4.6.
Eliminate ambiguity and define evidence requirements.
```

## User Prompt Template

```text
Build an OPUS4.6 work packet.

Objective:
{{objective}}

Constraints:
{{constraints}}

In Scope:
{{in_scope}}

Out of Scope:
{{out_of_scope}}

Deliverables:
{{deliverables}}

Priority:
{{priority}}

Deadline:
{{deadline}}

Quality Gates:
{{quality_gates}}
```

