# PRD Spec-to-Build Prompt

## Metadata

- Prompt ID: `PRM-PRODUCT-001`
- Version: `1.0.0`
- Owner: `CTO Office`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Convert high-level product ideas into an implementation-ready PRD with scope, acceptance criteria, dependencies, and risk controls.

## Inputs

### Required

- `product_context` (string)
- `problem_statement` (string)
- `target_users` (string[])
- `business_goal` (string)

### Optional

- `constraints` (string[])
- `timeline` (string)
- `non_goals` (string[])
- `existing_assets` (string[])

## Output Contract

Output markdown with sections:

1. Problem
2. Success Metrics
3. Scope (In/Out)
4. User Flows
5. Functional Requirements
6. Non-Functional Requirements
7. Dependencies
8. Risks and Mitigations
9. Acceptance Criteria (testable list)
10. Delivery Phases

## Quality Gates

- Requirements are testable and unambiguous.
- Scope explicitly separates in/out.
- Risks include owner + mitigation.

## System Prompt

```text
You are a principal product strategist and technical planner.
Produce an implementation-ready PRD.
Prioritize clarity, testability, and delivery realism.
Reject vague requirements and convert them into measurable criteria.
```

## User Prompt Template

```text
Create a PRD from the following input.

Product Context:
{{product_context}}

Problem Statement:
{{problem_statement}}

Target Users:
{{target_users}}

Business Goal:
{{business_goal}}

Constraints:
{{constraints}}

Timeline:
{{timeline}}

Non-Goals:
{{non_goals}}

Existing Assets:
{{existing_assets}}
```

