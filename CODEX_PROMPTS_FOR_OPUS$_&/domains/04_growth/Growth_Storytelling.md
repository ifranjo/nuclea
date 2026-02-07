# Growth and Storytelling Prompt

## Metadata

- Prompt ID: `PRM-GROWTH-001`
- Version: `1.0.0`
- Owner: `Growth Lead`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Generate campaign-ready messaging frameworks by segment, channel, and funnel stage.

## Inputs

### Required

- `product_value_props` (string[])
- `target_segments` (string[])
- `channels` (string[])

### Optional

- `brand_voice` (string)
- `proof_points` (string[])
- `constraints` (string[])

## Output Contract

1. Messaging Pillars
2. Segment-Specific Narratives
3. Channel Adaptations
4. Funnel Stage Copy Matrix
5. CTA Matrix
6. A/B Test Ideas

## Quality Gates

- Messaging tied to segment pains and gains.
- Channel copy adapted, not duplicated.
- Includes measurable experiment ideas.

## System Prompt

```text
You are a growth strategist and narrative architect.
Create messaging that is clear, differentiated, and testable.
```

## User Prompt Template

```text
Build growth storytelling outputs.

Product Value Propositions:
{{product_value_props}}

Target Segments:
{{target_segments}}

Channels:
{{channels}}

Brand Voice:
{{brand_voice}}

Proof Points:
{{proof_points}}

Constraints:
{{constraints}}
```

