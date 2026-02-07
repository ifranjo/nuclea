# PRM-UX-002 Visual Direction -- NUCLEA

## Metadata

- **Prompt ID:** `PRM-UX-002`
- **Version:** `1.0.0`
- **Owner:** Design Lead
- **Status:** `active`
- **Last Updated:** `2026-02-07`
- **Approved By:** CTO
- **Source of Truth:** `POC_INTERNA/01_SPECS/DESIGN_SYSTEM.md`

---

## 1. Creative Direction Statement

NUCLEA's visual language is built on a single premise: **absence reveals presence**. The interface is almost entirely white -- not as a minimalist trend, but as the visual equivalent of silence before a meaningful word is spoken. Every element that appears on screen has earned its place. The capsule, the polaroids, the typography -- they exist within vast negative space the way a handwritten letter exists within the quiet of an empty room. The white is not emptiness. It is reverence.

The metallic capsule is the gravitational center of the entire experience. It is rendered as a physical object -- brushed silver, light-catching, weighty -- suspended in white space the way a precious object rests on velvet in a museum vitrine. The user's relationship to this object must feel tactile and intimate before a single word of copy is read. When the capsule opens, the release of polaroids is not a UI animation -- it is an emotional exhale. The gold accent (#D4AF37) appears only in this moment and in the most premium contexts, functioning like gilding on the spine of a leather-bound book: present, warm, but never loud.

The typography pairing -- Inter for clarity, Cormorant Garamond italic for emotional resonance -- mirrors the duality of the product itself: precise digital infrastructure that serves deeply human, analog feelings. The interface never explains itself when it can instead evoke. Copy is sparse, written in the cadence of someone speaking quietly to someone they trust. Every screen should pass the test: *Could this be printed, framed, and hung on a wall without embarrassment?* If the answer is no, the screen is not finished.

---

## 2. Visual System

### 2.1 Color Palette

#### Primary Palette

| Token | Hex | RGB | Usage | Restriction |
|-------|-----|-----|-------|-------------|
| `--bg-primary` | `#FFFFFF` | 255, 255, 255 | Page background, full-bleed surfaces | Default for all screens. Never replaced. |
| `--bg-secondary` | `#FAFAFA` | 250, 250, 250 | Card backgrounds, elevated surfaces | Only on cards, modals, and input fields. Never as page bg. |
| `--bg-overlay` | `rgba(0,0,0,0.02)` | -- | Subtle depth layering | Only for surface differentiation, never as a visible color. |
| `--text-primary` | `#1A1A1A` | 26, 26, 26 | Headings, button labels, primary content | All display text. Never pure `#000000`. |
| `--text-secondary` | `#6B6B6B` | 107, 107, 107 | Body text, descriptions, secondary labels | Paragraphs, card descriptions. |
| `--text-muted` | `#9A9A9A` | 154, 154, 154 | Hints, placeholders, captions, timestamps | Never for actionable text. |

#### Capsule Metallic Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--capsule-gradient` | `linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)` | Capsule body fill. The only gradient permitted in the entire interface. |
| `--capsule-highlight` | `rgba(255,255,255,0.6)` | Light catch on capsule surface (pseudo-element). |
| `--capsule-shadow` | `rgba(0,0,0,0.12)` | Drop shadow beneath capsule: `0 8px 32px`. |
| `--capsule-text` | `#4A4A4A` | "NUCLEA" engraving on capsule surface. |

#### Accent Palette

| Token | Hex | Usage | Restriction |
|-------|-----|-------|-------------|
| `--accent-gold` | `#D4AF37` | EverLife badge, capsule opening glow, premium indicators, particle effects | **Never as button fill. Never as text color for body copy. Never as background.** Maximum 3 elements per screen. |
| `--accent-gold-glow` | `rgba(212,175,55,0.15)` | Ambient glow behind capsule during opening animation | Only during P2 opening sequence. |
| `--accent-gold-particle` | `rgba(212,175,55,0.4)` | Floating gold particles during capsule opening | Only during P2 opening sequence. |
| `--accent-link` | `#2563EB` | Inline text links, secondary CTA hover states | Never as decoration. Only functional. |

#### Semantic Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#22C55E` | Confirmation states, upload complete |
| `--error` | `#EF4444` | Form errors, destructive action warnings |
| `--warning` | `#F59E0B` | Approaching limits, expiration notices |

#### Color Usage Rules

1. **Gold rule of three.** No screen may contain more than 3 gold-accented elements. If a fourth is needed, demote the least important to `--text-muted`.
2. **No color fills on interactive surfaces.** Buttons are transparent with borders. Cards are white or `#FAFAFA`. Nothing is "colored in."
3. **Background is always white.** No cream, no warm-white, no cool-white variants. `#FFFFFF` exclusively.
4. **The capsule gradient is the only gradient.** No other element in the interface may use a CSS gradient of any kind.
5. **Gold never touches text.** Gold is for glows, particles, thin borders, and small badge backgrounds. Body text and headings are always `--text-primary` or `--text-secondary`.

#### Forbidden Colors

- Pure black `#000000` (use `#1A1A1A`)
- Any neon: cyan, magenta, electric blue, lime green
- Any dark background darker than `#F5F5F5`
- Saturated brand colors from other products
- Gradient meshes, rainbow effects, color transitions between hues

---

### 2.2 Typography Scale

#### Font Stack

```css
/* Body -- Inter */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display -- Cormorant Garamond */
--font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
```

#### Type Scale

| Level | Font | Size | Weight | Line Height | Letter Spacing | Use Case |
|-------|------|------|--------|-------------|----------------|----------|
| Display | Cormorant Garamond | 36px | 300 | 1.15 | -0.02em | P1 capsule reveal text (one per screen maximum) |
| Tagline | Cormorant Garamond | 20px | 400 italic | 1.4 | 0 | Manifesto lines, emotional subtitles |
| H1 | Inter | 28px | 600 | 1.2 | -0.01em | Screen titles |
| H2 | Inter | 22px | 600 | 1.3 | 0 | Section headers |
| H3 | Inter | 18px | 500 | 1.4 | 0 | Card titles, capsule type names |
| Body | Inter | 16px | 400 | 1.5 | 0 | Paragraphs, descriptions |
| Body Small | Inter | 14px | 400 | 1.5 | 0 | Secondary descriptions, metadata |
| Caption | Inter | 12px | 400 | 1.4 | 0.01em | Timestamps, hints, legal text |
| Button | Inter | 16px | 500 | 1.0 | 0.02em | Button labels |
| Overline | Inter | 11px | 600 | 1.0 | 0.08em | Category labels (uppercase) |

#### Typography Rules

1. **Cormorant Garamond is reserved.** It appears only for: (a) the manifesto tagline on P3, (b) display-level emotional text on splash/hero moments, (c) capsule type taglines in detail views. It never appears in navigation, buttons, form labels, or error messages.
2. **Maximum two type sizes per screen.** A screen may use at most one heading level and one body level, plus caption if needed. No screen should mix H1 + H2 + H3.
3. **Italic Cormorant only for direct emotional address.** "Somos las historias que recordamos" = italic. "Elige tu capsula" = Inter, not italic.
4. **No bold above weight 600.** The heaviest weight in the system is Semi Bold (600). No 700, 800, or 900.
5. **Line length maximum: 540px** (approximately 65-70 characters). Body text blocks must be constrained. On mobile this is naturally achieved; on desktop, use `max-w-xl`.

---

### 2.3 Spacing System

#### Base Unit: 8px

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--space-1` | 4px | `p-1` / `gap-1` | Icon-to-label micro gap |
| `--space-2` | 8px | `p-2` / `gap-2` | Inline element spacing |
| `--space-3` | 12px | `p-3` / `gap-3` | Compact card padding |
| `--space-4` | 16px | `p-4` / `gap-4` | Standard card padding, form field gaps |
| `--space-5` | 24px | `p-6` / `gap-6` | Section inner padding (mobile) |
| `--space-6` | 32px | `p-8` / `gap-8` | Section separator, card-to-card gap |
| `--space-7` | 48px | `p-12` / `gap-12` | Major section breaks |
| `--space-8` | 64px | `p-16` / `gap-16` | Screen top/bottom padding |
| `--space-9` | 96px | `p-24` / `gap-24` | P1 capsule vertical centering offset |

#### Screen Margins

| Context | Horizontal | Top | Bottom |
|---------|-----------|-----|--------|
| Mobile (< 768px) | 24px (`px-6`) | 48px (`pt-12`) | 32px (`pb-8`) |
| Tablet (768-1024px) | 48px (`px-12`) | 64px (`pt-16`) | 48px (`pb-12`) |
| Desktop (> 1024px) | auto (centered, `max-w-[480px] mx-auto`) | 96px (`pt-24`) | 64px (`pb-16`) |

#### Content Width Constraints

| Content Type | Max Width | Reasoning |
|-------------|-----------|-----------|
| Onboarding screens (P1-P4) | 480px | Mobile-native feel on all devices |
| Body text blocks | 540px | Optimal line length for reading |
| Capsule type cards list | 400px | Single-column stack, generous margins |
| Landing page sections | 1024px | Wider for marketing content only |

---

## 3. Composition Rules

### 3.1 Layout Grid

#### Mobile (Default)

- Single column, full-width
- Content centered horizontally
- Vertical rhythm driven by `--space-6` (32px) between major elements
- No CSS Grid on mobile onboarding. Flexbox column only.

#### Desktop Adaptation

- Content area remains single-column, centered at `max-w-[480px]`
- Surrounding whitespace expands proportionally
- The capsule on P1 is never scaled up for desktop. It maintains its mobile dimensions. The additional space becomes more white.

#### The P1 Rule (Capsule Closed)

```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|                                                          |
|                                                          |
|              [    CAPSULE (280 x 100)    ]               |
|                                                          |
|                                                          |
|                                                          |
|                                                          |
+----------------------------------------------------------+
```

- Capsule is vertically centered, offset 10% upward from true center (visual center)
- No text. No navigation. No logo. No call-to-action.
- The capsule is the only element on screen
- Touch target: entire capsule area + 24px padding on all sides (minimum 328 x 148px)

#### The P2 Rule (Opening)

```
+----------------------------------------------------------+
|                                                          |
|           [polaroid]        [polaroid]                   |
|                   [polaroid]                             |
|        [LEFT HALF]    gap    [RIGHT HALF]                |
|              [polaroid]  [polaroid]                      |
|                                                          |
|                                                          |
+----------------------------------------------------------+
```

- Capsule splits horizontally into two halves
- Halves translate outward (left half left, right half right) by 40px each
- Polaroids emerge from the center gap, floating upward and outward
- Gold glow emanates from the center split point
- No UI controls visible during animation. The entire screen is the animation.

#### The P3 Rule (Manifesto)

```
+----------------------------------------------------------+
|                                                          |
|               [capsule small, closed]                    |
|                   --space-7--                            |
|       "Somos las historias que recordamos."              |
|       "Haz que las tuyas permanezcan."                   |
|                   --space-5--                            |
|       NUCLEA transforma tus recuerdos en                 |
|       legado. Una capsula digital...                     |
|                   --space-7--                            |
|              [ Continuar ]                               |
|                                                          |
+----------------------------------------------------------+
```

- Capsule returns to closed state, scaled to 60% (168 x 60px), positioned at top-third
- Tagline in Cormorant Garamond italic, centered
- Body text in Inter, centered, `max-w-[320px]`
- Button at bottom with `--space-7` clearance above

#### The P4 Rule (Selection)

```
+----------------------------------------------------------+
|   [hamburger]        NUCLEA         [space]              |
|                                                          |
|   "Elige tu capsula"                                     |
|                   --space-4--                            |
|   +------------------------------------------------+    |
|   | [icon]  Legacy Capsule                    [>]  |    |
|   +------------------------------------------------+    |
|   | [icon]  Together Capsule                  [>]  |    |
|   +------------------------------------------------+    |
|   | [icon]  Social Capsule                    [>]  |    |
|   +------------------------------------------------+    |
|   | [icon]  Pet Capsule                       [>]  |    |
|   +------------------------------------------------+    |
|   | [icon]  Life Chapter Capsule              [>]  |    |
|   +------------------------------------------------+    |
|   | [icon]  Origin Capsule                    [>]  |    |
|   +------------------------------------------------+    |
|                   --space-5--                            |
|   "Aqui guardas lo que no quieres perder"                |
+----------------------------------------------------------+
```

- Header appears for the first time: hamburger left, "NUCLEA" centered (Inter, 14px, weight 600, letter-spacing 2px)
- Cards are full-width within content area, stacked vertically, 12px gap
- Each card: 16px padding, white background, 1px border `#E5E5E5`, border-radius 12px
- Icon (48x48) left, text center, chevron right (`--text-muted`)
- First and last cards may have adjusted border-radius (16px top / 16px bottom) for grouped appearance
- Closing line in Cormorant Garamond italic, centered below cards

### 3.2 Visual Hierarchy Per Screen Type

| Screen | Primary Element | Secondary | Tertiary |
|--------|----------------|-----------|----------|
| P1 | Capsule object | (nothing) | (nothing) |
| P2 | Polaroid burst animation | Gold glow | Capsule halves |
| P3 | Tagline text | Body explanation | CTA button |
| P4 | Capsule type cards | Screen title | Closing tagline |
| Capsule Detail | Capsule image/illustration | Description text | CTA button |
| Creation Flow | Current step content | Progress indication | Navigation |
| Closure | Confirmation messaging | Capsule visualization | Action buttons |

### 3.3 Whitespace Ratios

| Context | Content-to-Whitespace Ratio | Notes |
|---------|----------------------------|-------|
| P1 (Capsule Closed) | 1:12 | The capsule is tiny relative to the screen. This is intentional. |
| P2 (Opening) | 1:4 | Polaroids spread but never fill more than 25% of screen area. |
| P3 (Manifesto) | 1:3 | Text is brief. Breathing room is generous. |
| P4 (Selection) | 1:1.5 | Most dense screen. Cards occupy space but margins remain generous. |
| Creation flow | 1:2 | Focused input areas with substantial margins. |

### 3.4 Glassmorphism Rules

Glassmorphism is used only for floating/overlay elements -- never for primary content containers.

```css
.glass-surface {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.74);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
```

**Permitted uses:** Modal overlays, toast notifications, floating action menus, tooltip containers.

**Forbidden uses:** Page backgrounds, card containers, headers, footers, buttons.

---

## 4. Motion Rules

### 4.1 Timing and Easing

#### Easing Curves

| Name | Value | Use |
|------|-------|-----|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Primary exit curve. Elements leaving or settling into place. |
| `--ease-in-out-expo` | `cubic-bezier(0.87, 0, 0.13, 1)` | Capsule opening/closing. Symmetrical dramatic motion. |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Polaroid emergence only. Slight overshoot for organic feel. |
| `--ease-subtle` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Hover states, focus rings. Barely perceptible transitions. |

#### Duration Scale

| Category | Duration | Framer Motion | Use |
|----------|----------|---------------|-----|
| Micro | 150ms | `duration: 0.15` | Hover states, focus rings, opacity on press |
| UI Transition | 300ms | `duration: 0.3` | Screen transitions (fade), card selections, button states |
| Modal/Overlay | 400ms | `duration: 0.4` | Sheet open/close, sidebar, glassmorphism reveal |
| Capsule Open | 800ms | `duration: 0.8` | Capsule splitting apart (P2) |
| Polaroid Float | 1200ms | `duration: 1.2` | Each polaroid's emergence trajectory (P2) |
| Polaroid Stagger | 150ms per item | `staggerChildren: 0.15` | Delay between successive polaroids appearing |
| Full P2 Sequence | 4000ms | Total scene duration | Capsule open + polaroids + glow + settle |

### 4.2 Animation Inventory

#### P1: Capsule Breathing

The capsule is not static. It has a slow, continuous "breathing" animation -- a subtle vertical oscillation and shadow pulse that communicates aliveness.

```typescript
// Framer Motion config
const capsuleBreathing = {
  animate: {
    y: [0, -4, 0],
    boxShadow: [
      '0 8px 32px rgba(0,0,0,0.12)',
      '0 12px 40px rgba(0,0,0,0.16)',
      '0 8px 32px rgba(0,0,0,0.12)',
    ],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}
```

- Vertical travel: 4px total (2px up, 2px down from rest). Never more.
- Shadow deepens slightly at peak. Returns to baseline.
- No horizontal movement. No rotation. No scale change.

#### P2: Capsule Opening Sequence

This is the most complex animation in the entire application. It must feel like unwrapping a gift.

**Phase 1 (0-300ms): Recognition.** A thin gold line appears at the capsule's horizontal center. Width grows from 0 to full capsule width. Opacity from 0 to 1.

**Phase 2 (300-800ms): Split.** Left and right capsule halves translate outward (40px each). Gold glow expands from the center crack. Background receives a very subtle warm radial gradient (barely perceptible).

**Phase 3 (600-1800ms): Emergence.** Polaroids emerge from center, each with:
- Initial position: center of former capsule
- Final position: distributed across screen area (predefined positions, NOT random)
- Scale: 0 to 1 with spring easing
- Rotation: 0 to final rotation (predefined per polaroid, range -15deg to +15deg)
- Opacity: 0 to 1
- Stagger: 150ms between each polaroid

**Phase 4 (1800-3500ms): Settle.** Polaroids reach final positions and begin gentle floating micro-animation (1px vertical, 0.5deg rotation, 6s cycle). Gold glow pulses once then fades to 40% intensity.

**Phase 5 (3500-4000ms): Transition.** Entire scene fades out (opacity 1 to 0, 500ms) while P3 fades in.

```typescript
// Framer Motion: Polaroid emergence
const polaroidVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    x: 0,
    y: 0,
    rotate: 0,
  },
  visible: (custom: { x: number; y: number; rotate: number }) => ({
    opacity: 1,
    scale: 1,
    x: custom.x,
    y: custom.y,
    rotate: custom.rotate,
    transition: {
      duration: 1.2,
      ease: [0.34, 1.56, 0.64, 1], // spring
    },
  }),
}
```

#### P3: Text Reveal

- Capsule (small) fades in: `opacity 0 to 1, y: -10 to 0, duration 0.6`
- Tagline fades in after 200ms delay: `opacity 0 to 1, duration 0.5`
- Body text fades in after 400ms delay: `opacity 0 to 1, duration 0.5`
- Button fades in after 600ms delay: `opacity 0 to 1, y: 8 to 0, duration 0.4`

```typescript
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}
```

#### P4: Card List

- Header slides down: `y: -20 to 0, opacity 0 to 1, duration 0.3`
- Cards stagger in from bottom: `y: 16 to 0, opacity 0 to 1, stagger 0.08, duration 0.3`
- No entrance animation on the tagline at bottom -- it is simply present when cards finish.

#### Screen Transitions

All screen-to-screen transitions use a simple crossfade:

```typescript
const screenTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' },
}
```

No slides. No zooms. No directional wipes. Fade only.

### 4.3 When NOT to Animate

| Context | Rule |
|---------|------|
| Text content changes | Never animate text morphing. Fade-replace only. |
| Form interactions | No animation on typing, field focus (except 150ms border color transition). |
| Error states | Instant appearance. No entrance animation for error messages. |
| Navigation (header) | No animation on hamburger, back arrow, or header text. They are immediately present. |
| Scrolling content | No parallax. No scroll-linked animations. Content scrolls normally. |
| Data loading | No skeleton shimmer animations. Use a single centered spinner (thin, 20px, `--text-muted`). |
| Subsequent visits | P1-P2 opening animation plays ONLY on first visit. Returning users go directly to P4 or dashboard. |

### 4.4 Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- All animations are replaced with instant state changes (opacity only, 150ms crossfade)
- Capsule breathing is disabled (capsule is static)
- P2 opening sequence is replaced with a single crossfade: capsule fades out, polaroids appear in final positions with a 300ms fade-in
- Stagger delays are removed; all elements appear simultaneously
- No spring easing (replace with linear)

```typescript
const shouldReduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const safeDuration = shouldReduceMotion ? 0.15 : 0.3
```

---

## 5. Icon and Illustration Rules

### 5.1 Icon Style

| Property | Value |
|----------|-------|
| Library | Lucide React |
| Stroke width | 1.5px |
| Corner style | Rounded (`strokeLinecap: "round"`, `strokeLinejoin: "round"`) |
| Default color | `--text-secondary` (#6B6B6B) |
| Active/selected color | `--text-primary` (#1A1A1A) |
| Default size | 24px (navigation), 48px (capsule type cards) |
| Touch target | Always 44px minimum, regardless of visual icon size |

### 5.2 Capsule Type Icons

| Capsule Type | Icon Description | Lucide Equivalent | Notes |
|-------------|-----------------|-------------------|-------|
| Legacy | Star with crown/laurel | `Crown` or custom | Symbolizes permanence and honor |
| Together | Two hearts intertwined | `HeartHandshake` | NOT a single heart. Two, connected. |
| Social | Chat bubble with dots | `MessageCircle` | Conversational, not broadcasting |
| Pet | Paw print | `PawPrint` | Simple, recognizable, warm |
| Life Chapter | Open book | `BookOpen` | Knowledge, narrative, chapters |
| Origin | Cradle / baby silhouette | `Baby` or custom | Tender, protective |

### 5.3 Structural Icons

| Use | Icon | Size |
|-----|------|------|
| Back navigation | `ChevronLeft` | 24px |
| Hamburger menu | `Menu` | 24px |
| Card chevron (right) | `ChevronRight` | 20px, color `--text-muted` |
| Close/dismiss | `X` | 24px |
| Upload photo | `Image` | 24px |
| Upload video | `Video` | 24px |
| Record audio | `Mic` | 24px |
| Write note | `PenLine` | 24px |
| Calendar | `Calendar` | 24px |
| Lock (custody) | `Lock` | 20px |

### 5.4 Icon Rules

1. **No filled icons.** Every icon is outline-only (stroke). No solid fills, no duotone.
2. **No decorative icons.** Every icon serves a functional purpose -- either navigation, identification, or action.
3. **No icon-only buttons without labels.** Exception: back arrow, hamburger menu, and close button (universally understood).
4. **No colored icons.** Icons are grayscale only. Exception: gold star/crown for EverLife premium badge (uses `--accent-gold`).
5. **No animated icons.** Icons do not spin, bounce, pulse, or transform. They are static.
6. **No emoji substitutes.** Never use emoji where an icon is expected.

### 5.5 Illustration Policy

NUCLEA does not use illustrations. The capsule 3D render / metallic gradient is the sole visual element. There are no:

- Character illustrations
- Abstract shape compositions
- Background patterns or textures
- Decorative SVG elements
- Hero images or stock photography
- 3D renders (except the capsule itself, which is CSS-rendered)

The Polaroid components serve as the illustrative layer -- they are containers for user-provided imagery, not decorative elements.

---

## 6. Accessibility Constraints

### 6.1 Color Contrast

| Pairing | Foreground | Background | Ratio | WCAG Level |
|---------|-----------|-----------|-------|------------|
| Primary text on white | `#1A1A1A` | `#FFFFFF` | 16.6:1 | AAA |
| Secondary text on white | `#6B6B6B` | `#FFFFFF` | 5.7:1 | AA (large), AA (normal) |
| Muted text on white | `#9A9A9A` | `#FFFFFF` | 3.0:1 | AA Large only |
| Primary text on secondary bg | `#1A1A1A` | `#FAFAFA` | 15.9:1 | AAA |
| Gold on white | `#D4AF37` | `#FFFFFF` | 2.5:1 | **FAIL** -- never use gold as text |
| Capsule text on capsule | `#4A4A4A` | `#C0C0C0` | 3.2:1 | AA Large only |
| Link blue on white | `#2563EB` | `#FFFFFF` | 4.6:1 | AA |

**Critical rule:** `--text-muted` (#9A9A9A) must only be used for non-essential information (hints, timestamps). It fails WCAG AA for normal text. All actionable or important text must use `--text-secondary` minimum.

**Gold text prohibition:** `--accent-gold` (#D4AF37) fails contrast on white backgrounds. Gold must never be used as text color. It is exclusively for: glows, thin borders, small filled badges (with white text on gold -- ratio 3.3:1, AA Large), and particle effects.

### 6.2 Touch Targets

| Element | Minimum Size | Recommended Size | Spacing Between |
|---------|-------------|-----------------|-----------------|
| Buttons | 44 x 44px | 48 x 48px | 8px minimum |
| Card tap targets | Full card width x 56px min height | Full card width x 64px | 12px (card gap) |
| Icon buttons | 44 x 44px (even if icon is 24px) | 48 x 48px | 8px minimum |
| Capsule (P1) | 328 x 148px (280 + 24px padding each side) | Full screen | N/A |
| Text links | 44px minimum height via padding | -- | Avoid inline links in mobile; prefer button-style links |

### 6.3 Focus States

```css
/* Visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
  border-radius: inherit;
}

/* Remove default focus for mouse/touch users */
:focus:not(:focus-visible) {
  outline: none;
}
```

- Focus ring color: `--accent-link` (#2563EB) -- not gold (insufficient contrast)
- Focus ring must be visible on all interactive elements
- Tab order follows visual layout (top to bottom, left to right)
- P1 capsule must be focusable and activatable via Enter/Space

### 6.4 Screen Reader

| Element | ARIA Treatment |
|---------|---------------|
| Capsule (P1) | `role="button"`, `aria-label="Abrir capsula de recuerdos"` |
| P2 animation | `aria-live="polite"` region announcing "Abriendo capsula..." |
| Polaroids | `aria-hidden="true"` (decorative during animation) |
| Capsule type cards | `role="listitem"` within `role="list"`, descriptive `aria-label` per card |
| Gold glow effects | `aria-hidden="true"` |
| Loading states | `aria-busy="true"`, `aria-live="assertive"` |

### 6.5 Reduced Motion (Summary)

Covered in section 4.4. To reiterate: all animations must have `prefers-reduced-motion` alternatives. The experience must be fully functional and emotionally coherent without any animation.

### 6.6 Text Scaling

- All font sizes defined in `px` must also function at 200% browser zoom
- Content must not overflow or become hidden at 200% zoom
- Minimum touch target sizes must be maintained at all zoom levels
- Test at: 100%, 150%, 200%

---

## 7. Implementation Notes for Engineering

### 7.1 CSS Custom Properties

Define these in `:root` of `globals.css`:

```css
:root {
  /* Backgrounds */
  --bg-primary: #FFFFFF;
  --bg-secondary: #FAFAFA;
  --bg-overlay: rgba(0, 0, 0, 0.02);

  /* Text */
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --text-muted: #9A9A9A;

  /* Capsule */
  --capsule-gradient: linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%);
  --capsule-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  --capsule-highlight: rgba(255, 255, 255, 0.6);
  --capsule-text: #4A4A4A;

  /* Accents */
  --accent-gold: #D4AF37;
  --accent-gold-glow: rgba(212, 175, 55, 0.15);
  --accent-gold-particle: rgba(212, 175, 55, 0.4);
  --accent-link: #2563EB;

  /* Semantic */
  --success: #22C55E;
  --error: #EF4444;
  --warning: #F59E0B;

  /* Borders */
  --border-default: #E5E5E5;
  --border-button: #1A1A1A;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  /* Easing */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-subtle: cubic-bezier(0.25, 0.1, 0.25, 1);

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
}
```

### 7.2 Tailwind Configuration

The POC app's `tailwind.config.ts` should match this token system. Reference config:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'nuclea-bg': '#FFFFFF',
        'nuclea-secondary': '#FAFAFA',
        'nuclea-text': '#1A1A1A',
        'nuclea-text-secondary': '#6B6B6B',
        'nuclea-text-muted': '#9A9A9A',
        'nuclea-gold': '#D4AF37',
        'nuclea-gold-glow': 'rgba(212, 175, 55, 0.15)',
        'nuclea-border': '#E5E5E5',
        'nuclea-link': '#2563EB',
        'nuclea-success': '#22C55E',
        'nuclea-error': '#EF4444',
        'nuclea-warning': '#F59E0B',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        'display': ['36px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '300' }],
        'tagline': ['20px', { lineHeight: '1.4', fontWeight: '400' }],
        'h1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '400' }],
        'button': ['16px', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '500' }],
        'overline': ['11px', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      borderRadius: {
        'capsule': '50px',
        'card': '12px',
        'card-grouped-top': '16px 16px 12px 12px',
        'card-grouped-bottom': '12px 12px 16px 16px',
        'button': '8px',
        'glass': '28px',
        'polaroid': '2px',
      },
      boxShadow: {
        'capsule': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'capsule-hover': '0 12px 40px rgba(0, 0, 0, 0.16)',
        'polaroid': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'gold-glow': '0 0 24px rgba(212, 175, 55, 0.2)',
        'gold-glow-intense': '0 0 48px rgba(212, 175, 55, 0.4)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      maxWidth: {
        'content': '480px',
        'text': '540px',
        'card-list': '400px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'micro': '150ms',
        'ui': '300ms',
        'modal': '400ms',
        'capsule': '800ms',
        'polaroid': '1200ms',
      },
      animation: {
        'capsule-breathe': 'capsule-breathe 3s ease-in-out infinite',
        'gold-pulse': 'gold-pulse 3s ease-in-out infinite',
        'polaroid-float': 'polaroid-float 6s ease-in-out infinite',
      },
      keyframes: {
        'capsule-breathe': {
          '0%, 100%': {
            transform: 'translateY(0)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
          '50%': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.16)',
          },
        },
        'gold-pulse': {
          '0%, 100%': { boxShadow: '0 0 24px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 48px rgba(212, 175, 55, 0.4)' },
        },
        'polaroid-float': {
          '0%, 100%': {
            transform: 'translateY(0) rotate(var(--polaroid-rotation, 0deg))',
          },
          '50%': {
            transform: 'translateY(-3px) rotate(calc(var(--polaroid-rotation, 0deg) + 0.5deg))',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### 7.3 Framer Motion Presets

Create a shared motion config file at `src/lib/motion.ts`:

```typescript
import { Variants, Transition } from 'framer-motion'

// --- Transition Presets ---

export const transitions = {
  micro: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] } as Transition,
  ui: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } as Transition,
  modal: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } as Transition,
  capsuleOpen: { duration: 0.8, ease: [0.87, 0, 0.13, 1] } as Transition,
  polaroidSpring: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1] } as Transition,
}

// --- Variant Presets ---

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.ui },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

export const cardStagger: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
}

export const cardListContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

// --- Screen Transition ---

export const screenTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
}

// --- Capsule Breathing ---

export const capsuleBreathing = {
  animate: {
    y: [0, -4, 0],
    boxShadow: [
      '0 8px 32px rgba(0,0,0,0.12)',
      '0 12px 40px rgba(0,0,0,0.16)',
      '0 8px 32px rgba(0,0,0,0.12)',
    ],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
}

// --- Polaroid Emergence (P2) ---

export const polaroidVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    x: 0,
    y: 0,
    rotate: 0,
  },
  visible: (custom: { x: number; y: number; rotate: number; delay?: number }) => ({
    opacity: 1,
    scale: 1,
    x: custom.x,
    y: custom.y,
    rotate: custom.rotate,
    transition: {
      duration: 1.2,
      ease: [0.34, 1.56, 0.64, 1],
      delay: custom.delay ?? 0,
    },
  }),
}

// --- Reduced Motion Helper ---

export const getReducedMotionVariant = (shouldReduce: boolean) =>
  shouldReduce
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
      }
    : undefined
```

### 7.4 Component CSS Patterns

#### Primary Button

```tsx
// Tailwind classes
className="
  w-full max-w-[320px]
  bg-transparent
  border-[1.5px] border-nuclea-text
  rounded-button
  px-8 py-4
  text-button text-nuclea-text
  transition-all duration-micro
  hover:bg-nuclea-text hover:text-white
  focus-visible:outline-2 focus-visible:outline-nuclea-link focus-visible:outline-offset-2
  active:scale-[0.98]
"
```

#### Selection Card

```tsx
className="
  flex items-center
  w-full
  p-4
  bg-nuclea-bg
  border border-nuclea-border
  rounded-card
  transition-colors duration-micro
  hover:bg-nuclea-secondary
  focus-visible:outline-2 focus-visible:outline-nuclea-link focus-visible:outline-offset-2
  cursor-pointer
"
```

#### Glass Surface

```tsx
className="
  bg-white/[0.78]
  backdrop-blur-sm
  rounded-glass
  border border-white/[0.74]
  shadow-glass
"
```

#### Capsule Component

```tsx
className="
  w-[280px] h-[100px]
  rounded-capsule
  shadow-capsule
  relative
  cursor-pointer
"
// Apply gradient via inline style or custom CSS class:
// background: linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)
```

#### Polaroid Component

```tsx
className="
  bg-white
  rounded-polaroid
  shadow-polaroid
  p-2 pb-6
  w-[80px] sm:w-[100px] md:w-[120px]
"
// Rotation via inline style: transform: rotate(${rotation}deg)
// CSS variable: style={{ '--polaroid-rotation': `${rotation}deg` }}
```

### 7.5 Font Loading (Next.js)

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
})

// Cormorant Garamond from Google Fonts
import { Cormorant_Garamond } from 'next/font/google'
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400'],
  style: ['normal', 'italic'],
})

// In the body tag:
// <body className={`${inter.variable} ${cormorant.variable} font-sans`}>
```

### 7.6 Responsive Breakpoints

Use Tailwind's default breakpoints. No custom breakpoints needed.

| Breakpoint | Tailwind Prefix | Width | Primary Target |
|-----------|----------------|-------|----------------|
| Default (mobile) | (none) | < 640px | iPhone SE, small Android |
| `sm` | `sm:` | >= 640px | Large phones (landscape, iPhone Pro Max) |
| `md` | `md:` | >= 768px | Tablets |
| `lg` | `lg:` | >= 1024px | Desktop |

**Critical:** Do not create `xl` or `2xl` breakpoints. Desktop is the widest target. Content remains at `max-w-content` (480px) centered.

### 7.7 File Structure for Design Tokens

```
src/
  lib/
    motion.ts           # Framer Motion presets (section 7.3)
  styles/
    globals.css         # CSS custom properties (section 7.1)
  components/
    ui/
      Button.tsx        # Primary/secondary button variants
      Card.tsx          # Selection card component
      GlassSurface.tsx  # Glassmorphism wrapper
    capsule/
      CapsuleClosed.tsx       # Static capsule with breathing animation
      CapsuleOpening.tsx      # P2 split + polaroid emergence
      PolaroidCard.tsx        # Individual polaroid with rotation
    icons/
      CapsuleTypeIcon.tsx     # Icon picker by capsule type
```

### 7.8 Production vs. POC Alignment

| Concern | POC (port 3001) | Production (port 3000) | Resolution |
|---------|-----------------|----------------------|------------|
| Background | `#FFFFFF` | `#0D0D12` (dark) | POC is canonical. Production will migrate to white theme. |
| Body font | Inter | DM Sans | POC is canonical. Inter is the final choice. |
| React version | 19 | 18 | Independent concern. No visual impact. |
| Capsule types | 6 | 5 | POC is canonical (6 types). |
| State management | useState | Zustand | No visual impact. |

**The POC's white theme is the target visual direction.** The production app's dark theme (`#0D0D12`) is a pre-existing artifact from early development and will be migrated.

---

## Appendix A: Quick-Reference Cheat Sheet

### Do / Do Not

| DO | DO NOT |
|----|--------|
| Use `#FFFFFF` as background | Use any shade of gray, cream, or dark as background |
| Use `#1A1A1A` for headings | Use pure `#000000` |
| Use gold for glows and particles | Use gold as text, button fill, or background |
| Animate with fade and spring | Animate with slides, zooms, or bounces |
| Leave generous whitespace | Fill every pixel with content |
| Use Inter for all functional text | Use Cormorant Garamond for buttons, labels, or body |
| Keep buttons transparent with borders | Fill buttons with color |
| Render capsule with CSS gradient | Use 3D render images or stock photos |
| Let P1 be only the capsule | Add logos, text, or CTAs to P1 |
| Test at 200% zoom | Assume fixed viewport |
| Provide `prefers-reduced-motion` fallbacks | Require animation for core functionality |

### Token Quick Map

```
Background:  bg-nuclea-bg (#FFF)
Card bg:     bg-nuclea-secondary (#FAFAFA)
Heading:     text-nuclea-text (#1A1A1A)
Body:        text-nuclea-text-secondary (#6B6B6B)
Hint:        text-nuclea-text-muted (#9A9A9A)
Gold:        nuclea-gold (#D4AF37)
Border:      border-nuclea-border (#E5E5E5)
Link:        text-nuclea-link (#2563EB)
```

---

## Appendix B: Polaroid Position Map (P2)

Predefined positions for the 5 polaroids that emerge during the capsule opening sequence. These are NOT randomized -- they are art-directed for visual balance.

| Polaroid | Final X (from center) | Final Y (from center) | Rotation | Size |
|----------|----------------------|----------------------|----------|------|
| 1 (top-left) | -90px | -110px | -12deg | 90px |
| 2 (top-right) | +70px | -80px | +8deg | 80px |
| 3 (center-left) | -60px | +10px | -5deg | 100px |
| 4 (center-right) | +100px | +30px | +14deg | 85px |
| 5 (bottom-center) | +10px | +90px | -3deg | 95px |

Stagger: 150ms between each. Order: 3, 1, 5, 2, 4 (center first, then alternating outward for visual balance).

---

## Appendix C: Capsule Closure Ceremony (Future Screens)

When capsule creation and closure flows are implemented, the visual direction extends:

### Creation (Ritual and Care)

- Each memory addition (photo, video, audio, note) is visualized as a small object being placed into the capsule
- The capsule interior glows faintly warmer with each addition (gold opacity increases from 0.05 to 0.15 over many items)
- Calendar view uses dots (not filled squares) to mark days with content -- `4px` circles, `--text-secondary` color
- Upload interactions use a single-line progress bar: `2px` height, `--text-muted` track, `--text-primary` fill

### Closure (Finality and Peace)

- The split capsule halves slowly close together (reverse of P2 opening, but slower: 1200ms)
- Gold line at seam pulses once, then fades
- A brief pause (800ms of stillness)
- Text appears: "Tu capsula esta sellada" in Cormorant Garamond italic, fade-in 500ms
- The closed capsule descends slightly (8px) and its shadow deepens -- it has "settled" with weight
- Download CTA appears after 1000ms delay -- the user must sit with the moment before being given an action

---

*Document generated: 2026-02-07*
*Visual direction compliant with: DESIGN_SYSTEM.md v1, USER_FLOWS.md v1, CAPSULE_TYPES.md v1*
*Target implementation: POC_INTERNA/app (port 3001, white theme)*
