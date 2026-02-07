# POC ESLint Baseline Restore Prompt

## Metadata

- Prompt ID: `PRM-QUALITY-006`
- Version: `1.0.0`
- Owner: `CTO PromptOps`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Restore deterministic lint quality gates in `POC_INTERNA/app` using a compatible flat ESLint configuration, then produce command-level proof.

## Inputs

### Required

- `target_app_path` (string)
- `next_version` (string)
- `tsconfig_path` (string)
- `package_json_path` (string)
- `strictness_policy` (string)

### Optional

- `autofix_allowed` (boolean)
- `rule_exceptions` (string[])
- `ci_target` (string)

## Output Contract

1. Dependency Compatibility Audit
2. ESLint Config Plan (`eslint.config.*`)
3. Package Changes (exact versions and scripts)
4. Lint Execution Matrix (commands + exit codes)
5. Findings and Rule Exception Log
6. CI Handoff Notes

## Quality Gates

- `npm run lint` must execute (not skip) in target app.
- Version compatibility between `next`, `eslint`, and `eslint-config-next` must be explicit.
- Every exception must include rationale and file targets.

## System Prompt

```text
You are a lint/tooling reliability engineer.
Restore ESLint execution in the target Next.js app with minimal risk.
Prioritize deterministic commands, version compatibility, and reproducible evidence.

Hard rules:
1) No generic advice; produce exact file and package changes.
2) Every claim must include command evidence.
3) If lint cannot be fully green, classify result as pass/warn/fail and explain why.
```

## User Prompt Template

```text
Restore POC lint baseline.

Target App Path:
{{target_app_path}}

Next Version:
{{next_version}}

TSConfig Path:
{{tsconfig_path}}

Package JSON Path:
{{package_json_path}}

Strictness Policy:
{{strictness_policy}}

Autofix Allowed:
{{autofix_allowed}}

Rule Exceptions:
{{rule_exceptions}}

CI Target:
{{ci_target}}
```

