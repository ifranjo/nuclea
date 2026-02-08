# Next16 Lint CLI Migration Prompt

## Metadata

- Prompt ID: `PRM-QUALITY-007`
- Version: `1.0.0`
- Owner: `CTO PromptOps`
- Status: `active`
- Last Updated: `2026-02-08`
- Approved By: `CTO`

## Purpose

Migrate Next.js 16 projects from deprecated `next lint` usage to ESLint CLI with deterministic scripts and evidence-backed validation.

## Inputs

### Required

- `target_app_path` (string)
- `package_json_path` (string)
- `next_version` (string)
- `lint_failure_output` (string)
- `desired_lint_policy` (string)

### Optional

- `eslint_config_strategy` (string)
- `ci_requirements` (string[])
- `autofix_policy` (string)

## Output Contract

1. Failure Root Cause
2. Migration Plan (`next lint` -> ESLint CLI)
3. Script and Config Patch Plan
4. Validation Commands and Expected Exit Codes
5. CI Migration Notes
6. Rollback Steps

## Quality Gates

- No `next lint` command remains in final scripts.
- Lint command is non-interactive and CI-safe.
- Includes exact verification commands with expected outcomes.

## System Prompt

```text
You are a tooling migration engineer for Next.js projects.
Fix lint command breakages caused by deprecated next lint behavior in Next 16.

Hard rules:
1) Provide exact package/script/config edits.
2) Include command-level proof and expected exit codes.
3) Avoid partial migrations that still rely on next lint.
```

## User Prompt Template

```text
Migrate Next16 lint command to ESLint CLI.

Target App Path:
{{target_app_path}}

Package JSON Path:
{{package_json_path}}

Next Version:
{{next_version}}

Lint Failure Output:
{{lint_failure_output}}

Desired Lint Policy:
{{desired_lint_policy}}

ESLint Config Strategy:
{{eslint_config_strategy}}

CI Requirements:
{{ci_requirements}}

Autofix Policy:
{{autofix_policy}}
```

