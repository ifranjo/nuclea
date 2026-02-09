# PRM-QUALITY-008 v1.0.1 Prompt Audit

## Metadata
- Auditor: CTO PromptOps (Opus 4.6)
- Date: 2026-02-09
- Trigger: REV-015 execution revealed ambiguities in evidence requirements

---

## 1. Ambiguities Detected

### A1: Dev server vs production evidence

**Problem**: The prompt requires "Lighthouse must run in consistent conditions (headless, throttled, cache-cleared)" but does not specify whether dev server (`next dev`) or production server (`next start`) measurements are acceptable.

**Impact**: REV-015 used dev server because `next start` fails on Next 16.1.4 (ENOENT prerender-manifest.json). Dev server LCP is 3-6x worse than production due to on-demand compilation. The gate decision (WARN) may be artificially pessimistic.

**Evidence**: PREREUNION LCP 8.8s (dev) vs expected ~2-3s (production).

### A2: Build command flexibility (Webpack vs Turbopack)

**Problem**: The prompt says "Include exact bundle sizes" and references `build_output_path` but does not specify which bundler to use. Next.js 15+ defaults to Turbopack for `next dev`; Next.js 16+ supports `--webpack` flag for `next build`.

**Impact**: Bundle analysis output format differs between Webpack and Turbopack. Analyzer (`@next/bundle-analyzer`) only works with Webpack builds. Without specifying `--webpack`, the prompt may produce inconsistent evidence across runs.

### A3: Multi-app scope handling

**Problem**: The prompt accepts a single `target_app_path` input but NUCLEA has 2 apps. The output contract does not define how to present comparative results across multiple apps.

**Impact**: REV-015 measured both apps in a single output file. Without a multi-app contract, the gate decision logic (one overall WARN vs per-app gates) is implicit.

### A4: Framer Motion measurement method

**Problem**: The prompt says "Framer Motion bundle cost must be explicitly measured" but does not specify the measurement method. Options: chunk file size, analyzer visualization, `source-map-explorer`, or runtime profiling.

**Impact**: REV-015 used raw chunk file size from `du -ch` and build output. This is sufficient but the prompt could be more prescriptive.

---

## 2. Proposed Patch: v1.0.1 → v1.1.0

### Diff

```diff
 ## Quality Gates

- - Every metric claim must include command evidence or tool output.
+ - Every metric claim must include command evidence or tool output with exact command shown.
  - Bundle analysis must identify the top 3 largest chunks with file sources.
- - Lighthouse must run in consistent conditions (headless, throttled, cache-cleared).
+ - Lighthouse must run in consistent conditions (headless, throttled, cache-cleared).
+   - If `next start` is available: use production server (preferred).
+   - If `next start` fails (e.g., Next 16 prerender-manifest issue): use `next dev` and note "dev-server" in gate rationale.
+   - Dev-server LCP/TBT measurements must be flagged as potentially inflated.
  - Remediation items must include expected impact estimate (ms or KB saved).
  - Framer Motion bundle cost must be explicitly measured.
+   - Measurement method: raw chunk file size from build output or `du -ch` on identified FM chunk.

 ## System Prompt

 ```text
 You are a web performance engineer.
 Audit the target Next.js app against explicit performance budgets.
 Prioritize actionable findings over generic best practices.

 Hard rules:
 1) Every metric must have a reproducible command.
 2) Include exact bundle sizes, not estimates.
 3) Flag Framer Motion and heavy dependencies explicitly.
 4) Compare against budgets and classify as pass/warn/fail.
 5) Remediation items must be ordered by impact-to-effort ratio.
+6) Build command must use `--webpack` flag if Turbopack is default and bundle analyzer requires Webpack.
+7) If auditing multiple apps, produce per-app gate decisions and one overall gate.
 ```

 ## Inputs

 ### Required

 - `target_app_path` (string)
+- `target_app_path` (string | string[]): single app path or array for multi-app audit
  - `target_routes` (string[])
```

### Changes Summary

| Change | Rationale |
|--------|-----------|
| Dev/prod evidence split | Prevents false FAIL from dev-server inflation; maintains evidence quality |
| FM measurement method | Eliminates ambiguity on how to measure Framer Motion cost |
| `--webpack` flag requirement | Ensures bundle analyzer compatibility with Turbopack-default builds |
| Multi-app gate contract | Defines per-app + overall gate when auditing >1 app |
| Dev-server flag in rationale | Transparency about measurement conditions without blocking the gate |

### Compatibility

- **Next 15.x**: No impact — `next start` works, Webpack is default build
- **Next 16.x**: Addresses known `next start` failure and Turbopack default
- **Turbopack**: Accommodated via `--webpack` flag guidance (analyzer requires it)
- **Backward compatible**: All v1.0.1 outputs remain valid under v1.1.0 contract

---

## 3. Recommendation

Apply patch to `domains/03_quality/Performance_Budget_Gate.md` as v1.1.0. Set status back to `active` after patch. Validate with next measured Lighthouse run.
