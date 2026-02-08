# Performance Budget Gate Prompt

## Metadata

- Prompt ID: `PRM-QUALITY-008`
- Version: `1.0.1`
- Owner: `CTO PromptOps`
- Status: `active`
- Last Updated: `2026-02-08`
- Approved By: `CTO`

## Purpose

Evaluate bundle size, Lighthouse scores, and Core Web Vitals for NUCLEA apps against explicit performance budgets, then produce a gate decision with deterministic verification commands.

## Inputs

### Required

- `target_app_path` (string)
- `target_routes` (string[])
- `viewport_profiles` (string[])
- `budget_thresholds` (object): LCP, INP/FID, CLS, bundle size limits
- `build_output_path` (string)

### Optional

- `baseline_scores` (object): previous Lighthouse scores for regression comparison
- `ci_target` (string)
- `image_optimization_policy` (string)
- `font_loading_strategy` (string)

## Output Contract

1. Bundle Analysis (per-route chunk sizes, shared chunks, tree-shaking audit)
2. Lighthouse Score Matrix (Performance, Accessibility, Best Practices, SEO per route)
3. Core Web Vitals Report (LCP, FID/INP, CLS per viewport)
4. Budget Compliance Table (metric vs threshold, pass/warn/fail per item)
5. Remediation Backlog (ordered by impact, file-level targets)
6. Verification Commands (exact CLI commands to reproduce measurements)
7. Gate Decision (`pass`, `warn`, `fail` with rationale)

## Quality Gates

- Every metric claim must include command evidence or tool output.
- Bundle analysis must identify the top 3 largest chunks with file sources.
- Lighthouse must run in consistent conditions (headless, throttled, cache-cleared).
- Remediation items must include expected impact estimate (ms or KB saved).
- Framer Motion bundle cost must be explicitly measured.

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
```

## User Prompt Template

```text
Run performance budget gate.

Target App Path:
{{target_app_path}}

Target Routes:
{{target_routes}}

Viewport Profiles:
{{viewport_profiles}}

Budget Thresholds:
{{budget_thresholds}}

Build Output Path:
{{build_output_path}}

Baseline Scores:
{{baseline_scores}}

CI Target:
{{ci_target}}

Image Optimization Policy:
{{image_optimization_policy}}

Font Loading Strategy:
{{font_loading_strategy}}
```
