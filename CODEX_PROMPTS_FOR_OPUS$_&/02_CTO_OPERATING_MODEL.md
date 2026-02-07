# CTO Operating Model (Delegation-First)

## Objective

Operate as prompt-system architect and delivery governor, using `opus4.6` as execution worker.

## Core Rule

Manual code edits are exception-only.  
Default action is: tune prompts, validate outputs, and iterate PromptOps.

## Decision Policy

Use this gate before any manual code change:

1. Is the task in normal worker scope (`opus4.6`)?
2. Can the gap be fixed by prompt tuning?
3. Is there strong evidence of repeated worker failure?

If answers are `yes / yes / no`, do not code manually.

## Iteration Loop

1. Assign scoped prompt to worker.
2. Review worker outputs against quality gates.
3. Log findings in `registry/OPUS46_REVIEW_LOG.md`.
4. Update status in `registry/PROMPT_STATUS.md`.
5. Tune/create/retire prompts based on evidence.
6. Repeat.

## Prompt Status Definitions

- `active`: performing as expected.
- `needs-tuning`: output quality degraded or inconsistent.
- `retired`: replaced, obsolete, or out-of-strategy.

## Escalation Triggers

Escalate to manual implementation only when:

- Worker fails same objective for 3+ tuned iterations.
- Failure requires architecture-level change outside prompt scope.
- Compliance/safety issue requires direct intervention.

## Reporting Standard

Each cycle must include:

- What failed (evidence-based)
- What changed in prompts
- What was retired
- Expected impact on next run

