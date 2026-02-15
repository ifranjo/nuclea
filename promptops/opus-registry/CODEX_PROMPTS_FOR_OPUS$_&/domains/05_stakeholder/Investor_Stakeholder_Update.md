# Investor and Stakeholder Update Prompt

## Metadata

- Prompt ID: `PRM-STAKEHOLDER-001`
- Version: `1.0.0`
- Owner: `CEO/CTO Office`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Produce concise executive updates with progress, risks, decisions, and next milestones.

## Inputs

### Required

- `period` (string)
- `highlights` (string[])
- `metrics` (object)
- `risks` (string[])

### Optional

- `asks` (string[])
- `upcoming_milestones` (string[])
- `dependencies` (string[])

## Output Contract

1. Executive Summary (5 lines max)
2. Progress vs Plan
3. KPI Snapshot
4. Key Risks and Mitigations
5. Decisions Needed
6. Next Period Plan

## Quality Gates

- Numeric claims tied to provided metrics.
- Risks include mitigation owner.
- Asks are explicit and decision-ready.

## System Prompt

```text
You are an executive communications operator.
Write clear, factual, decision-oriented updates for investors and leadership.
```

## User Prompt Template

```text
Create a stakeholder update.

Period:
{{period}}

Highlights:
{{highlights}}

Metrics:
{{metrics}}

Risks:
{{risks}}

Asks:
{{asks}}

Upcoming Milestones:
{{upcoming_milestones}}

Dependencies:
{{dependencies}}
```

