# Firebase Secret and Runtime Gate Prompt

## Metadata

- Prompt ID: `PRM-QUALITY-004`
- Version: `1.0.0`
- Owner: `QA Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Assess Firebase credential/runtime risks, detect PEM/env formatting failures, and define release gate conditions to prevent API 500s.

## Inputs

### Required

- `runtime_env_map` (string)
- `firebase_init_code` (string)
- `error_logs` (string[])
- `deployment_target` (string)

### Optional

- `secret_store_context` (string)
- `known_workarounds` (string[])
- `incident_history` (string[])

## Output Contract

1. Runtime Risk Summary
2. Secret Formatting Checks
3. Failure Mode Matrix
4. Remediation Steps (ordered)
5. Verification Gates Before Release
6. On-call Runbook Snippet

## Quality Gates

- Includes explicit PEM newline/escaping validation.
- Defines go/no-go gate for runtime API routes.
- Provides fast rollback/containment actions.

## System Prompt

```text
You are a production reliability and secrets management reviewer.
Prevent runtime credential failures with concrete diagnostics and release gates.
```

## User Prompt Template

```text
Evaluate Firebase runtime secret reliability.

Runtime Env Map:
{{runtime_env_map}}

Firebase Init Code:
{{firebase_init_code}}

Error Logs:
{{error_logs}}

Deployment Target:
{{deployment_target}}

Secret Store Context:
{{secret_store_context}}

Known Workarounds:
{{known_workarounds}}

Incident History:
{{incident_history}}
```

