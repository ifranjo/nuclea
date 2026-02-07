---
name: codex-folder-prompts
description: Use when running the NUCLEA project-only prompt-ops cycle in CODEX_PROMPTS_FOR_OPUS$_&, including reviewing OPUS4.6 outputs, tuning/adding prompts, retiring old prompts, clearing completed outputs, and updating registries.
---

# Codex Folder Prompts (Project-Only)

This skill is strictly for:

- `C:\Users\Kaos\scripts\nuclea`
- `C:\Users\Kaos\scripts\nuclea\CODEX_PROMPTS_FOR_OPUS$_&`

If current workspace is not this repo, stop and do not apply this skill.

## Guardrails

1. Do not modify product/application code by default.
2. Operate only inside `CODEX_PROMPTS_FOR_OPUS$_&` unless explicitly asked.
3. Use `-LiteralPath` whenever addressing paths under `CODEX_PROMPTS_FOR_OPUS$_&` (folder name contains special chars).
4. Keep outputs ephemeral: clear completed files from `outputs/`, keep `.gitkeep`.
5. Maintain auditability in `registry/` and `99_CHANGELOG.md`.

## Exact Cycle

### Step 1: Ingest latest worker outputs

- Read files in `outputs/` (if present).
- Summarize what passed/failed.
- Fill/update `registry/OPUS46_REVIEW_LOG.md` with a new review block.

### Step 2: Update status board

- Update `registry/PROMPT_STATUS.md` per prompt:
  - `active`
  - `needs-tuning`
  - `retired`
- Every `needs-tuning` prompt must have a concrete next action.

### Step 3: Prompt actions

- Tune underperforming prompts (version bump).
- Add new prompts when gap is not covered by existing prompt set.
- Move obsolete prompts to `domains/_retired/` and mark in registry.

### Step 4: Changelog and hygiene

- Append clear bullets in `99_CHANGELOG.md` for:
  - added prompts
  - tuned prompts
  - retired prompts
  - output cleanup

### Step 5: Clear completed outputs

- Delete completed files from `outputs/`.
- Keep only `outputs/.gitkeep`.

### Step 6: Verify

- Verify required files exist:
  - `README.md`
  - `registry/PROMPT_STATUS.md`
  - `registry/OPUS46_REVIEW_LOG.md`
  - `99_CHANGELOG.md`
- Verify `outputs/` contains only `.gitkeep` after cleanup.

### Step 7: Commit policy

- Commit only prompt-ops files unless user asks otherwise.
- Recommended commit types:
  - `chore(promptops): ...`
  - `feat(promptops): ...`

## Standard Next-Batch Focus (Default)

When no explicit priority is provided, prioritize in this order:

1. `needs-tuning` prompts in `registry/PROMPT_STATUS.md`
2. prompts blocking UX quality and QA reliability
3. ops prompts that improve worker packet quality

## Definition of Done (Per Cycle)

- Review log updated.
- Status registry updated.
- Required prompt changes completed (add/tune/retire).
- Changelog updated.
- Outputs cleaned and reset to `.gitkeep`.

