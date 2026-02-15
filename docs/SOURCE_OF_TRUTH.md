# Source Of Truth

Last reviewed: 2026-02-13

This file is the first-stop reality map for NUCLEA. It separates:

1. Claimed/target architecture
2. Running system behavior
3. Historical or aspirational artifacts

## Effective source-of-truth (today)

- Runtime app used for current external flow: `PREREUNION_ANDREA/`
- Runtime onboarding PoC: `POC_INTERNA/app/`
- Current backend in runtime app: Firebase (Auth, Firestore, Storage)
- Target backend architecture (future): Supabase (`docs/ARCHITECTURE_TARGET_SUPABASE.md`)

## Trust-state map

| Artifact | Trust state | Why |
|---|---|---|
| `PREREUNION_ANDREA/src/**` | Live & normative | Defines production-facing runtime behavior |
| `PREREUNION_ANDREA/src/app/api/**` | Live & normative | Defines auth/privacy/waitlist API behavior |
| `PREREUNION_ANDREA/scripts/run-smoke-routes.mjs` | Live & normative | Fast E2E assertion for core routes and auth boundaries |
| `docs/SOURCE_OF_TRUTH.md` | Live & normative | Canonical trust-state registry used for governance checks |
| `docs/README.md` | Live & normative | Documentation entrypoint and role-based reading order |
| `docs/api/RUNTIME_ENDPOINTS.md` | Live & normative | Human-readable runtime API contract for implemented routes |
| `POC_INTERNA/app/src/**` | Live & normative | Defines onboarding PoC behavior |
| `docs/ARCHITECTURE.md` | Live & normative | Documents current runtime architecture (Firebase) |
| `docs/TYPESCRIPT_TYPES.md` | Live & normative | Canonical capsule ontology and compatibility mapping |
| `docs/DESIGN_SYSTEM.md` | Live & normative | Current design tokens and component guidance |
| `docs/DATABASE_SCHEMA.md` | Aspirational / target | Target relational schema reference and migration input |
| `docs/MVP_SCOPE.md` | Aspirational / target | Scope intent, not runtime assertion |
| `docs/capsules/**` | Aspirational / target | Capsule behavior specs and definitions |
| `docs/flows/**` | Aspirational / target | Flow-level design and target interaction model |
| `docs/spec/**` | Aspirational / target | Detailed subsystem specs and design strategy artifacts |
| `docs/api/ENDPOINTS.md` | Aspirational / target | Expanded API contract for target architecture |
| `docs/ARCHITECTURE_TARGET_SUPABASE.md` | Aspirational / target | Future migration blueprint |
| `PREREUNION_ANDREA/AGENT-9-*.md` | Historical / vestigial | Delivery-era handoff notes, not runtime contract |
| `CODEX_PROMPTS_FOR_OPUS$_&/outputs/*.md` | Historical / vestigial | Prompt-ops snapshots and stage evidence |

## Canonical ontology lock

Runtime/UI capsule type set:

```ts
type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life-chapter' | 'origin'
```

Storage compatibility:

- Accepted legacy alias in persisted data: `everlife`
- Normalization rule at app boundary: `everlife -> legacy`
- SQL/schema underscore variants (example `life_chapter`) are persistence-level variants and must be mapped before UI/runtime use.

## Mechanical proof checks

Use these checks before declaring behavior fixed:

```bash
cd PREREUNION_ANDREA
npm run lint
npx tsc --noEmit
npm run build
npm run smoke:routes

cd ../POC_INTERNA/app
npm run lint
npx tsc --noEmit
npm run build

cd ../..
node docs/scripts/check-source-of-truth-coverage.mjs
```

## Update policy

- If runtime behavior changes, update this file in the same change-set.
- If a document is no longer descriptive, reclassify it to `Aspirational` or `Historical` here.
- Do not introduce new domain vocabulary unless it is added to the canonical ontology section above.
