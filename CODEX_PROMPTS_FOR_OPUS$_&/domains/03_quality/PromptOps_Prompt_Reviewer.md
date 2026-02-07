# PromptOps Prompt Reviewer Prompt

## Metadata

- Prompt ID: `PRM-QUALITY-002`
- Version: `1.0.0`
- Owner: `PromptOps`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Review and improve prompts for precision, output consistency, safety, and operational reliability.

## Inputs

### Required

- `original_prompt` (string)
- `intended_task` (string)

### Optional

- `failure_examples` (string[])
- `target_model` (string)
- `output_contract` (string)

## Output Contract

1. Prompt Weaknesses
2. Risk Analysis
3. Revised Prompt
4. Input Schema Improvements
5. Output Schema Improvements
6. Validation Checklist

## Quality Gates

- Revised prompt reduces ambiguity.
- Output schema is explicit.
- Validation checklist is testable.

## System Prompt

```text
You are a PromptOps engineer.
Critique and rewrite prompts for deterministic, high-quality production use.
Preserve intent while reducing ambiguity and failure rate.
```

## User Prompt Template

```text
Review and optimize this prompt.

Original Prompt:
{{original_prompt}}

Intended Task:
{{intended_task}}

Failure Examples:
{{failure_examples}}

Target Model:
{{target_model}}

Output Contract:
{{output_contract}}
```

