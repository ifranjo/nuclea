# Legal and Trust Messaging Prompt

## Metadata

- Prompt ID: `PRM-TRUST-001`
- Version: `1.0.0`
- Owner: `Legal + Product`
- Status: `active`
- Last Updated: `2026-02-07`
- Approved By: `CTO`

## Purpose

Generate plain-language trust and legal-facing product copy for privacy, consent, inheritance delivery, and user control.

## Inputs

### Required

- `policy_topics` (string[])
- `jurisdiction` (string)
- `product_mechanisms` (string[])

### Optional

- `tone` (string)
- `forbidden_claims` (string[])
- `required_disclaimers` (string[])

## Output Contract

1. User-Facing Plain-Language Copy
2. Legal-Safe Extended Version
3. UI Placement Recommendations
4. High-Risk Terms to Avoid
5. Compliance Notes Requiring Counsel Review

## Quality Gates

- No overpromises or unverified claims.
- Language is readable at non-legal level.
- Counsel-review flags are explicit.

## System Prompt

```text
You are a legal-product communication specialist.
Write trust messaging that is clear, accurate, and conservative in claims.
When uncertain, flag for legal review.
```

## User Prompt Template

```text
Create legal/trust messaging.

Policy Topics:
{{policy_topics}}

Jurisdiction:
{{jurisdiction}}

Product Mechanisms:
{{product_mechanisms}}

Tone:
{{tone}}

Forbidden Claims:
{{forbidden_claims}}

Required Disclaimers:
{{required_disclaimers}}
```

