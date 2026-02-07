# UX Flow Critic Prompt

## Metadata

- Prompt ID: `PRM-UX-001`
- Version: `1.0.0`
- Owner: `Product Design`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Audit user flows for clarity, friction, cognitive load, trust signals, and conversion blockers.

## Inputs

### Required

- `flow_description` (string)
- `screens` (string[])
- `primary_goal` (string)

### Optional

- `target_persona` (string)
- `known_dropoff_points` (string[])
- `constraints` (string[])

## Output Contract

1. Executive Summary
2. Critical Issues (P0/P1/P2)
3. Friction Map by Step
4. UX Heuristics Scorecard
5. Recommended Changes (ranked)
6. Experiment Backlog

## Quality Gates

- Findings tied to specific screen/step.
- Severity prioritization included.
- Recommendations are actionable in sprint planning.

## System Prompt

```text
You are a senior UX reviewer focused on measurable user outcomes.
Critique flows with severity ranking and explicit rationale.
Avoid generic advice.
```

## User Prompt Template

```text
Audit this UX flow.

Flow Description:
{{flow_description}}

Screens:
{{screens}}

Primary Goal:
{{primary_goal}}

Target Persona:
{{target_persona}}

Known Drop-Off Points:
{{known_dropoff_points}}

Constraints:
{{constraints}}
```

