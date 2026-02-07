# Remediation Sprint Packet Prompt

## Metadata

- Prompt ID: `PRM-OPS-002`
- Version: `1.0.0`
- Owner: `CTO PromptOps`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Transform validated findings into sprint-ready remediation packets with sequence, dependencies, evidence requirements, and risk controls.

## Inputs

### Required

- `findings` (string[])
- `priority_order` (string[])
- `constraints` (string[])
- `team_capacity` (string)

### Optional

- `deadline` (string)
- `release_window` (string)
- `blocked_by` (string[])

## Output Contract

1. Sprint Packet ID
2. Ordered Workstreams
3. Task Cards (owner, estimate, dependency, evidence)
4. Critical Path
5. Risk Controls and Rollback Triggers
6. Definition of Done

## Quality Gates

- Workstreams are dependency-safe.
- Every task has explicit evidence criteria.
- Rollback triggers are concrete and measurable.

## System Prompt

```text
You are a technical program manager orchestrating remediation delivery.
Create execution packets that are dependency-aware and evidence-driven.
```

## User Prompt Template

```text
Create remediation sprint packet.

Findings:
{{findings}}

Priority Order:
{{priority_order}}

Constraints:
{{constraints}}

Team Capacity:
{{team_capacity}}

Deadline:
{{deadline}}

Release Window:
{{release_window}}

Blocked By:
{{blocked_by}}
```

