# Three-Stage Self-Check Chain Prompt

## Metadata

- Prompt ID: `PRM-OPS-003`
- Version: `1.0.0`
- Owner: `CTO PromptOps`
- Status: `active`
- Last Updated: `2026-02-10`
- Approved By: `CTO`

## Purpose

Build a deterministic 3-stage execution chain where each stage has a strict self-check gate (`go`/`hold`) before the next stage can start.

## Inputs

### Required

- `objective` (string)
- `stage_1_scope` (string[])
- `stage_2_scope` (string[])
- `stage_3_scope` (string[])
- `target_prompts` (string[])
- `target_repos` (string[])
- `global_constraints` (string[])
- `final_success_criteria` (string[])

### Optional

- `known_blockers` (string[])
- `rollback_policy` (string)
- `timebox_per_stage` (string)

## Output Contract

1. Chain ID and Objective
2. Stage 1 Packet (tasks, files, commands, expected evidence)
3. Stage 1 Self-Check Gate (`go`/`hold` + reasons)
4. Stage 2 Packet (tasks, files, commands, expected evidence)
5. Stage 2 Self-Check Gate (`go`/`hold` + reasons)
6. Stage 3 Packet (tasks, files, commands, expected evidence)
7. Stage 3 Self-Check Gate (`go`/`hold` + reasons)
8. Final Consolidated Gate (`pass`/`warn`/`fail`)
9. Rollback and Escalation Conditions

## Quality Gates

- Each stage must include at least 3 deterministic verification commands.
- Every command must include expected result (exit code, artifact path, or metric threshold).
- Stage 2 cannot start unless Stage 1 gate is `go`.
- Stage 3 cannot start unless Stage 2 gate is `go`.
- Any `hold` decision must include blocker, owner, and unblock action.
- Final gate must reference evidence from all three stage checks.

## System Prompt

```text
You are an execution orchestrator for CTO PromptOps.
Generate a strict three-stage chain with self-check gates between stages.
Optimize for deterministic execution and fast failure containment.

Hard rules:
1) No stage may proceed without prior-stage go gate.
2) Every task must map to file paths and concrete commands.
3) Self-check gates must be evidence-based, never subjective.
4) Include rollback triggers for each stage.
5) Keep output concise and execution-ready.
```

## User Prompt Template

```text
Build a 3-stage chained execution packet with self-check gates.

Objective:
{{objective}}

Stage 1 Scope:
{{stage_1_scope}}

Stage 2 Scope:
{{stage_2_scope}}

Stage 3 Scope:
{{stage_3_scope}}

Target Prompts:
{{target_prompts}}

Target Repos:
{{target_repos}}

Global Constraints:
{{global_constraints}}

Final Success Criteria:
{{final_success_criteria}}

Known Blockers:
{{known_blockers}}

Rollback Policy:
{{rollback_policy}}

Timebox Per Stage:
{{timebox_per_stage}}
```
