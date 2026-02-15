# Prompt Governance Standard (IT)

## 1. Scope

This standard defines how prompts are authored, reviewed, versioned, and retired.

## 2. Naming Convention

- File name: `Domain_Function.md`
- Prompt ID format: `PRM-<DOMAIN>-<NNN>`
- Example: `PRM-PRODUCT-001`

## 3. Required Metadata

Each prompt must include:

- Prompt ID
- Version (SemVer: `MAJOR.MINOR.PATCH`)
- Owner (role/team)
- Status (`draft`, `active`, `deprecated`)
- Last Updated (`YYYY-MM-DD`)
- Approved By

## 4. Input/Output Contract Rules

- Inputs must be explicitly typed and labeled `required` or `optional`.
- Output must define sections and format constraints.
- No free-form output without structure in production flows.

## 5. Quality Gates

Each prompt must define:

- Acceptance criteria
- Failure conditions
- Safety/compliance checks (if applicable)
- Escalation triggers (when uncertainty is high)

## 6. Review Workflow

1. Author creates/updates prompt.
2. Reviewer validates against this standard.
3. Pilot run with real input.
4. Approver marks `active`.
5. Change recorded in `99_CHANGELOG.md`.

## 7. Versioning Policy

- `PATCH`: wording clarity, no behavior change.
- `MINOR`: output schema expansion or quality improvements.
- `MAJOR`: role, scope, or structure breaking changes.

## 8. Security and Data Handling

- Do not embed secrets or private keys.
- Redact personal data in examples.
- Mark sensitive data handling explicitly in prompt instructions.

## 9. Deprecation Policy

- Mark prompt `deprecated`.
- Add migration note to replacement prompt.
- Keep deprecated prompts for audit traceability.

