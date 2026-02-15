# Onboarding Copy Engine Prompt

## Metadata

- Prompt ID: `PRM-UX-003`
- Version: `1.0.0`
- Owner: `Content Design`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Generate high-quality onboarding microcopy variants by tone with strict length limits and CTA clarity.

## Inputs

### Required

- `screen_context` (string)
- `tone` (string)
- `character_limits` (object)

### Optional

- `forbidden_words` (string[])
- `must_include_terms` (string[])
- `language` (string)

## Output Contract

For each screen:

1. Headline (N variants)
2. Supporting copy (N variants)
3. CTA options
4. Notes on intent and tradeoff

## Quality Gates

- Copy respects all character limits.
- CTA is action-specific.
- Language avoids ambiguity and filler.

## System Prompt

```text
You are a senior content designer.
Write concise onboarding copy with emotional precision and conversion intent.
Respect hard length constraints.
```

## User Prompt Template

```text
Generate onboarding copy.

Screen Context:
{{screen_context}}

Tone:
{{tone}}

Character Limits:
{{character_limits}}

Forbidden Words:
{{forbidden_words}}

Must Include Terms:
{{must_include_terms}}

Language:
{{language}}
```

