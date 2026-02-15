# NUCLEA Workspace

Central workspace for NUCLEA product documentation, internal PoC assets, and investor/pre-meeting material.

## Start Here

| Goal | Read this first | Then continue with |
|------|-----------------|--------------------|
| Understand what is live vs target vs historical | `docs/SOURCE_OF_TRUTH.md` | `docs/README.md` |
| Understand technical architecture | `docs/README.md` | `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.md`, `docs/api/RUNTIME_ENDPOINTS.md`, `docs/api/ENDPOINTS.md` |
| Work on the internal onboarding PoC | `POC_INTERNA/README.md` | `POC_INTERNA/app/README.md` |
| Run the internal PoC app locally | `POC_INTERNA/app/README.md` | `POC_INTERNA/app/src/app/onboarding/page.tsx` |
| Prepare business/investor material | `POC_INVERSION_NUCLEA/README.md` | `PREREUNION_ANDREA/README.md` |

## Repository Map

| Path | Purpose |
|------|---------|
| `docs/` | Product and system documentation (architecture, schema, capsules, flows, API) |
| `POC_INTERNA/` | Internal PoC specs, design references, prompts, and runnable app |
| `POC_INTERNA/app/` | Next.js onboarding prototype (runs on port `3001`) |
| `PREREUNION_ANDREA/` | External-facing app and outreach/biz material |
| `POC_INVERSION_NUCLEA/` | Investor-oriented PoC structure and narrative |
| `DISEÑO_ANDREA_PANTALLAS/` | Source design PDFs used by specs and implementation |
| `GLM_AGENTS/` | Agent-generated analysis outputs |

## Quick Run (Internal PoC)

```bash
cd POC_INTERNA/app
npm install
npm run dev
```

Open `http://localhost:3001`.

## Documentation Notes

- Most technical docs are in English (`docs/`), while PoC execution docs are mostly in Spanish (`POC_INTERNA/`).
- Some folders in `POC_INTERNA/` are scaffolds for future specs. Check each README/status section before assuming content exists.
- `POC_INTERNA/app/screenshots/` contains current onboarding captures used for visual validation.
