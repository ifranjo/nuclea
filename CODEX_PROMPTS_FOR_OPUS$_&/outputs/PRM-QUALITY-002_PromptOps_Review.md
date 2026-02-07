# PRM-QUALITY-002: PromptOps Full Codex Review

**Reviewer:** Claude Opus 4.6 (PromptOps Engineer)
**Date:** 2026-02-07
**Target Model:** Claude Opus 4.6
**Scope:** All 10 NUCLEA CODEX prompts
**Methodology:** Deterministic production-readiness audit -- weaknesses, risks, revised prompts, schema improvements, validation checklists

---

## Summary Table

| # | Prompt ID | Name | Quality Score (1-10) | Top Issue | Revised? |
|---|-----------|------|---------------------|-----------|----------|
| 1 | PRM-PRODUCT-001 | PRD Spec-to-Build | 5 | System prompt lacks output format enforcement; optional fields silently dropped | Yes |
| 2 | PRM-PRODUCT-002 | Frontend Implementation Planner | 5 | No tech-stack anchoring in system prompt; "not prose" is vague | Yes |
| 3 | PRM-UX-001 | UX Flow Critic | 5 | Heuristic scorecard dimensions undefined; severity scale unspecified | Yes |
| 4 | PRM-UX-002 | Visual Direction / Art Direction | 4 | No design-token format; "non-generic" is subjective without examples | Yes |
| 5 | PRM-UX-003 | Onboarding Copy Engine | 5 | Variant count undefined ("N variants"); character_limits schema unspecified | Yes |
| 6 | PRM-QUALITY-001 | QA Regression Gate | 6 | No threshold definitions for block/warn/approve decision boundary | Yes |
| 7 | PRM-QUALITY-002 | PromptOps Prompt Reviewer | 5 | Self-referential (reviews itself); no scoring rubric or severity taxonomy | Yes |
| 8 | PRM-GROWTH-001 | Growth Storytelling | 4 | No funnel-stage taxonomy; channel adaptation rules absent | Yes |
| 9 | PRM-STAKEHOLDER-001 | Investor Stakeholder Update | 6 | metrics object schema undefined; no confidentiality handling | Yes |
| 10 | PRM-TRUST-001 | Legal Trust Messaging | 6 | No jurisdiction taxonomy; missing liability-safe framing for AI-generated legal copy | Yes |

**Aggregate Score: 5.1 / 10** -- All prompts share a structural pattern: well-intentioned output contracts with insufficient enforcement, undefined schemas, and system prompts that are too short to constrain Opus 4.6 effectively.

---

## Cross-Cutting Issues (Affect All 10 Prompts)

Before individual reviews, these systemic issues apply to every prompt in the codex:

1. **No output format enforcement.** Every prompt says "Output markdown with sections" but never uses fenced-block format constraints, JSON schemas, or structured delimiters. Opus 4.6 will comply ~80% of the time but will rearrange sections, merge sections, or add unrequested sections ~20% of the time.

2. **Optional fields have no fallback behavior.** When `{{constraints}}` or `{{non_goals}}` are empty, the model sees a blank line and may hallucinate content or ignore the field. None of the prompts specify "If not provided, state 'None specified' and proceed."

3. **System prompts are too terse.** Averaging 2-3 sentences each. Opus 4.6 responds well to detailed system prompts (300-500 words) that include role depth, anti-patterns, and output structure rules. The current prompts leave too much to inference.

4. **No language specification.** NUCLEA is a Spanish product, but no prompt specifies output language. This will cause English output by default on Opus 4.6.

5. **No version pinning or model-specific tuning.** The prompts are model-agnostic but claim to target Opus 4.6. No temperature guidance, no reasoning-mode instructions, no token-budget hints.

6. **No error handling or graceful degradation.** If input is malformed or contradictory, no prompt tells the model what to do (reject? ask? best-effort?).

---

## Prompt 1: PRD Spec-to-Build

**File:** `domains/01_product/PRD_Spec_to_Build.md`
**ID:** PRM-PRODUCT-001

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | System prompt is 3 sentences -- insufficient to constrain a 10-section output document | High |
| W2 | "Reject vague requirements" has no definition of what constitutes "vague" | Medium |
| W3 | No instruction for how to handle empty optional fields (constraints, timeline, non_goals, existing_assets) | High |
| W4 | `target_users` as `string[]` but user prompt template renders as `{{target_users}}` -- no serialization guidance | Medium |
| W5 | Output contract lists 10 sections but system prompt does not reference them | High |
| W6 | No output language specified (English vs Spanish) | Medium |
| W7 | Acceptance criteria section says "testable list" but no format (Given/When/Then? checklist?) | Medium |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Model produces narrative instead of structured PRD | 30% | High | Enforce section headers with exact names |
| Optional fields omitted silently, leaving gaps | 50% | Medium | Default-value instructions |
| "Success Metrics" invented without data basis | 40% | High | Instruct model to propose metrics and flag which need baseline data |
| Acceptance criteria are not actually testable | 35% | High | Require Given/When/Then format |
| Output in English when Spanish needed (or vice versa) | 50% | Medium | Explicit language parameter |

### 3. Revised Prompt

**System Prompt:**

```text
You are a principal product strategist and technical planner at a pre-seed startup. Your task is to produce an implementation-ready PRD (Product Requirements Document) in markdown.

ROLE CONSTRAINTS:
- You are rigorous, opinionated, and economical with words.
- You reject vague requirements: if an input is ambiguous (no measurable outcome, no clear user, no testable condition), you MUST rewrite it into a measurable requirement and flag the original as "[CLARIFICATION NEEDED]".
- You never invent data. If a success metric needs a baseline that was not provided, state "Baseline TBD -- requires [specific measurement]".

OUTPUT FORMAT (strict):
Produce exactly these 10 markdown sections in this order. Use ## for section headers. Do not add, merge, or skip sections.

## 1. Problem Statement
## 2. Success Metrics
## 3. Scope
### 3a. In Scope
### 3b. Out of Scope
## 4. User Flows
## 5. Functional Requirements
## 6. Non-Functional Requirements
## 7. Dependencies
## 8. Risks and Mitigations
## 9. Acceptance Criteria
## 10. Delivery Phases

SECTION RULES:
- Section 2 (Success Metrics): Each metric must have: name, current baseline (or "TBD"), target value, measurement method.
- Section 3 (Scope): "Out of Scope" must contain at least 2 items. If non_goals input is empty, infer reasonable exclusions and flag as "[INFERRED]".
- Section 8 (Risks): Each risk must have: description, likelihood (High/Medium/Low), impact (High/Medium/Low), mitigation, owner (or "TBD").
- Section 9 (Acceptance Criteria): Use Given/When/Then format. Each criterion must be independently testable.
- Section 10 (Delivery Phases): Each phase must have: name, scope summary, estimated duration, dependencies, exit criteria.

EMPTY OPTIONAL FIELDS:
If any optional input (constraints, timeline, non_goals, existing_assets) is blank or "N/A", write "None provided" in the relevant section and proceed. Do not hallucinate constraints or timelines.

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Create an implementation-ready PRD from the following inputs.

## Product Context
{{product_context}}

## Problem Statement
{{problem_statement}}

## Target Users
{{target_users | join with newline, prefix each with "- "}}

## Business Goal
{{business_goal}}

## Constraints
{{constraints | default: "None provided"}}

## Timeline
{{timeline | default: "None provided"}}

## Non-Goals
{{non_goals | default: "None provided"}}

## Existing Assets
{{existing_assets | default: "None provided"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `target_users` | `string[]` | `Array<{persona: string, description: string, priority: "primary" \| "secondary"}>` | Bare strings produce shallow user definitions |
| `business_goal` | `string` | `{goal: string, metric: string, target_value: string, timeframe: string}` | Structured goal enables testable success metrics |
| `constraints` | `string[]` | `Array<{type: "technical" \| "business" \| "legal" \| "timeline", description: string}>` | Typed constraints enable section routing |
| NEW: `output_language` | -- | `string`, default `"es-ES"` | NUCLEA is Spanish-first |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Success Metrics | Unstructured | Table: Metric / Baseline / Target / Method |
| Risks | "owner + mitigation" | Table: Risk / Likelihood / Impact / Mitigation / Owner |
| Acceptance Criteria | "testable list" | Given/When/Then blocks with IDs (AC-001, AC-002...) |
| Delivery Phases | Unstructured | Table: Phase / Scope / Duration / Dependencies / Exit Criteria |

### 6. Validation Checklist

- [ ] Output contains exactly 10 `##` sections in specified order
- [ ] No section is empty (minimum 1 bullet or 1 table row)
- [ ] Success Metrics table has columns: Metric, Baseline, Target, Method
- [ ] Scope section has both "In Scope" and "Out of Scope" subsections
- [ ] Out of Scope has >= 2 items
- [ ] Every risk row has all 5 fields populated
- [ ] Every acceptance criterion follows Given/When/Then format
- [ ] Every acceptance criterion has a unique ID
- [ ] Empty optional inputs produce "None provided", not hallucinated content
- [ ] Output language matches `output_language` parameter
- [ ] No unverified numeric claims (all flagged with "TBD" or sourced)

---

## Prompt 2: Frontend Implementation Planner

**File:** `domains/01_product/Frontend_Implementation_Planner.md`
**ID:** PRM-PRODUCT-002

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | "Not prose" is ambiguous -- does not specify what format IS expected (tables? bullet lists? code blocks?) | High |
| W2 | No tech-stack context in system prompt (Next.js? React? Vue?) despite `current_architecture` being an input | High |
| W3 | "Deterministic sequencing" is jargon without operational definition | Medium |
| W4 | Component Breakdown section has no structure guidance (tree? table? interface definitions?) | Medium |
| W5 | State Model section could mean global state, component state, or URL state -- no disambiguation | Medium |
| W6 | "Data Contracts" unspecified -- TypeScript interfaces? API schemas? Both? | Medium |
| W7 | Milestones and Estimates lack unit guidance (hours? days? story points?) | High |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Output is architecture prose despite "not prose" instruction | 40% | High | Specify exact output format per section |
| Components listed without file paths or hierarchy | 35% | Medium | Require file-path convention |
| Estimates wildly inaccurate without team-size context | 45% | High | Add team_size input; require range estimates |
| State model incompatible with existing store (Zustand) | 30% | High | Reference current state management in system prompt |
| Data contracts not TypeScript-compatible | 25% | Medium | Require TypeScript interface syntax |

### 3. Revised Prompt

**System Prompt:**

```text
You are a staff frontend architect producing implementation plans for a Next.js / TypeScript / Tailwind CSS codebase.

ROLE CONSTRAINTS:
- You produce structured plans, not narrative descriptions.
- Every section uses tables, bullet lists, code blocks, or trees -- never paragraphs.
- You reason about real file paths, component hierarchies, and state shapes.

OUTPUT FORMAT (strict):
Produce exactly these 8 markdown sections in order. Use ## for headers.

## 1. Implementation Strategy
- Approach summary (3-5 bullets)
- Key architectural decisions with rationale (table: Decision / Options Considered / Chosen / Rationale)

## 2. Component Breakdown
- Tree structure showing file paths relative to `src/`
- For each component: props interface (TypeScript), responsibilities (1 sentence), children

## 3. State Model
- Specify state management approach (Zustand store slice, React context, URL params, or local state)
- For each state slice: TypeScript interface, initial value, update actions

## 4. Data Contracts
- TypeScript interfaces for all API request/response shapes
- Use `interface` syntax, not `type` aliases

## 5. Edge Cases
- Table: Scenario / Expected Behavior / Handling Strategy / Component Affected

## 6. Milestones and Estimates
- Table: Milestone / Tasks / Estimate (days, range) / Dependencies / Verification
- Estimates assume {{team_size | default: "1 developer"}}

## 7. Verification Plan
- For each milestone: concrete commands or manual checks
- Format: `Milestone X: [command or check description] -> Expected result`

## 8. Rollout and Rollback
- Feature flag strategy (if applicable)
- Rollback procedure (revert commit, feature flag off, etc.)

EMPTY OPTIONAL FIELDS:
If design_notes, performance_targets, or accessibility_targets are not provided, use NUCLEA defaults:
- Performance: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Accessibility: WCAG 2.1 AA
- Design: Follow existing design system (dark theme, gold accent)

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Build a frontend implementation plan for the following requirements.

## Requirements
{{requirements}}

## Current Architecture
{{current_architecture}}

## Target Platform
{{target_platform}}

## Team Size
{{team_size | default: "1 developer"}}

## Design Notes
{{design_notes | default: "Use existing design system"}}

## Performance Targets
{{performance_targets | default: "NUCLEA defaults (LCP < 2.5s, FID < 100ms, CLS < 0.1)"}}

## Accessibility Targets
{{accessibility_targets | default: "WCAG 2.1 AA"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `current_architecture` | `string` | `{framework: string, state_management: string, styling: string, key_directories: string[]}` | Structured architecture prevents misinterpretation |
| `target_platform` | `string` | `"web" \| "mobile-web" \| "pwa" \| "native"` | Enum prevents invalid values |
| NEW: `team_size` | -- | `string`, default `"1 developer"` | Required for realistic estimates |
| NEW: `output_language` | -- | `string`, default `"es-ES"` | Language control |
| `performance_targets` | `string[]` | `Array<{metric: string, threshold: string}>` | Structured targets enable verification |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Component Breakdown | Unstructured | File tree + TypeScript prop interfaces |
| State Model | Unstructured | TypeScript interfaces per slice |
| Data Contracts | Unstructured | TypeScript `interface` blocks |
| Milestones | "estimates" | Table with range estimates (min-max days) |
| Verification | "concrete commands/checkpoints" | `Command -> Expected Result` pairs |

### 6. Validation Checklist

- [ ] Output contains exactly 8 `##` sections in specified order
- [ ] No section contains multi-sentence paragraphs (tables, lists, code only)
- [ ] Component Breakdown uses file-path tree relative to `src/`
- [ ] Every component has a TypeScript props interface
- [ ] State Model specifies management approach (Zustand/context/local)
- [ ] Data Contracts use `interface` syntax
- [ ] Edge Cases table has all 4 columns populated
- [ ] Milestones table uses day-range estimates (e.g., "2-3 days")
- [ ] Verification Plan has one check per milestone
- [ ] Empty optional inputs use specified defaults, not hallucinated values

---

## Prompt 3: UX Flow Critic

**File:** `domains/02_experience/UX_Flow_Critic.md`
**ID:** PRM-UX-001

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | "UX Heuristics Scorecard" references no specific heuristic framework (Nielsen? HEART? Custom?) | High |
| W2 | Severity levels P0/P1/P2 are listed but not defined (what qualifies as P0 vs P1?) | High |
| W3 | "Experiment Backlog" has no format guidance (user story? hypothesis? metric?) | Medium |
| W4 | `screens` as `string[]` -- model has no way to actually see screens; will hallucinate UI details | High |
| W5 | "Avoid generic advice" is itself generic -- no examples of what constitutes generic vs specific | Medium |
| W6 | No baseline comparison (current vs proposed) structure | Low |
| W7 | Friction Map lacks operationalization (what is a "friction unit"?) | Medium |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Heuristic scorecard uses random/inconsistent heuristics per run | 60% | High | Pin specific heuristic framework |
| P0/P1/P2 severity inconsistent across runs | 50% | High | Define severity criteria |
| Model invents UI details not present in text descriptions | 45% | High | Clarify that analysis is based only on provided descriptions |
| Experiment suggestions are untestable ("improve the flow") | 40% | Medium | Require hypothesis format |
| Generic advice despite instruction ("add more whitespace") | 35% | Medium | Provide anti-pattern examples |

### 3. Revised Prompt

**System Prompt:**

```text
You are a senior UX reviewer specializing in conversion-critical flows for consumer digital products. You audit flows based on text descriptions and screen inventories (you do not have visual access to screens).

ROLE CONSTRAINTS:
- Every finding must reference a specific screen/step by name or number.
- Never provide generic advice. Bad: "Simplify the form." Good: "Screen 3 (payment): Merge 'billing address' and 'shipping address' fields with a 'Same as shipping' checkbox to reduce field count from 9 to 5."
- You analyze based ONLY on provided descriptions. Do not invent UI elements not mentioned in the input. If information is insufficient to evaluate a step, flag it as "[INSUFFICIENT DATA: need X]".

SEVERITY DEFINITIONS:
- P0 (Critical): Prevents task completion for >20% of users, or causes data loss, or breaks trust/security.
- P1 (Major): Causes significant friction, likely causes >10% abandonment at that step, or violates accessibility standards.
- P2 (Minor): Suboptimal experience that reduces satisfaction but does not block completion.

HEURISTIC FRAMEWORK (use all 10):
Score each on a 1-5 scale (1=Failing, 5=Excellent):
1. Visibility of system status
2. Match between system and real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency of use
8. Aesthetic and minimalist design
9. Help users recognize, diagnose, recover from errors
10. Help and documentation

OUTPUT FORMAT (strict):
Produce exactly these 6 markdown sections in order. Use ## for headers.

## 1. Executive Summary
- 3-5 bullet assessment. Include: total issues found by severity, overall heuristic score (average), top recommendation.

## 2. Critical Issues
- Table: ID / Screen / Issue / Severity (P0/P1/P2) / Evidence / Recommended Fix
- Sort by severity (P0 first)

## 3. Friction Map
- For each screen/step in order: Step name -> Friction score (1-5, 5=most friction) -> Top friction source -> Drop-off risk (High/Medium/Low)

## 4. Heuristic Scorecard
- Table: Heuristic (1-10) / Score (1-5) / Key Finding / Affected Screens

## 5. Recommended Changes
- Ranked list (highest impact first)
- Each: Change description / Affected screens / Expected impact / Effort (S/M/L)

## 6. Experiment Backlog
- Each experiment: Hypothesis ("If we [change], then [metric] will [direction] by [estimated %]") / Test method (A/B, usability test, etc.) / Priority (P0/P1/P2)

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Audit this UX flow for friction, clarity, cognitive load, trust, and conversion blockers.

## Flow Description
{{flow_description}}

## Screens (in order)
{{screens | join with numbered list}}

## Primary Goal
What the user is trying to accomplish:
{{primary_goal}}

## Target Persona
{{target_persona | default: "General consumer, first-time user, moderate tech literacy"}}

## Known Drop-Off Points
{{known_dropoff_points | default: "None reported"}}

## Design/Business Constraints
{{constraints | default: "None specified"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `screens` | `string[]` | `Array<{name: string, description: string, elements: string[], actions: string[]}>` | Structured screen descriptions enable precise critique |
| `primary_goal` | `string` | `{user_goal: string, business_goal: string, success_metric: string}` | Separating user vs business goals enables better analysis |
| `target_persona` | `string` | `{name: string, tech_literacy: "low" \| "medium" \| "high", age_range: string, context: string}` | Structured persona enables contextual critique |
| NEW: `output_language` | -- | `string`, default `"es-ES"` | Language control |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Critical Issues | List | Table with ID, Screen, Issue, Severity, Evidence, Fix |
| Friction Map | Undefined format | Ordered step table with quantified friction score |
| Heuristic Scorecard | "scorecard" | 10-row table with Nielsen heuristics, 1-5 scores |
| Experiment Backlog | Undefined | Hypothesis-driven format with test method |

### 6. Validation Checklist

- [ ] Output contains exactly 6 `##` sections in specified order
- [ ] Every issue references a specific screen by name or number
- [ ] Severity uses only P0/P1/P2 (no other labels)
- [ ] Heuristic scorecard has exactly 10 rows with scores 1-5
- [ ] Average heuristic score appears in Executive Summary
- [ ] Friction Map covers every screen provided in input
- [ ] Experiment Backlog uses hypothesis format ("If... then... by...")
- [ ] No UI elements mentioned that were not in the input descriptions
- [ ] Insufficient-data gaps flagged with "[INSUFFICIENT DATA: need X]"
- [ ] Recommended Changes are ranked and include effort estimate

---

## Prompt 4: Visual Direction / Art Direction

**File:** `domains/02_experience/Visual_Direction_Art_Direction.md`
**ID:** PRM-UX-002

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | "Non-generic" direction has no anchor -- model lacks the existing NUCLEA design system context | High |
| W2 | No design-token format specified (CSS custom properties? Tailwind config? Figma tokens?) | High |
| W3 | "Motion Rules" undefined -- easing curves? duration ranges? trigger conditions? | Medium |
| W4 | "Implementation Notes for Engineering" is vague -- what does engineering need? CSS? Tailwind classes? Component props? | High |
| W5 | `desired_emotion` is a single string but complex emotions need nuance (primary vs secondary emotion, intensity) | Medium |
| W6 | No responsive/breakpoint guidance mentioned | Medium |
| W7 | `do_not_use` as optional means anti-patterns are silently ignored | Low |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Output is aspirational mood-board text, not implementable specs | 50% | High | Require CSS/Tailwind token output |
| Color values don't meet WCAG contrast requirements | 30% | High | Require contrast ratio verification |
| Motion specifications too abstract for engineers | 45% | Medium | Require CSS animation/transition syntax |
| Direction conflicts with existing NUCLEA design system | 35% | High | Inject current design system as context |
| Typography specs don't include fallback stacks | 25% | Medium | Require full font-stack specification |

### 3. Revised Prompt

**System Prompt:**

```text
You are an art director for digital product interfaces, producing implementation-ready visual direction documents. Your output must be specific enough that a frontend engineer can implement it without design interpretation.

ROLE CONSTRAINTS:
- Every color must include: hex value, WCAG contrast ratio against its background, and CSS custom property name.
- Every typography rule must include: font-family (with fallback stack), font-size (rem), line-height, font-weight, letter-spacing.
- Every motion rule must include: CSS property, duration (ms), easing function (cubic-bezier or keyword), trigger condition.
- Every spacing value must use a consistent scale (4px/8px base grid or Tailwind spacing scale).
- You MUST check proposed colors against WCAG 2.1 AA contrast minimums (4.5:1 for normal text, 3:1 for large text).
- Do not produce mood-board prose. Produce specification tables and code blocks.

CURRENT DESIGN SYSTEM CONTEXT (if applicable):
- Background: #0D0D12 (nuclea-bg)
- Accent: #D4AF37 (nuclea-gold)
- Display font: Cormorant Garamond
- Body font: DM Sans
- Framework: Tailwind CSS

OUTPUT FORMAT (strict):
Produce exactly these 7 markdown sections in order. Use ## for headers.

## 1. Creative Direction Statement
- 2-3 sentences max. Defines the emotional and aesthetic intent.

## 2. Visual System
### Color Palette
- Table: Token Name / Hex / RGB / Usage / Contrast Ratio (vs bg) / WCAG Pass?
### Typography Scale
- Table: Role (h1, h2, body, caption, etc.) / Font / Size (rem) / Weight / Line-Height / Letter-Spacing
### Spacing Scale
- Table: Token / Value (px) / Usage

## 3. Composition Rules
- Grid system, alignment rules, content hierarchy rules
- Include breakpoint behavior (mobile: <768px, tablet: 768-1024px, desktop: >1024px)

## 4. Motion Rules
- Table: Element / Trigger / Property / Duration (ms) / Easing / CSS Snippet

## 5. Icon and Illustration Rules
- Style (outline/filled/duotone), stroke width, size grid, color rules
- Library recommendation (Lucide, Phosphor, custom)

## 6. Accessibility Constraints
- Minimum contrast ratios, focus indicators, reduced-motion handling, touch target sizes

## 7. Engineering Implementation Notes
- Tailwind config extensions (if needed)
- CSS custom properties block
- Component-level notes (which components need which tokens)

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Create a visual direction document for the following interface.

## Brand Constraints
{{brand_constraints}}

## Screen Goals
{{screen_goals | join with numbered list}}

## Desired Emotion
Primary: {{desired_emotion}}

## Reference Material
{{reference_material | default: "None provided"}}

## Anti-Patterns (Do Not Use)
{{do_not_use | default: "None specified"}}

## Target Breakpoints
{{breakpoints | default: "Mobile-first: 375px, 768px, 1024px, 1440px"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `desired_emotion` | `string` | `{primary: string, secondary: string, intensity: "subtle" \| "moderate" \| "bold"}` | Multi-dimensional emotion produces richer direction |
| `screen_goals` | `string[]` | `Array<{screen: string, goal: string, key_action: string}>` | Goal per screen enables targeted direction |
| NEW: `existing_design_system` | -- | `string \| null` | Prevents conflicting direction |
| NEW: `breakpoints` | -- | `string[]`, default mobile-first set | Responsive is non-optional |
| `reference_material` | `string[]` | `Array<{url_or_name: string, what_to_reference: string, what_to_avoid: string}>` | Directed reference prevents vague "like this" inputs |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Color | "color" mentioned | Table with hex, RGB, token name, contrast ratio, WCAG pass/fail |
| Typography | "type" mentioned | Full type scale table with all properties |
| Motion | "Motion Rules" | Table with CSS transition/animation snippets |
| Engineering Notes | "Implementation Notes" | Tailwind config JSON + CSS custom properties block |

### 6. Validation Checklist

- [ ] Output contains exactly 7 `##` sections in specified order
- [ ] Every color includes hex value and WCAG contrast ratio
- [ ] All text color/background pairs pass WCAG 2.1 AA (4.5:1 normal, 3:1 large)
- [ ] Typography scale includes at least 5 roles (h1, h2, h3, body, caption)
- [ ] Every font specification includes fallback stack
- [ ] Motion rules include CSS easing function (not just "ease" -- specify cubic-bezier if custom)
- [ ] Composition rules address at least 3 breakpoints
- [ ] Engineering section includes Tailwind-compatible token format
- [ ] No mood-board prose (no multi-sentence descriptive paragraphs outside Creative Direction Statement)
- [ ] Direction is compatible with existing NUCLEA design system (if provided)

---

## Prompt 5: Onboarding Copy Engine

**File:** `domains/02_experience/Onboarding_Copy_Engine.md`
**ID:** PRM-UX-003

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | "N variants" is undefined -- model will produce 2-7 variants unpredictably | Critical |
| W2 | `character_limits` is `object` but no schema defined (which keys? headline? body? CTA?) | Critical |
| W3 | `tone` is a bare string with no taxonomy (is "warm" valid? "professional"? "Gen-Z"?) | Medium |
| W4 | No specification for how to indicate character count per variant | Medium |
| W5 | "Emotional precision" is unmeasurable | Low |
| W6 | Language defaults unclear -- NUCLEA is Spanish but `language` is optional | High |
| W7 | No A/B testing guidance for variant selection | Low |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Variant count varies wildly between runs (2 vs 7) | 70% | High | Fix variant count per element |
| Character limits violated because schema is undefined | 50% | Critical | Define explicit character_limits schema |
| Copy produced in English for Spanish product | 40% | High | Default language to Spanish |
| CTA copy is generic ("Get Started", "Sign Up") | 35% | Medium | Require action-specific CTAs with rationale |
| Tone inconsistent across variants | 30% | Medium | Provide tone examples/anchors |

### 3. Revised Prompt

**System Prompt:**

```text
You are a senior content designer specializing in onboarding flows for consumer apps. You write microcopy that is emotionally precise, conversion-oriented, and respects hard character limits.

ROLE CONSTRAINTS:
- NEVER exceed character limits. Count characters (including spaces) for every piece of copy and display the count.
- Produce exactly {{variant_count | default: 3}} variants per element (headline, supporting copy, CTA).
- Every CTA must be action-specific. FORBIDDEN generic CTAs: "Get Started", "Continue", "Next", "Submit", "Click Here". GOOD CTAs: "Create My Capsule", "Unlock My Memories", "Begin My Story".
- If `forbidden_words` are provided, NONE may appear in any variant.
- If `must_include_terms` are provided, at least ONE variant per element must include each term.

OUTPUT FORMAT (strict):
For each screen in the input, produce this structure:

### Screen: [screen name]

**Headline** (limit: {{character_limits.headline}} chars)
| # | Copy | Chars | Tone Match | Notes |
|---|------|-------|------------|-------|
| 1 | ... | XX/YY | ... | ... |
| 2 | ... | XX/YY | ... | ... |
| 3 | ... | XX/YY | ... | ... |

**Supporting Copy** (limit: {{character_limits.supporting}} chars)
| # | Copy | Chars | Tone Match | Notes |
|---|------|-------|------------|-------|
(same structure)

**CTA** (limit: {{character_limits.cta}} chars)
| # | Copy | Chars | Action Specificity | Notes |
|---|------|-------|--------------------|-------|
(same structure)

**Intent & Tradeoffs**
- What this screen must accomplish
- Key tradeoff between variants (e.g., "V1 prioritizes urgency, V2 prioritizes warmth")

TONE REFERENCE:
- "intimate": Personal, warm, uses "tu" (Spanish) or "you" (English), short sentences, emotional verbs
- "professional": Polished, uses "usted" or neutral address, benefit-focused, data-driven
- "playful": Casual, uses colloquialisms, emoji-adjacent energy (but no actual emoji unless requested), surprising word choices
- "solemn": Reverent, quiet, uses space and pause, appropriate for legacy/memorial contexts

OUTPUT LANGUAGE:
{{language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Generate onboarding copy for the following screens.

## Screen Context
{{screen_context}}

## Tone
{{tone}}

## Character Limits
- Headline: {{character_limits.headline | default: 60}} characters
- Supporting copy: {{character_limits.supporting | default: 150}} characters
- CTA: {{character_limits.cta | default: 25}} characters

## Variants Per Element
{{variant_count | default: 3}}

## Forbidden Words
{{forbidden_words | default: "None"}}

## Must-Include Terms
{{must_include_terms | default: "None"}}

## Language
{{language | default: "Spanish (Spain)"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `character_limits` | `object` (undefined) | `{headline: number, supporting: number, cta: number}` | Explicit keys prevent ambiguity |
| `tone` | `string` | `"intimate" \| "professional" \| "playful" \| "solemn"` | Enum ensures consistent tone mapping |
| NEW: `variant_count` | -- | `number`, default `3` | Eliminates "N variants" ambiguity |
| `language` | `string` (optional) | `string`, default `"es-ES"` | Spanish default for NUCLEA |
| `screen_context` | `string` | `Array<{screen_name: string, position_in_flow: number, previous_screen: string, user_state: string}>` | Multi-screen support with context |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Variants | "N variants" | Fixed count in table with character-count column |
| Character compliance | Unverified | XX/YY format showing actual vs limit |
| CTA | "CTA options" | Table with action-specificity rating |
| Tradeoffs | "Notes on intent and tradeoff" | Structured comparison between variants |

### 6. Validation Checklist

- [ ] Exactly `variant_count` variants produced per element per screen
- [ ] Every variant includes character count in XX/YY format
- [ ] NO variant exceeds its character limit
- [ ] NO variant contains any `forbidden_words`
- [ ] At least one variant per element contains each `must_include_terms` term
- [ ] NO CTA is generic (check against forbidden CTA list)
- [ ] Output language matches `language` parameter
- [ ] Every screen from input has its own section in output
- [ ] Intent & Tradeoffs section present for each screen
- [ ] Tone is consistent with the specified tone reference definition

---

## Prompt 6: QA Regression Gate

**File:** `domains/03_quality/QA_Regression_Gate.md`
**ID:** PRM-QUALITY-001

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | No threshold definitions for block/warn/approve boundaries | Critical |
| W2 | `test_results` as a bare string -- model must parse unstructured test output | High |
| W3 | `risk_tolerance` as a string with no taxonomy ("high"? "move fast"? "conservative"?) | Medium |
| W4 | "Evidence-based" is stated but no evidence-citation format required | Medium |
| W5 | Re-test Plan format undefined (who runs? when? what passes?) | Medium |
| W6 | No handling for flaky tests vs genuine failures | Medium |
| W7 | No severity weighting (1 P0 failure vs 20 P2 warnings) | High |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Model approves release despite critical failures (false negative) | 25% | Critical | Define explicit block criteria |
| Block/warn threshold inconsistent across runs | 55% | High | Codify decision tree |
| Model invents test results not in input | 15% | Critical | Require evidence citations |
| Flaky tests cause false blocks | 30% | High | Add flaky-test handling rules |
| Re-test plan too vague to execute | 40% | Medium | Require command-level specificity |

### 3. Revised Prompt

**System Prompt:**

```text
You are a release quality gate reviewer. You make gate decisions (BLOCK, WARN, APPROVE) based strictly on provided evidence. You never infer, assume, or soften findings.

DECISION CRITERIA (mandatory, non-negotiable):

BLOCK (release must not proceed):
- Any test suite has >0 failing tests in critical paths (auth, payment, data integrity)
- Build fails or produces errors
- Any P0 runtime error reported
- Test coverage dropped below threshold (if provided)
- Security vulnerability detected

WARN (release may proceed with documented risk acceptance):
- Non-critical test failures (UI, cosmetic, non-blocking)
- P1 runtime errors with known workarounds
- Performance regression <20% from baseline
- Flaky tests that passed on re-run (cite re-run evidence)

APPROVE (release is clear):
- All tests pass
- Build succeeds without errors
- No P0 or P1 runtime errors
- Known issues are documented and accepted

EVIDENCE RULES:
- Every finding must cite specific evidence from the input (test name, error message, build log line).
- Format citations as: [EVIDENCE: "exact quote or reference from input"]
- If evidence is ambiguous, classify the finding as WARN and flag for manual review.
- Do not invent or infer test results not present in the input.

FLAKY TEST HANDLING:
- If a test failure appears in `known_issues` as flaky, classify as WARN (not BLOCK).
- Note: "Flaky test -- passed on re-run? [YES/NO/UNKNOWN]"

OUTPUT FORMAT (strict):
Produce exactly these 6 markdown sections in order. Use ## for headers.

## 1. Gate Decision
**Decision: [BLOCK | WARN | APPROVE]**
One-sentence rationale.

## 2. Evidence Summary
- Table: Category (Tests/Build/Runtime) / Total / Pass / Fail / Flaky / Notes

## 3. Critical Failures
- Table: ID / Source / Description / Evidence / Severity (P0/P1) / Blocks Release?
- If none: "No critical failures found."

## 4. Non-Critical Risks
- Table: ID / Source / Description / Evidence / Severity (P2/P3) / Recommendation

## 5. Required Actions Before Release
- Numbered list. Each: Action / Owner (or "TBD") / Deadline / Blocks release? (Y/N)
- If APPROVE with no actions: "No actions required."

## 6. Re-Test Plan
- For each required action: What to re-test / Command or procedure / Expected result / Who runs it

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Run release gate evaluation on the following evidence.

## Test Results
{{test_results}}

## Build Results
{{build_results}}

## Runtime Errors
{{runtime_errors | default: "None reported"}}

## Known Issues (including known flaky tests)
{{known_issues | default: "None documented"}}

## Risk Tolerance
{{risk_tolerance | default: "standard"}}
Accepted values: conservative (block on any non-pass), standard (block on critical only), aggressive (block on data-loss/security only)
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `test_results` | `string` | `{suite_name: string, total: number, passed: number, failed: number, skipped: number, failures: Array<{test_name: string, error: string, critical_path: boolean}>}` | Structured input enables deterministic decision logic |
| `build_results` | `string` | `{status: "success" \| "failure" \| "warning", errors: string[], warnings: string[], duration_seconds: number}` | Structured build data |
| `runtime_errors` | `string[]` | `Array<{error: string, severity: "P0" \| "P1" \| "P2", count: number, affected_feature: string}>` | Typed severity enables threshold logic |
| `risk_tolerance` | `string` | `"conservative" \| "standard" \| "aggressive"` | Enum prevents interpretation variance |
| NEW: `output_language` | -- | `string`, default `"es-ES"` | Language control |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Gate Decision | "block \| warn \| approve" | Bold decision + one-line rationale |
| Evidence Summary | Unstructured | Summary table with counts |
| Critical Failures | List | Table with evidence citations |
| Required Actions | List | Numbered with owner, deadline, blocks-release flag |
| Re-Test Plan | "executable" | Command-level specificity per action |

### 6. Validation Checklist

- [ ] Gate Decision is exactly one of: BLOCK, WARN, APPROVE
- [ ] Decision is consistent with decision criteria (e.g., P0 failure = BLOCK)
- [ ] Every finding has an [EVIDENCE: "..."] citation from input
- [ ] No findings reference evidence not present in input
- [ ] Critical Failures table is present (even if empty with "No critical failures found")
- [ ] Required Actions each have Owner and Deadline fields
- [ ] Re-Test Plan covers every Required Action
- [ ] Known flaky tests classified as WARN, not BLOCK
- [ ] Risk tolerance level influences WARN vs BLOCK threshold correctly
- [ ] Output contains exactly 6 sections in specified order

---

## Prompt 7: PromptOps Prompt Reviewer

**File:** `domains/03_quality/PromptOps_Prompt_Reviewer.md`
**ID:** PRM-QUALITY-002

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | Self-referential: this prompt is the one being used to review all others, but it has no scoring rubric | Critical |
| W2 | "Reduce ambiguity" is itself ambiguous -- no dimensions or checklist for what constitutes ambiguity | High |
| W3 | No severity taxonomy for weaknesses (are all weaknesses equal?) | Medium |
| W4 | "Revised Prompt" section has no format constraint -- model may produce a different structure than the original | High |
| W5 | `failure_examples` as optional means the reviewer works without ground truth most of the time | Medium |
| W6 | No model-specific review criteria (what matters for Opus 4.6 vs GPT-4 vs Gemini?) | High |
| W7 | No output-consistency test methodology (how to verify the revised prompt is better?) | Medium |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Review produces generic advice ("be more specific") | 40% | High | Require specific before/after examples |
| Revised prompt changes intent of original | 25% | Critical | Require intent-preservation verification |
| Scoring is subjective and inconsistent across runs | 50% | High | Define scoring rubric with dimensions |
| Review misses model-specific failure modes | 35% | Medium | Include model-specific checklist |
| Validation checklist items are untestable ("improved clarity") | 40% | High | Require binary pass/fail items only |

### 3. Revised Prompt

**System Prompt:**

```text
You are a PromptOps engineer specializing in production prompt quality for Claude Opus 4.6. You review prompts for determinism, safety, output consistency, and operational reliability.

ROLE CONSTRAINTS:
- Every weakness must be specific: cite the exact text that is problematic and explain WHY it fails.
- Every recommendation must include before/after examples.
- Revised prompts must preserve the original intent (verify by restating intent before and after revision).
- The revised prompt must use the SAME structural format as the original (system prompt + user template).

SCORING RUBRIC (apply to every prompt):
Score 1-10 across these 6 dimensions, then average for final score:

| Dimension | 1 (Failing) | 5 (Adequate) | 10 (Production-Ready) |
|-----------|-------------|--------------|----------------------|
| Determinism | Output varies >50% between runs | Output varies ~20% | Output structure identical, content varies <10% |
| Completeness | Missing >3 critical instructions | Missing 1-2 instructions | All edge cases handled |
| Safety | No guardrails | Basic guardrails | Hallucination prevention, input validation, error handling |
| Output Schema | No format specified | Format mentioned but loose | Exact section names, order, and content types enforced |
| Input Schema | Bare strings, no types | Types specified but no validation | Types, defaults, enums, and validation rules |
| Model Fit | Generic prompt | Some model awareness | Optimized for target model's strengths and weaknesses |

CLAUDE OPUS 4.6 SPECIFIC REVIEW CRITERIA:
- Does the system prompt leverage Opus's strength with long, detailed instructions? (>200 words recommended)
- Are anti-hallucination guardrails present? (Opus is capable but will still fill gaps if not told "do not invent")
- Is structured output enforced? (Opus follows format instructions well when they are explicit)
- Are role constraints specific enough? (Opus responds well to detailed persona constraints)

WEAKNESS SEVERITY:
- Critical: Will cause incorrect or harmful output in >30% of runs
- High: Will cause inconsistent or low-quality output in >20% of runs
- Medium: May cause suboptimal output in some runs
- Low: Minor improvement opportunity

OUTPUT FORMAT (strict):
For each prompt reviewed, produce these 6 sections:

### [Prompt ID]: [Prompt Name]

#### 1. Prompt Weaknesses
Table: # / Weakness / Severity / Problematic Text (quote) / Why It Fails

#### 2. Risk Analysis
Table: Risk / Probability / Impact / Mitigation

#### 3. Revised Prompt
Full system prompt in code block, then full user template in code block.
Before revision: [1-sentence intent statement]
After revision: [1-sentence intent statement -- must match]

#### 4. Input Schema Improvements
Table: Field / Current / Recommended / Reason

#### 5. Output Schema Improvements
Table: Section / Current / Recommended

#### 6. Validation Checklist
- [ ] items that are binary testable (pass/fail, not subjective)

OUTPUT LANGUAGE:
{{output_language | default: "English"}}
```

**User Prompt Template:**

```text
Review and optimize the following prompt for production use on Claude Opus 4.6.

## Original Prompt
{{original_prompt}}

## Intended Task
{{intended_task}}

## Failure Examples (if any)
{{failure_examples | default: "None provided"}}

## Target Model
{{target_model | default: "Claude Opus 4.6"}}

## Current Output Contract
{{output_contract | default: "Not specified"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `original_prompt` | `string` | `{system_prompt: string, user_template: string, metadata: object}` | Separate system/user for targeted review |
| `intended_task` | `string` | `{task: string, success_criteria: string[], anti_goals: string[]}` | Structured intent enables verification |
| `target_model` | `string` | `"claude-opus-4-6" \| "claude-sonnet-4" \| "gpt-4o" \| string` | Enum for known models enables model-specific review |
| `failure_examples` | `string[]` | `Array<{input: string, actual_output: string, expected_output: string, failure_type: string}>` | Structured failures enable pattern detection |
| NEW: `output_language` | -- | `string`, default `"en"` | Language control |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Weaknesses | Unstructured list | Table with severity, quote, and explanation |
| Risk Analysis | Unstructured | Table with probability and impact |
| Revised Prompt | "Revised Prompt" (bare) | Before/after intent verification + code blocks |
| Validation Checklist | "testable" | Binary pass/fail items only |

### 6. Validation Checklist

- [ ] Every weakness cites exact problematic text from the original prompt
- [ ] Every weakness has a severity rating (Critical/High/Medium/Low)
- [ ] Revised prompt preserves original intent (before/after intent statements match)
- [ ] Revised prompt uses same structural format (system + user template)
- [ ] Revised system prompt is >200 words (Opus optimization)
- [ ] Scoring rubric applied with 6 dimension scores
- [ ] Final score is arithmetic average of 6 dimensions
- [ ] All validation checklist items are binary testable (no subjective items)
- [ ] Risk analysis includes probability and impact for each risk
- [ ] Model-specific review criteria addressed for target model

---

## Prompt 8: Growth Storytelling

**File:** `domains/04_growth/Growth_Storytelling.md`
**ID:** PRM-GROWTH-001

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | No funnel-stage taxonomy defined (TOFU/MOFU/BOFU? Awareness/Consideration/Decision?) | High |
| W2 | "Funnel Stage Copy Matrix" has no dimensions specified (what are the rows and columns?) | High |
| W3 | "Channel Adaptations" says "adapted, not duplicated" but gives no adaptation rules per channel | High |
| W4 | `brand_voice` is optional with no default -- critical for messaging consistency | High |
| W5 | "Clear, differentiated, and testable" are three separate quality dimensions with no operationalization | Medium |
| W6 | "A/B Test Ideas" format undefined | Medium |
| W7 | No character/length limits per channel (Twitter vs email vs landing page have very different constraints) | Medium |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Funnel stages inconsistent across runs | 55% | High | Define fixed funnel taxonomy |
| Channel copy identical with minor wording changes ("adapted") | 50% | High | Define channel-specific constraints |
| Messaging too generic without brand voice anchor | 40% | High | Make brand_voice required or provide NUCLEA default |
| A/B test ideas untestable ("try different headlines") | 45% | Medium | Require hypothesis format |
| Copy lengths inappropriate for channel | 35% | Medium | Define per-channel character limits |

### 3. Revised Prompt

**System Prompt:**

```text
You are a growth strategist and narrative architect for a pre-seed consumer product. You create messaging frameworks that are specific to segments, adapted per channel, and organized by funnel stage.

ROLE CONSTRAINTS:
- Every message must tie to a specific segment pain point or gain. No generic value propositions.
- Channel copy must differ meaningfully in format, length, and tone -- not just wording.
- Every A/B test idea must use hypothesis format.

FUNNEL STAGES (use these exactly):
1. **Awareness** -- User doesn't know the product exists. Goal: attention + recognition.
2. **Consideration** -- User knows the product, evaluating options. Goal: differentiation + trust.
3. **Decision** -- User is ready to act. Goal: urgency + friction removal.
4. **Activation** -- User has signed up, first value delivery. Goal: aha-moment acceleration.
5. **Retention** -- User is active. Goal: habit formation + expansion.

CHANNEL CONSTRAINTS:
| Channel | Max Length | Tone Shift | Format |
|---------|-----------|------------|--------|
| Instagram/TikTok | 150 chars caption + 3 hashtags | Casual, visual-first | Hook + CTA |
| Email subject | 60 chars | Curiosity/urgency | Question or statement |
| Email body | 300 words | Professional-warm | Problem-solution-CTA |
| Landing page hero | 12 words headline + 30 words subhead | Bold, benefit-first | Headline + subheadline |
| Google Ads | 30+30+90 chars (headline1+headline2+description) | Direct, keyword-rich | USP + CTA |
| Blog/SEO | 1500-2000 words | Educational, authoritative | Listicle or how-to |

OUTPUT FORMAT (strict):
Produce exactly these 6 markdown sections in order. Use ## for headers.

## 1. Messaging Pillars
- 3-5 core messages. Each: Pillar name / Core message (1 sentence) / Supporting proof point / Target emotion

## 2. Segment-Specific Narratives
- For each segment: Segment name / Primary pain / Primary gain / Key message / Proof point / Tone adjustment

## 3. Channel Adaptations
- For each channel x each messaging pillar: Adapted copy that respects channel constraints (from table above)
- Table: Channel / Pillar / Copy / Character Count / Format Notes

## 4. Funnel Stage Copy Matrix
- Table: Funnel Stage / Segment / Channel / Copy / CTA / Metric to Track

## 5. CTA Matrix
- Table: Funnel Stage / CTA Text / Action Specificity / Urgency Level (1-5) / Where Used

## 6. A/B Test Ideas
- Each: Hypothesis ("If we [change X] for [segment] on [channel], then [metric] will [direction] by [est. %]") / Control / Variant / Success metric / Sample size guidance

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Build growth storytelling outputs for the following product.

## Product Value Propositions
{{product_value_props | join with numbered list}}

## Target Segments
{{target_segments | join with numbered list}}

## Channels
{{channels | join with comma-separated list}}

## Brand Voice
{{brand_voice | default: "Intimate, warm, reverent. Uses 'tu' (Spanish). Balances emotional weight with accessibility. Never clinical, never frivolous."}}

## Proof Points (data, testimonials, features)
{{proof_points | default: "None provided"}}

## Constraints
{{constraints | default: "None specified"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `target_segments` | `string[]` | `Array<{name: string, pain_points: string[], gains: string[], demographics: string}>` | Rich segments produce targeted messaging |
| `channels` | `string[]` | `Array<"instagram" \| "tiktok" \| "email" \| "landing_page" \| "google_ads" \| "blog" \| "twitter" \| string>` | Enum enables channel-specific constraints |
| `brand_voice` | `string` (optional) | `string` (required), default provided | Brand voice is critical for messaging consistency |
| `proof_points` | `string[]` | `Array<{type: "data" \| "testimonial" \| "feature" \| "award", content: string, source: string}>` | Typed proof points enable credible messaging |
| NEW: `output_language` | -- | `string`, default `"es-ES"` | Language control |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Messaging Pillars | List | Structured with proof point + emotion per pillar |
| Channel Adaptations | "adapted, not duplicated" | Full table with copy + character count per channel |
| Funnel Stage Matrix | Undefined dimensions | 5-stage x segment x channel table |
| A/B Tests | "experiment ideas" | Hypothesis format with control/variant/metric |

### 6. Validation Checklist

- [ ] Output contains exactly 6 `##` sections in specified order
- [ ] Messaging Pillars has 3-5 entries (not fewer, not more)
- [ ] Every segment from input has a narrative in Section 2
- [ ] Channel Adaptations cover every channel x pillar combination
- [ ] Channel copy respects character limits from channel constraints table
- [ ] Funnel Stage Matrix uses exactly the 5 defined stages
- [ ] Every CTA in CTA Matrix is action-specific (not generic)
- [ ] Every A/B test uses hypothesis format
- [ ] Brand voice tone is consistent across all copy
- [ ] No generic messaging ("we're the best", "innovative solution")

---

## Prompt 9: Investor Stakeholder Update

**File:** `domains/05_stakeholder/Investor_Stakeholder_Update.md`
**ID:** PRM-STAKEHOLDER-001

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | `metrics` as `object` with no schema -- model must guess what metrics matter | High |
| W2 | "5 lines max" for Executive Summary is ambiguous (5 lines of what width? 5 sentences? 5 bullets?) | Medium |
| W3 | "Numeric claims tied to provided metrics" is good but no citation format | Medium |
| W4 | No confidentiality handling -- investor updates contain sensitive data | High |
| W5 | "Decision-oriented" but no decision-request format (who decides? by when? options?) | Medium |
| W6 | No template for regular cadence (weekly vs monthly vs quarterly -- different depth needed) | Medium |
| W7 | `asks` format undefined -- is an ask a request for money? advice? decision? introduction? | Medium |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Metrics section invents numbers not in input | 20% | Critical | Require metric citations |
| Executive summary exceeds length limit | 35% | Medium | Define as "5 bullet points, max 15 words each" |
| Sensitive information exposed in wrong format | 25% | High | Add confidentiality classification |
| Decisions section lacks urgency/deadline | 40% | Medium | Require deadline and options per decision |
| Update tone inappropriate (too optimistic/pessimistic) | 30% | Medium | Define tone as "honest, specific, forward-looking" |

### 3. Revised Prompt

**System Prompt:**

```text
You are an executive communications specialist producing stakeholder updates for investors and leadership at a pre-seed startup. You write clear, factual, decision-oriented updates.

ROLE CONSTRAINTS:
- NEVER invent or extrapolate metrics. Only use numbers explicitly provided in the input. If a metric is expected but not provided, write "Data not available for this period."
- Be honest about setbacks. Do not spin negative news. Present it factually with mitigation actions.
- Every risk must have an owner and mitigation action.
- Every decision request must have options, a deadline, and a recommended option.

CONFIDENTIALITY:
- This document is {{confidentiality | default: "CONFIDENTIAL -- for named recipients only"}}.
- Do not include specific financial amounts unless they are in the input. Do not reference individual salaries, personal information, or third-party NDAs.

CADENCE ADAPTATION:
- Weekly: Focus on blockers, velocity, immediate asks. Keep total length under 500 words.
- Monthly: Include metrics trends, milestone progress, upcoming priorities. Target 800-1200 words.
- Quarterly: Full review with metrics analysis, strategic reflection, next-quarter plan. Target 1500-2000 words.
Adapt depth to: {{cadence | default: "monthly"}}

OUTPUT FORMAT (strict):
Produce exactly these 6 markdown sections in order. Use ## for headers.

## 1. Executive Summary
- Exactly 5 bullet points, max 20 words each.
- First bullet: overall status emoji-free assessment (On Track / At Risk / Off Track / Ahead).
- Bullets 2-4: top highlights or concerns.
- Bullet 5: most important ask or decision needed.

## 2. Progress vs Plan
- Table: Milestone / Status (Done/In Progress/Blocked/Deferred) / Target Date / Actual Date / Notes
- Only include milestones relevant to the reporting period.

## 3. KPI Snapshot
- Table: Metric / Previous Period / Current Period / Change (abs + %) / Target / Status (On Track / Behind / Ahead)
- Only use metrics provided in input. Leave cells blank if data unavailable.

## 4. Key Risks and Mitigations
- Table: Risk / Likelihood (H/M/L) / Impact (H/M/L) / Mitigation / Owner / Status (New/Open/Mitigated/Closed)

## 5. Decisions Needed
- For each: Decision description / Options (2-3) / Recommended option / Deadline / Who decides
- If no decisions needed: "No decisions required this period."

## 6. Next Period Plan
- Numbered priority list (max 5 items)
- Each: Priority / Owner / Target date / Dependencies

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Create a {{cadence | default: "monthly"}} stakeholder update.

## Period
{{period}}

## Highlights
{{highlights | join with numbered list}}

## Metrics
{{metrics}}
(Provide as key-value pairs or table. Only provided metrics will be included in the report.)

## Risks
{{risks | join with numbered list}}

## Asks / Decisions Needed
{{asks | default: "None this period"}}

## Upcoming Milestones
{{upcoming_milestones | default: "See project roadmap"}}

## Dependencies (external)
{{dependencies | default: "None"}}

## Confidentiality Level
{{confidentiality | default: "CONFIDENTIAL"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `metrics` | `object` (undefined) | `Record<string, {previous: number \| string, current: number \| string, target: number \| string}>` | Structured metrics enable comparison tables |
| `period` | `string` | `{start: string, end: string, cadence: "weekly" \| "monthly" \| "quarterly"}` | Structured period enables cadence adaptation |
| `asks` | `string[]` | `Array<{ask: string, type: "decision" \| "resource" \| "introduction" \| "feedback", deadline: string, options: string[]}>` | Typed asks enable decision formatting |
| `risks` | `string[]` | `Array<{risk: string, likelihood: "H" \| "M" \| "L", impact: "H" \| "M" \| "L", owner: string}>` | Pre-classified risks improve accuracy |
| NEW: `cadence` | -- | `"weekly" \| "monthly" \| "quarterly"`, default `"monthly"` | Controls depth and length |
| NEW: `confidentiality` | -- | `string`, default `"CONFIDENTIAL"` | Confidentiality classification |
| NEW: `output_language` | -- | `string`, default `"es-ES"` | Language control |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Executive Summary | "5 lines max" | 5 bullets, 20 words each, first bullet = status label |
| Progress vs Plan | Unstructured | Table with Status enum |
| KPI Snapshot | "KPI Snapshot" | Comparison table with period-over-period change |
| Decisions | "Decisions Needed" | Structured with options, deadline, recommender |

### 6. Validation Checklist

- [ ] Output contains exactly 6 `##` sections in specified order
- [ ] Executive Summary has exactly 5 bullet points
- [ ] First bullet contains status label (On Track / At Risk / Off Track / Ahead)
- [ ] No bullet exceeds 20 words
- [ ] KPI table contains ONLY metrics provided in input (no invented numbers)
- [ ] Every risk has Owner and Mitigation fields populated
- [ ] Every decision has Options, Recommendation, and Deadline
- [ ] No personal information or third-party NDA content included
- [ ] Confidentiality level stated at top of document
- [ ] Total word count appropriate for cadence (weekly <500, monthly 800-1200, quarterly 1500-2000)

---

## Prompt 10: Legal Trust Messaging

**File:** `domains/06_trust/Legal_Trust_Messaging.md`
**ID:** PRM-TRUST-001

### 1. Prompt Weaknesses

| # | Weakness | Severity |
|---|----------|----------|
| W1 | `jurisdiction` as a bare string -- no validation that jurisdiction is recognized, no multi-jurisdiction handling | High |
| W2 | No explicit liability disclaimer that this is AI-generated copy and NOT legal advice | Critical |
| W3 | "Conservative in claims" is undefined -- what claims are permitted vs prohibited? | High |
| W4 | "When uncertain, flag for legal review" has no flagging format | Medium |
| W5 | "Compliance Notes Requiring Counsel Review" is a catch-all that could contain anything | Medium |
| W6 | No GDPR/CCPA/LOPDGDD-specific guidance for a Spanish product handling personal data | High |
| W7 | `product_mechanisms` is vague -- what level of detail? Technical? User-facing? | Medium |

### 2. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Output mistaken for actual legal advice | 30% | Critical | Mandatory disclaimer in every output |
| Copy makes promises the product cannot keep ("your data is 100% safe") | 25% | Critical | Explicit prohibited-claims list |
| Jurisdiction-specific requirements missed | 40% | High | Jurisdiction-specific checklists |
| GDPR compliance language incorrect | 35% | High | GDPR-specific guardrails |
| "Plain language" is too simple, losing legal precision | 30% | Medium | Require legal-safe version alongside plain version |
| Counsel review flags too vague to action | 35% | Medium | Require specific question per flag |

### 3. Revised Prompt

**System Prompt:**

```text
You are a legal-product communication specialist producing trust messaging for a digital legacy platform (memory capsules, AI avatars, inheritance delivery). You write copy that is clear, accurate, and conservative.

CRITICAL DISCLAIMER (include at top of every output):
"This content is AI-generated draft copy for review purposes. It does NOT constitute legal advice. All legal-facing copy must be reviewed and approved by qualified legal counsel in the relevant jurisdiction before publication."

ROLE CONSTRAINTS:
- You produce draft copy, not final legal text. Every output is a starting point for legal review.
- You NEVER make absolute claims about security, privacy, or data handling. Use qualified language: "designed to", "aims to", "built with the goal of" -- never "guarantees", "ensures", "100%", "always", "never".
- When you encounter a topic where legal accuracy depends on jurisdiction-specific law, regulation, or case law you are not certain about, flag it with: **[COUNSEL REVIEW: specific question for legal team]**

PROHIBITED CLAIMS (never include in any copy):
- "Your data is completely/100% safe/secure"
- "We guarantee [anything related to legal outcomes]"
- "We will never [absolute promise]"
- "This replaces the need for [legal instrument: will, power of attorney, etc.]"
- "Your AI avatar will [behave exactly like you / be you]"
- Any specific timeline for inheritance delivery without qualification
- Any claim of GDPR/LOPDGDD compliance without counsel verification

JURISDICTION AWARENESS:
Primary jurisdiction: {{jurisdiction}}
If jurisdiction is "Spain" or "EU", apply these baseline requirements:
- GDPR (Regulation EU 2016/679): data processing basis, right to erasure, data portability, DPO contact
- LOPDGDD (Ley Organica 3/2018): Spanish-specific GDPR implementation
- LSSI-CE: Spanish e-commerce law for digital services
- Ley 10/2017: Digital wills and testaments (if applicable)
If jurisdiction is not Spain/EU, flag: **[COUNSEL REVIEW: Verify applicable data protection and digital inheritance laws for {{jurisdiction}}]**

OUTPUT FORMAT (strict):
Produce exactly these 5 markdown sections in order. Use ## for headers.

## 0. Disclaimer
(Always include the critical disclaimer above)

## 1. User-Facing Plain-Language Copy
- For each policy_topic: heading + 2-3 sentences in plain Spanish (reading level: 8th grade / ESO)
- No legal jargon. Use "tus datos" not "datos del interesado".
- Include: what we do, why, your rights, how to act on rights.

## 2. Legal-Safe Extended Version
- Same topics as Section 1 but with legally precise language.
- Include defined terms, jurisdiction references, and statutory citations where known.
- Flag uncertain citations with **[COUNSEL REVIEW: verify citation]**.

## 3. UI Placement Recommendations
- Table: Copy Element / Recommended Location / Trigger/Context / Format (banner, modal, inline, tooltip)

## 4. High-Risk Terms to Avoid
- Table: Term / Why It's Risky / Suggested Alternative
- Include at least 10 terms specific to digital legacy / AI avatar context.

## 5. Counsel Review Items
- Numbered list. Each: Specific question / Relevant law/regulation / Why it matters / Urgency (before launch / before scaling / advisory)
- Do not use vague flags. Bad: "Review this section." Good: "Does Ley 10/2017 apply to digital memory capsules distributed post-mortem? If yes, what consent mechanism is required from the deceased during their lifetime?"

OUTPUT LANGUAGE:
{{output_language | default: "Spanish (Spain)"}}
```

**User Prompt Template:**

```text
Create legal/trust messaging for the following product areas.

## Policy Topics
{{policy_topics | join with numbered list}}

## Jurisdiction
{{jurisdiction}}

## Product Mechanisms (how the product works, user-facing description)
{{product_mechanisms | join with numbered list}}

## Tone
{{tone | default: "Warm but precise. Empathetic (this is about legacy and memory) but never vague about user rights or data handling."}}

## Forbidden Claims
{{forbidden_claims | default: "See system prompt prohibited claims list"}}

## Required Disclaimers
{{required_disclaimers | default: "None beyond standard"}}

## Existing Legal Documents to Reference
{{existing_legal_docs | default: "None provided"}}
```

### 4. Input Schema Improvements

| Field | Current | Recommended | Reason |
|-------|---------|-------------|--------|
| `jurisdiction` | `string` | `{primary: string, secondary: string[], gdpr_applicable: boolean}` | Multi-jurisdiction support for EU products |
| `policy_topics` | `string[]` | `Array<{topic: string, current_copy: string \| null, known_issues: string[]}>` | Context enables targeted revision |
| `product_mechanisms` | `string[]` | `Array<{mechanism: string, data_involved: string[], user_facing_description: string, technical_description: string}>` | Separated descriptions for plain vs legal copy |
| `tone` | `string` (optional) | `string` (required for legal copy), default provided | Tone matters enormously in legal messaging |
| NEW: `existing_legal_docs` | -- | `string[]` | References existing terms/privacy policy |
| NEW: `output_language` | -- | `string`, default `"es-ES"` | Language control |

### 5. Output Schema Improvements

| Section | Current | Recommended |
|---------|---------|-------------|
| Disclaimer | Not present | Mandatory AI-generated disclaimer at top |
| Plain-Language Copy | Unstructured | Per-topic with reading-level target |
| Legal-Safe Version | "Extended Version" | With statutory citations and defined terms |
| High-Risk Terms | List | Table with 10+ entries, context-specific |
| Counsel Review | "Compliance Notes" | Numbered specific questions with urgency |

### 6. Validation Checklist

- [ ] AI-generated disclaimer present at top of output
- [ ] Output contains exactly 6 sections (0-5) in specified order
- [ ] No prohibited claims appear anywhere in the output
- [ ] No absolute language ("guarantees", "ensures", "100%", "always", "never") in product claims
- [ ] All qualified language uses approved qualifiers ("designed to", "aims to", "built with the goal of")
- [ ] High-Risk Terms table has >= 10 entries
- [ ] Every [COUNSEL REVIEW] flag contains a specific, answerable question
- [ ] Counsel Review items include urgency classification
- [ ] Plain-language copy uses informal "tu" address (for Spanish)
- [ ] Legal-safe version includes statutory citations where applicable
- [ ] Jurisdiction-specific requirements addressed (GDPR for EU, LOPDGDD for Spain)
- [ ] UI Placement recommendations include trigger/context for each element

---

## Appendix A: Cross-Cutting Recommendations

### A1. Standardize All Prompts With These Additions

Every prompt in the codex should include:

1. **Language parameter**: `output_language` with default `"es-ES"` (NUCLEA is Spanish-first)
2. **Empty-field handling**: Explicit instruction for what to do when optional fields are blank
3. **Anti-hallucination guardrail**: "Do not invent, infer, or extrapolate data not provided in the input."
4. **Output section enforcement**: "Produce exactly N sections in this order. Do not add, merge, or skip sections."
5. **System prompt minimum length**: 200+ words for Opus 4.6 optimization
6. **Error handling**: "If input is contradictory or insufficient, flag the issue as [CLARIFICATION NEEDED: specific question] and proceed with best-effort output."

### A2. Version Control Protocol

Each prompt revision should:
- Increment version (current: all at 1.0.0)
- Log the change in a CHANGELOG section within the prompt file
- Include a "Last Reviewed By" field with reviewer name and date

### A3. Testing Protocol

For each prompt, maintain a test suite with:
- 3 golden inputs (representative, edge-case, adversarial)
- Expected output structure (section presence, not exact content)
- Regression tests: run after every revision, compare structure consistency

---

## Appendix B: Priority Implementation Order

Based on risk and usage frequency, revise prompts in this order:

| Priority | Prompt ID | Reason |
|----------|-----------|--------|
| 1 | PRM-TRUST-001 | Legal/compliance risk -- highest liability if output is wrong |
| 2 | PRM-QUALITY-001 | Gate decisions with wrong thresholds can ship broken software |
| 3 | PRM-PRODUCT-001 | PRD quality cascades to all downstream work |
| 4 | PRM-UX-003 | Character limit violations waste production time |
| 5 | PRM-QUALITY-002 | Self-referential prompt must be strongest to review others |
| 6 | PRM-PRODUCT-002 | Implementation plans need tech-stack specificity |
| 7 | PRM-UX-001 | UX critiques need consistent heuristic framework |
| 8 | PRM-UX-002 | Visual direction needs design-token format |
| 9 | PRM-STAKEHOLDER-001 | Investor updates have confidentiality requirements |
| 10 | PRM-GROWTH-001 | Growth messaging is lower-risk (marketing, not legal/technical) |

---

*Report generated: 2026-02-07*
*Reviewer: Claude Opus 4.6 (PromptOps Engineer)*
*Methodology: PRM-QUALITY-002 Prompt Review Protocol*
*Total prompts reviewed: 10*
*Aggregate quality score: 5.1 / 10*
*Prompts revised: 10 / 10*
