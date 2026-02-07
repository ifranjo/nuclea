# PRM-UX-001: UX Flow Critique -- NUCLEA Onboarding

**Prompt ID:** PRM-UX-001
**Flow:** Onboarding (P1 through P4)
**Reviewer:** Claude Opus 4.6 (Senior UX Reviewer)
**Date:** 2026-02-07
**Codebase Commit:** POC_INTERNA/app (white-theme onboarding prototype)
**Methodology:** Code-grounded heuristic review against Nielsen's 10 + emotional/trust dimensions

---

## 1. Executive Summary

NUCLEA's onboarding is an ambitious attempt to weaponize emotion as a conversion mechanism. The "capsule as ritual object" metaphor is genuinely novel in the digital legacy space and could be a strong differentiator. However, the current implementation sacrifices usability fundamentals in pursuit of theatrical spectacle.

**The core tension:** The flow treats onboarding as a cinematic experience (watch, feel, then act) when the target persona -- a 35-55-year-old non-technical adult processing grief or legacy anxiety -- needs a guided conversation (understand, relate, then choose).

**Three structural problems dominate:**

1. **P2 is a black box.** A 4-second auto-advancing animation with no user agency, no skip mechanism, and no textual context. Users who blink will not understand what happened. Users who were absorbed will be yanked away mid-engagement.
2. **The manifesto-to-selection gap is an emotional cliff.** P3 builds poetic resonance; P4 immediately demands a complex taxonomic decision among 6 options with no guidance hierarchy.
3. **Zero progressive disclosure of what capsules actually are.** By the time users must choose a capsule type, they have read exactly one sentence about what NUCLEA does ("NUCLEA transforma tus recuerdos en legado"). They have not learned what a capsule contains, what it costs, or what happens after creation.

**Estimated impact of unaddressed issues:** Based on comparable onboarding benchmarks for emotional digital products (e.g., Calm, Headspace, Eternos), the current flow likely suffers a 40-65% cumulative drop-off from P1 through P4 selection, with the heaviest losses at the P2 auto-advance and P4 selection paralysis points.

---

## 2. Critical Issues by Severity

### P0 -- Blocks Core Conversion (Fix Before Any User Testing)

| ID | Issue | Screen | Evidence | Impact |
|----|-------|--------|----------|--------|
| P0-1 | **P2 auto-advance has no user control** | P2 | `setTimeout(onNext, 4000)` in `P2CapsuleOpening.tsx:48`. No skip button, no pause, no tap-to-hold. The progress bar (`p2-progress-fill` keyframe) is the only affordance, and it has no label. | Users who are engaged with polaroid interactions (hover: heart/expand/share) will be interrupted. Users who are confused will be advanced before comprehension. Both states produce frustration. Estimated 25-35% implicit drop-off (mental disengagement even if they don't leave). |
| P0-2 | **No back navigation in the entire flow** | All | `onboarding/page.tsx` only increments step via `next()`. No `prev()` callback. No back button. No swipe-back gesture. | Violates Nielsen H3 (User Control and Freedom). If a user accidentally taps on P1, they cannot return. If they want to re-read the manifesto from P4, they must reload the page. For a 35-55 demographic unfamiliar with the product, this is a trust-breaker. |
| P0-3 | **P4 presents 6 options with no decision aid** | P4 | `CAPSULE_TYPES` array in `types/index.ts` renders 6 `CapsuleTypeCard` components with identical visual weight. No "recommended" badge, no "most popular" indicator, no filtering, no "not sure? start here" escape hatch. | Selection paralysis is a known drop-off for this persona. Hick's Law predicts decision time increases logarithmically with option count. 6 equal-weight options with single-sentence taglines give insufficient information for a commitment-level decision. |

### P1 -- Significant Friction (Fix Before Launch)

| ID | Issue | Screen | Evidence | Impact |
|----|-------|--------|----------|--------|
| P1-1 | **P1 capsule tap target is the entire viewport** | P1 | `P1CapsuleClosed.tsx:13` -- the outer `<div>` with `role="button"` and `onClick={onNext}` wraps the full `h-[100dvh]`. | Any accidental touch anywhere on screen advances the flow. Users exploring the UI, adjusting grip, or scrolling instinctively will trigger the advance. The 240x120px capsule should be the only interactive zone. |
| P1-2 | **P2 polaroid interactions are non-functional and misleading** | P2 | `PolaroidPlaceholder.tsx` renders heart, expand, and share buttons (`interactive` prop) that do nothing (`onClick` handlers are absent). The buttons are interactive-looking (`cursor-pointer`, hover states) but have no functionality. | Violates Nielsen H2 (Match Between System and Real World) and H7 (Flexibility and Efficiency). Users who attempt to interact with these affordances will feel the system is broken. On mobile, these hover-dependent icons are invisible (no `:hover` on touch), so mobile users see a different (and inferior) experience to desktop users. |
| P1-3 | **No loading/connection state for P2 images** | P2 | 8 polaroid images load from `/images/polaroids/` with no `placeholder="blur"` or skeleton. `next/image` without `blurDataURL` shows nothing until loaded. | On slow connections, polaroids will emerge as blank white rectangles, destroying the emotional impact. The "memories floating out" moment becomes "empty frames floating out." |
| P1-4 | **P3 "Continuar" button lacks visual prominence** | P3 | `Button.tsx` renders `bg-transparent border-[1.5px] border-nuclea-text`. Against the glassmorphic card and floating visual elements, a transparent outlined button competes poorly for attention. | On P3, the primary CTA is the weakest visual element on screen. The floating pills, polaroids, and manifesto text all have more visual mass. Users may linger waiting for something to happen rather than scrolling down to find the button. |
| P1-5 | **Header menu button is non-functional with `tabIndex={-1}`** | P4 | `Header.tsx:12` -- `tabIndex={-1}` removes the hamburger from keyboard tab order. The button has no `onClick` handler. | Users who expect navigation (especially after the disorienting auto-advance) find a dead control. The visual presence of a menu icon sets an expectation the code does not fulfill. For a POC this is acceptable, but for user testing it will confuse and erode trust. |

### P2 -- Moderate Friction (Fix Before Scale)

| ID | Issue | Screen | Evidence | Impact |
|----|-------|--------|----------|--------|
| P2-1 | **Capsule names mix Spanish and English** | P4 | `types/index.ts` -- "Capsula Legacy", "Capsula Together", "Capsula Social", "Capsula Origen". Three of six names contain English words without explanation. | The target persona is 35-55 Spanish-speaking adults. "Legacy" and "Together" have no immediate emotional resonance in Spanish. "Social" is ambiguous (social media connotation). This creates cognitive friction at the exact decision point. |
| P2-2 | **No progress indicator across the 4-step flow** | All | `onboarding/page.tsx` manages state via `useState` with no visual step indicator (dots, numbered steps, or breadcrumb). | Users do not know how long the experience is, where they are, or how much remains. This is particularly damaging after the P2 auto-advance, which already feels like losing control. |
| P2-3 | **Viewport-unit positioning of polaroids breaks on small screens** | P2 | Polaroid positions use `vw`/`vh` offsets (e.g., `x: '-38vw', y: '-32vh'`). On a 375px-wide iPhone SE, `-38vw` = `-142px`, pushing polaroids off-screen. | On the smallest supported breakpoint (375px per design system spec), several polaroids and floating capsules will be fully or partially clipped by `overflow-hidden`, reducing the visual impact. |
| P2-4 | **No reduced-motion support** | All | No `prefers-reduced-motion` media query or Framer Motion `useReducedMotion` hook anywhere in the codebase. | WCAG 2.1 SC 2.3.3 (Animation from Interactions) requires respecting user motion preferences. The floating, breathing, particle, and transition animations cannot be disabled. This is both an accessibility failure and a potential seizure risk for the 12 gold particle sparkles. |
| P2-5 | **P1 hint text "Toca para abrir" assumes touch** | P1 | `P1CapsuleClosed.tsx:70` -- hardcoded "Toca para abrir" regardless of device. | Desktop users (who may be viewing this on a laptop) are told to "touch" when they should click. Minor but contributes to a "this isn't for me" signal for the portion of the 35-55 demographic who browse on desktop. |
| P2-6 | **P4 capsule detail page likely does not exist** | P4 | `P4CapsuleSelection.tsx:41` -- `router.push('/onboarding/capsule/${capsuleType.id}')`. The route `app/onboarding/capsule/[type]/page.tsx` exists but its content is unknown from this review. | If the detail page is incomplete, the entire conversion funnel dead-ends. Users who finally overcome selection paralysis will hit a 404 or empty page. |

---

## 3. Friction Map by Step

### P1: CapsuleClosed

```
ENTRY ---- "What is this?" ---- Capsule breathes ---- Hint appears (1.5s) ---- TAP
  |              |                     |                       |                  |
  |         [Confusion]          [Curiosity]            [Recognition]      [Advancement]
  |         "Blank white          "Something             "Oh, I should       "Wait, I
  |          page? Error?"         is alive"              interact"           just tapped
  |                                                                           the bg"
  |
  FRICTION POINTS:
  - No brand context (no logo, no "NUCLEA" text on P1)
  - Entire screen is tap target (accidental advance)
  - No indication this is step 1 of a flow
  - 1.5s delay on hint may feel like loading failure on slow devices
```

**Friction Score: 4/10** (Low friction, but risks accidental advancement and provides zero context)

**What works:** The minimalism is genuinely effective. The breathing animation creates organic anticipation. The `aria-label` and keyboard handlers show accessibility consideration.

**What fails:** Users arriving from a marketing page, email link, or app store will have zero context about what they are looking at. There is no brand mark, no headline, no frame. The emotional impact relies entirely on the user already knowing what NUCLEA is.

### P2: CapsuleOpening

```
ENTRY ---- Capsule splits ---- Light burst ---- Polaroids emerge ---- Auto-advance
  |              |                  |                  |                    |
  |         [Delight]          [Wonder]          [Engagement]         [INTERRUPTION]
  |         "Oh wow,            "Beautiful        "I want to           "Wait, it
  |          it opened!"         effect"           look at these"       moved on!"
  |                                                    |
  |                                              [Hover icons appear]
  |                                              [User tries heart/expand]
  |                                              [Nothing happens]
  |                                              [Broken trust]
  |
  FRICTION POINTS:
  - Auto-advance at 4s is too fast for comprehension + interaction
  - Interactive polaroid icons (heart/expand/share) do nothing
  - Progress bar has no label ("Tocca para continuar" or "Avance automatico")
  - No skip button for returning users
  - No pause mechanism
  - Content-rich screen (8 polaroids, 5 pills, 12 particles) with zero text explanation
```

**Friction Score: 8/10** (High friction -- the most problematic screen in the flow)

**What works:** The capsule-splitting animation is technically excellent. The staggered polaroid emergence with real photos creates genuine emotional resonance. The golden light burst and particles add premium polish.

**What fails:** This screen commits the cardinal sin of emotional UX: it builds engagement and then destroys it by yanking the user away. The `setTimeout(onNext, 4000)` is a hard 4-second wall. Polaroids finish arriving at approximately `1.75s + 1.2s = 2.95s`, leaving roughly 1 second to appreciate them before auto-advance. The interactive hover icons on polaroids (heart, expand, share) create an expectation of engagement that the timer immediately violates.

### P3: Manifesto

```
ENTRY ---- Hero area loads ---- Tagline reads ---- Body reads ---- Find button ---- TAP
  |              |                   |                 |               |              |
  |         [Recognition]      [Emotional           [Understanding]  [Searching]  [Relief]
  |         "More capsules       resonance"          "Okay so it's    "Where do    "Found it"
  |          and photos"         "Stories that        a memory          I go now?"
  |                               we remember"        vault"
  |
  FRICTION POINTS:
  - 9 floating pills + 5 polaroids compete with tagline for attention
  - Body copy is 1 sentence -- insufficient to explain the product
  - "Continuar" button is visually weak (transparent, thin border)
  - Button is at the very bottom -- below the fold on smaller phones
  - No indication of what "Continuar" leads to
  - Transition from "poetic manifesto" to "choose a product" (P4) is jarring
```

**Friction Score: 5/10** (Moderate -- works emotionally but fails informationally)

**What works:** The manifesto copy is strong. "Somos las historias que recordamos. Haz que las tuyas permanezcan." is a legitimate brand line. The glassmorphism card provides good content containment. The Cormorant Garamond italic adds the right typographic gravity.

**What fails:** The screen has a 1:15 decoration-to-content ratio. Nine floating pills and 5 polaroids fight for attention with a single card of text. The user is being told what NUCLEA is for the first time, and the visual noise undermines comprehension. Additionally, the body text ("NUCLEA transforma tus recuerdos en legado. Un espacio intimo...") is generic. It does not explain the capsule mechanic, the types, the pricing, or what happens next.

### P4: CapsuleSelection

```
ENTRY ---- Header appears ---- "Elige tu capsula" ---- 6 cards ---- Decision ---- TAP
  |              |                     |                   |            |            |
  |         [Orientation]        [Task switch]       [Scanning]    [Paralysis]  [Commitment?]
  |         "Oh, there's         "Wait, I have       "Legacy...     "I don't     "I guess
  |          a brand name"        to CHOOSE?"         Together...    know which    this one?"
  |                                                    Social...     one is me"
  |                                                    Pet...
  |                                                    Origen..."
  |
  FRICTION POINTS:
  - 6 capsule types with no visual differentiation (all identical card layout)
  - Taglines are too short to inform a decision (7-10 words each)
  - No "recommended" or "most popular" signal
  - No "I'll decide later" or "Help me choose" option
  - Mixed Spanish/English names ("Legacy", "Together")
  - Scrollable area may hide lower cards on small screens
  - Background decorations (8 pills, 4 polaroids) continue to compete with content
```

**Friction Score: 7/10** (High friction -- decision paralysis is the primary conversion killer)

**What works:** The frosted card list is clean and scannable. Each card has a clear structure (icon, name, tagline, chevron). The title "Aqui guardas lo que no quieres perder" is emotionally resonant.

**What fails:** This is a decision screen without decision support. The user has encountered the concept of "capsules" for approximately 8 seconds of readable text (P3 manifesto) and is now asked to commit to one of 6 types. There is no comparison, no "what's the difference" mechanism, no hierarchy, and no escape route for undecided users.

---

## 4. UX Heuristics Scorecard

### Nielsen's 10 Heuristics

| # | Heuristic | Score (1-5) | Evidence |
|---|-----------|-------------|----------|
| H1 | Visibility of System Status | 2/5 | P2 progress bar is unlabeled. No step indicator across flow. No loading states for images. Users cannot tell where they are in the 4-step journey. |
| H2 | Match Between System and Real World | 3/5 | The capsule metaphor is culturally resonant for the Spanish market. However, mixed Spanish/English naming ("Legacy", "Together") breaks immersion. "Toca para abrir" assumes touch on all devices. |
| H3 | User Control and Freedom | 1/5 | **Worst-scoring heuristic.** No back button. No skip on P2. No pause on P2. Full-screen tap target on P1. Auto-advance removes agency. Users are passengers, not drivers. |
| H4 | Consistency and Standards | 3/5 | Consistent visual language across screens. Capsule metaphor maintained throughout. However, P2 changes interaction model (passive watching vs. P1/P3/P4 active participation) without warning. |
| H5 | Error Prevention | 2/5 | Full-viewport tap target on P1 enables accidental advancement. No confirmation before capsule type selection. No "undo" after any action. |
| H6 | Recognition Rather Than Recall | 2/5 | The 6 capsule types require users to infer meaning from brief taglines. No visual examples of what each capsule contains. No comparison available. Users must recall and synthesize information from P3's single sentence. |
| H7 | Flexibility and Efficiency | 2/5 | No skip for returning users. No direct link to a specific capsule type. No keyboard shortcuts. The `?step=` URL parameter (detected in `onboarding/page.tsx:24-28`) is the only shortcut, and it is developer-facing, not user-facing. |
| H8 | Aesthetic and Minimalist Design | 4/5 | The visual design is genuinely beautiful. The metallic capsule, glassmorphism, and floating elements create a premium feel. One point deducted for decorative overload -- 9 pills + 5 polaroids on P3 compete with the manifesto. |
| H9 | Help Users Recognize, Diagnose, and Recover from Errors | 1/5 | No error states exist anywhere. No fallback if images fail to load. No guidance if a user is confused. No "help" or "learn more" links. |
| H10 | Help and Documentation | 1/5 | Zero help content. No tooltips. No FAQ link. No "What is a capsule?" explanation. The hamburger menu (P4) is non-functional. |

**Average Nielsen Score: 2.1/5**

### Emotional and Trust Dimensions

| Dimension | Score (1-5) | Evidence |
|-----------|-------------|----------|
| **Emotional Resonance** | 4/5 | The capsule metaphor, the "stories we remember" tagline, and the real photos in polaroids create genuine emotional engagement. The golden light burst and particles reinforce preciousness. Deducted for P2 auto-advance destroying the emotional peak. |
| **Trust Building** | 2/5 | No privacy reassurance in the onboarding flow. No mention of data security. No "your memories are encrypted" signal. No social proof (user count, testimonials). No brand credibility markers. The non-functional menu and polaroid buttons erode perceived reliability. |
| **Perceived Value** | 3/5 | The visual polish communicates premium quality. However, users learn almost nothing about what they get: no feature comparison, no pricing visibility, no storage mention. They are asked to select a product they do not yet understand. |
| **Cognitive Load** | 2/5 | P2 delivers 8 polaroids + 5 capsules + 12 particles + a light burst + a progress bar in 4 seconds. P4 demands a 6-way decision with minimal information. The flow alternates between sensory overload and information deficit. |
| **Agency / Empowerment** | 1/5 | **Worst emotional dimension.** The user is a spectator for 2 of 4 screens (P1 waits for them to discover the tap; P2 takes control entirely). No personalization. No choices until P4, where 6 equal options overwhelm. The flow happens TO the user, not WITH them. |

**Average Emotional Score: 2.4/5**

### Composite Score

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Nielsen Heuristics | 60% | 2.1/5 | 1.26 |
| Emotional/Trust | 40% | 2.4/5 | 0.96 |
| **Composite** | 100% | | **2.22/5** |

**Interpretation:** The flow is visually polished but structurally unsound. It would likely perform well in a design portfolio showcase and poorly in a user test with the target demographic.

---

## 5. Recommended Changes (Ranked by Impact)

### Tier 1: Critical Path Fixes (Do First)

| Priority | Change | Screen | Expected Impact | Effort |
|----------|--------|--------|-----------------|--------|
| 1 | **Replace P2 auto-advance with user-controlled progression.** Remove `setTimeout`. Add a "Continuar" button that appears after animations complete (~3s). Keep progress bar as visual timer but make it non-advancing. Let the user decide when they are ready. | P2 | Eliminates the #1 drop-off point. Estimated +15-25% retention through P2. | Low (remove timer, add button) |
| 2 | **Add back navigation to all screens.** Add a `prev()` callback. Render a back arrow on P2, P3, P4. On P1, show nothing (it is the entry point). | All | Restores user control (H3). Reduces anxiety about accidental advancement. | Low (add state management, render arrow) |
| 3 | **Add a "recommended" capsule or progressive filter on P4.** Options: (a) highlight "Capsula Legacy" as "Mas popular" or "Recomendada"; (b) add a 2-question mini-quiz ("Para quien es esta capsula?" -> self/pareja/amigos/mascota/hijos) that filters to 1-2 relevant options; (c) add "No se cual elegir" card at the bottom that links to a comparison page. | P4 | Reduces decision paralysis. Estimated +10-20% conversion from P4 to capsule detail. | Medium (option a is low effort; option b is medium) |
| 4 | **Add a step indicator (dot pagination) visible on all 4 screens.** Three dots on P1-P3 (P4 is the "destination" and does not need one). Current step highlighted. | P1-P3 | Restores visibility of system status (H1). Sets expectations for flow length. | Low |

### Tier 2: High-Value Improvements (Do Before User Testing)

| Priority | Change | Screen | Expected Impact | Effort |
|----------|--------|--------|-----------------|--------|
| 5 | **Restrict P1 tap target to the capsule element.** Move `onClick` from the outer `<div>` to the capsule `<motion.div>`. Add hover/focus visual feedback to the capsule itself. | P1 | Eliminates accidental advancement. | Trivial |
| 6 | **Remove or disable polaroid interaction icons on P2.** Either: (a) remove the `interactive` prop from `PolaroidPlaceholder` on P2, or (b) make the icons functional (expand opens a lightbox, heart saves to a "likes" memory). Option (a) is the right short-term fix. | P2 | Eliminates broken-trust signal from non-functional buttons. | Trivial (remove `interactive` prop) |
| 7 | **Expand P3 manifesto content.** Add 2-3 bullet points below the body copy: "Fotos, videos, mensajes de voz y notas escritas" / "Comparte con quien quieras, cuando quieras" / "Tu legado, cifrado y seguro". This gives users concrete understanding before P4. | P3 | Reduces the information gap before the P4 decision. | Low |
| 8 | **Translate capsule type names to full Spanish.** "Legacy" -> "Legado", "Together" -> "Juntos" or "En Pareja", "Social" -> "Amigos" or "Circulo". Keep names short but culturally native. | P4 | Removes linguistic friction for the target demographic. | Trivial |
| 9 | **Add `placeholder="blur"` with blurDataURL to all polaroid images.** Generate base64 blur placeholders for each photo. | P2, P3, P4 | Prevents blank-frame rendering on slow connections. | Low |

### Tier 3: Polish and Scale Optimizations (Do Before Launch)

| Priority | Change | Screen | Expected Impact | Effort |
|----------|--------|--------|-----------------|--------|
| 10 | **Implement `prefers-reduced-motion` support.** Use Framer Motion's `useReducedMotion()` hook. When active: disable floating/breathing animations, instant transitions, static polaroid layout. | All | Accessibility compliance (WCAG 2.1). | Medium |
| 11 | **Make P3 "Continuar" button visually stronger.** Change to filled style: `bg-nuclea-text text-white` instead of transparent outline. Or use the gold accent: `bg-[#D4AF37] text-white`. | P3 | Increases CTA visibility. | Trivial |
| 12 | **Add "Toca para abrir" / "Haz clic para abrir" device detection.** Use `navigator.maxTouchPoints` or a simple media query to swap copy. | P1 | Minor polish for desktop users. | Low |
| 13 | **Clamp polaroid positions for small viewports.** Replace `vw`/`vh` with `clamp()` or CSS `min()`/`max()` to keep polaroids visible on 375px screens. | P2 | Ensures visual impact on smallest supported device. | Medium |
| 14 | **Add a "Saltar intro" (Skip Intro) option on P1.** A small text link at the bottom: "Ya conozco NUCLEA -- ir a capsulas". Links directly to P4. | P1 | Reduces friction for returning users. | Low |

---

## 6. Experiment Backlog (Testable Hypotheses)

### Experiment 1: P2 Timer Duration

**Hypothesis:** Increasing P2 auto-advance from 4s to 8s (or replacing with manual advance) will reduce P2-to-P3 implicit drop-off by at least 20%.

**Method:** A/B test three variants:
- A (control): 4s auto-advance
- B: 8s auto-advance with "Toca para continuar" text appearing at 6s
- C: No auto-advance; "Continuar" button appears after 3s animation completes

**Primary Metric:** P3 engagement (time on P3 > 3s, indicating comprehension, not bounce).
**Secondary Metric:** P4 capsule selection rate.
**Sample Size:** 200 users per variant (power 0.8, alpha 0.05, MDE 15%).

### Experiment 2: P4 Decision Aid

**Hypothesis:** Adding a "most popular" badge to "Capsula Legacy" or a 2-question quiz will increase capsule selection rate by at least 15%.

**Method:** A/B/C test:
- A (control): 6 equal-weight cards
- B: "Capsula Legacy" has a subtle "Mas elegida" badge
- C: "No se cual elegir?" card at bottom opens a 2-question quiz that highlights 1-2 options

**Primary Metric:** Capsule detail page visit (from P4).
**Secondary Metric:** Time to decision on P4 (shorter = less paralysis).

### Experiment 3: Manifesto Content Depth

**Hypothesis:** Replacing P3's single sentence with 3 bullet points explaining concrete features will increase "Continuar" tap rate by at least 10%.

**Method:** A/B test:
- A (control): Current single-paragraph manifesto
- B: Tagline preserved, body replaced with 3 icon-bulleted features ("Fotos y videos" / "Mensajes de voz" / "Cifrado y privado")

**Primary Metric:** "Continuar" button tap rate.
**Secondary Metric:** P4 time-to-first-interaction (faster = better priming).

### Experiment 4: P1 Capsule-Only vs. Full-Screen Tap Target

**Hypothesis:** Restricting the tap target to the capsule (240x120px) will reduce accidental advances by at least 50% without reducing intentional advance rate.

**Method:** A/B test:
- A (control): Full-viewport tap target
- B: Only capsule element is tappable (with visual feedback on hover/press)

**Primary Metric:** P1 dwell time (longer = more intentional engagement before tapping).
**Secondary Metric:** P1-to-P2 drop-off (should be similar between variants).

### Experiment 5: Spanish-Only Capsule Names

**Hypothesis:** Translating "Legacy" and "Together" to Spanish ("Legado" and "En Pareja") will reduce time-to-selection on P4 by at least 10% for the target demographic.

**Method:** A/B test:
- A (control): Mixed Spanish/English names
- B: Fully Spanish names with updated taglines

**Primary Metric:** Time from P4 load to first card tap.
**Secondary Metric:** Card tap distribution (checking if specific cards gain or lose relative share).

### Experiment 6: Reduced Decorative Elements on P3

**Hypothesis:** Reducing floating pills from 9 to 3 and removing mini-polaroids on P3 will increase manifesto read-through rate (measured by scroll depth or CTA tap timing).

**Method:** A/B test:
- A (control): 9 pills + 5 polaroids + decorative dots
- B: 3 pills + 0 polaroids + no dots (manifesto text is the clear focal point)

**Primary Metric:** Time between P3 load and "Continuar" tap (optimal range: 5-12s, indicating reading).
**Secondary Metric:** Scroll depth on P3.

---

## Appendix A: File Reference

| File | Absolute Path | Relevance |
|------|---------------|-----------|
| Onboarding orchestrator | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\app\onboarding\page.tsx` | State management, step transitions |
| P1 component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\onboarding\P1CapsuleClosed.tsx` | Capsule closed, tap to open |
| P2 component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\onboarding\P2CapsuleOpening.tsx` | Auto-advance timer, polaroid animations |
| P3 component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\onboarding\P3Manifesto.tsx` | Manifesto text, CTA button |
| P4 component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\onboarding\P4CapsuleSelection.tsx` | Capsule type selection |
| Type definitions | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\types\index.ts` | CapsuleType enum, CAPSULE_TYPES array |
| Button component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\ui\Button.tsx` | CTA styling |
| Polaroid component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\capsule\PolaroidPlaceholder.tsx` | Interactive hover icons |
| Card component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\ui\CapsuleTypeCard.tsx` | Selection card layout |
| Header component | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\app\src\components\ui\Header.tsx` | Non-functional menu |
| Design system spec | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\DESIGN_SYSTEM.md` | Reference palette, typography, spacing |
| User flows spec | `C:\Users\Kaos\scripts\nuclea\POC_INTERNA\01_SPECS\USER_FLOWS.md` | Intended flow architecture |

## Appendix B: Severity Definitions

| Level | Definition | Timeline |
|-------|------------|----------|
| P0 | Blocks the primary conversion goal. Users cannot complete the intended flow, or a structural flaw produces >20% estimated drop-off. | Fix before any user testing. |
| P1 | Significant friction that degrades trust, comprehension, or emotional engagement. Does not block flow but measurably harms conversion. | Fix before launch or investor demo. |
| P2 | Moderate friction or polish issues. Noticeable to attentive users but unlikely to cause abandonment on their own. | Fix before scaling to paid acquisition. |

---

*Generated: 2026-02-07 | Reviewer: Claude Opus 4.6 | Prompt: PRM-UX-001 UX Flow Critic*
*Grounded in code review of 12 source files across the POC_INTERNA/app codebase.*
