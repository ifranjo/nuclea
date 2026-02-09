# Repository Guidelines

## Project Structure & Module Organization
This repository is a multi-workstream workspace. Work in the correct subfolder before running commands.

- `docs/`: technical source of truth (architecture, API, schema, capsule/flow specs).
- `POC_INTERNA/`: internal PoC specs and implementation assets.
- `POC_INTERNA/app/`: runnable Next.js onboarding prototype (P1-P4), scripts, and visual checks.
- `PREREUNION_ANDREA/`: external-facing Next.js app plus business/outreach artifacts.
- `CODEX_PROMPTS_FOR_OPUS$_&/`: prompt-ops registry, domain prompts, and review logs.

## Build, Test, and Development Commands
Run commands from the app you are changing:

- `cd POC_INTERNA/app && npm install && npm run dev` starts PoC app on `http://localhost:3001`.
- `cd POC_INTERNA/app && npm run build && npm run start` builds and runs production mode on port `3001`.
- `cd POC_INTERNA/app && npm run lint` runs Next/ESLint checks.
- `cd POC_INTERNA/app && npm run autocheck` runs lint/build/onboarding/runtime/PDF alignment checks.
- `cd POC_INTERNA/app && python tests/test_onboarding_visual.py` runs Playwright visual regression tests.
- `cd PREREUNION_ANDREA && npm install && npm run dev` starts the pre-meeting app (default Next.js port).

## Coding Style & Naming Conventions
- TypeScript is `strict`; keep types explicit at module boundaries.
- Match existing style: 2-space indentation, single quotes, and no semicolons in TS/TSX.
- Use `@/*` path alias for imports from `src/`.
- Naming: React components `PascalCase.tsx`, hooks `useX.ts`, route handlers `src/app/api/**/route.ts`.
- Keep docs/spec filenames consistent with their folder conventions (existing English/Spanish naming is mixed by design).

## Testing Guidelines
- Primary validation lives in `POC_INTERNA/app`.
- For UI or flow changes, run `npm run autocheck` before opening a PR.
- For onboarding visual changes, also run `python tests/test_onboarding_visual.py` and review `POC_INTERNA/app/screenshots/regression/`.
- No fixed coverage percentage is enforced; include at least one automated check path for changed behavior.

## Commit & Pull Request Guidelines
- Follow Conventional Commits seen in history: `feat(scope): ...`, `chore(scope): ...`, `test(scope): ...`.
- Use clear scopes (`promptops`, `poc`, `healing`, etc.) and imperative subjects.
- PRs should include:
  - change summary and affected directories,
  - verification commands run,
  - screenshots for UI changes,
  - linked issue/task and any docs/spec updates required by behavior changes.

## Security & Configuration Tips
- Never commit secrets; use local env files for credentials.
- Firebase-related keys are expected in `PREREUNION_ANDREA` env vars (for example `FIREBASE_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_*`).
- If keys include escaped newlines, preserve newline restoration logic in API handlers.
