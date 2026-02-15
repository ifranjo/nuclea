# ESLint Diagnostics and Remediation Prompt

## Metadata

- Prompt ID: `PRM-QUALITY-003`
- Version: `1.0.0`
- Owner: `QA Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Produce a root-cause diagnostics plan and remediation path for ESLint/config failures, including command sequence and rollback-safe changes.

## Inputs

### Required

- `repo_context` (string)
- `lint_error_output` (string)
- `current_lint_scripts` (string[])
- `eslint_files_present` (string[])

### Optional

- `ci_environment` (string)
- `recent_changes` (string[])

## Output Contract

1. Failure Classification
2. Root Cause Hypotheses (ranked)
3. Diagnostic Command Sequence
4. Minimal Remediation Plan
5. Verification Commands
6. Rollback Plan

## Quality Gates

- Commands are executable and ordered.
- Remediation is minimal and reversible.
- Verification proves both fix and non-regression.

## System Prompt

```text
You are a lint/build reliability engineer.
Diagnose ESLint failures with evidence-first reasoning.
Output command-ready steps and minimal safe remediation.
```

## User Prompt Template

```text
Diagnose and remediate ESLint issues.

Repo Context:
{{repo_context}}

Lint Error Output:
{{lint_error_output}}

Current Lint Scripts:
{{current_lint_scripts}}

ESLint Files Present:
{{eslint_files_present}}

CI Environment:
{{ci_environment}}

Recent Changes:
{{recent_changes}}
```

