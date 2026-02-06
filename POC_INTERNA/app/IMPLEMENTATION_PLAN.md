# POC Interna - Onboarding Flow Implementation Plan

## Overview

New Next.js app at `POC_INTERNA/app/` — **WHITE theme** (not the dark theme from PREREUNION_ANDREA). 4 onboarding screens + generic capsule selection. No complex animations — CSS placeholders + detailed image generation prompts.

**Port**: 3001 (separate from PREREUNION_ANDREA on 3000)

---

## Phase 1: Project Configuration (5 files)

### 1.1 `package.json`

```json
{
  "name": "nuclea-poc-interna",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**Why these deps**: Minimal — only Next.js, React, Framer Motion (fade transitions only), Lucide (icons). No state management, no backend, no validation.

### 1.2 `next.config.js`

Minimal config. No image remotePatterns needed (no external images). No env vars.

### 1.3 `tsconfig.json`

Standard Next.js config with `@/*` → `./src/*` path alias (same pattern as PREREUNION_ANDREA).

### 1.4 `postcss.config.js`

Standard Tailwind + Autoprefixer.

### 1.5 `tailwind.config.ts`

**WHITE palette** (sourced from `DESIGN_SYSTEM.md`):

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#FFFFFF` | Main background |
| `bg-secondary` | `#FAFAFA` | Cards |
| `text-primary` | `#1A1A1A` | Headings |
| `text-secondary` | `#6B6B6B` | Descriptions |
| `text-muted` | `#9A9A9A` | Hints |
| `gold` | `#D4AF37` | Premium only |

Fonts:
- `sans` → Inter (body)
- `display` → Cormorant Garamond (taglines, italic)

Extends Tailwind with custom spacing based on 8px grid.

---

## Phase 2: Global Styles + Layout (2 files)

### 2.1 `src/app/globals.css`

CSS custom properties from DESIGN_SYSTEM.md:

```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #FAFAFA;
  --bg-overlay: rgba(0,0,0,0.02);
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --text-muted: #9A9A9A;
  --capsule-shadow: rgba(0,0,0,0.15);
  --capsule-highlight: rgba(255,255,255,0.6);
  --accent-gold: #D4AF37;
  --accent-link: #2563EB;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
}
```

Plus Tailwind directives, focus-visible styles, and `.tagline` utility class.

### 2.2 `src/app/layout.tsx`

- Fonts: **Inter** (body, weights 400-600) + **Cormorant Garamond** (display, italic)
- Pattern from PREREUNION_ANDREA layout but using `Inter` instead of `DM_Sans`
- `themeColor: '#FFFFFF'` (white, not dark)
- `lang="es"`
- No Toaster, no skip-link (pure POC)
- Metadata: "NUCLEA - POC Interna"

---

## Phase 3: Types (1 file)

### 3.1 `src/types/index.ts`

```typescript
// 6 capsule types (DESIGN_SYSTEM.md + CAPSULE_TYPES.md)
// Note: PREREUNION_ANDREA uses 'everlife', we use 'legacy' (spec name)
export type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life-chapter' | 'origin'

export type OnboardingStep = 1 | 2 | 3 | 4

export interface CapsuleTypeInfo {
  id: CapsuleType
  name: string
  tagline: string       // Short line from CAPSULE_TYPES.md
  description: string   // Longer text
  icon: string          // Lucide icon name reference
}
```

**CAPSULE_TYPES constant** — exact copy from `CAPSULE_TYPES.md`:

| Type | Name | Tagline (for card) |
|------|------|-------------------|
| `legacy` | Legacy Capsule | "Para que tu historia siga presente." |
| `together` | Together Capsule | "Una cápsula creada para parejas." |
| `social` | Social Capsule | "Momentos que compartimos con amigos." |
| `pet` | Pet Capsule | "Momentos que compartimos con nuestras mascotas." |
| `life-chapter` | Life Chapter Capsule | "Para guardar etapas de tu vida." |
| `origin` | Origin Capsule | "Una cápsula creada por padres para guardar la historia de sus hijos." |

---

## Phase 4: Base Components (6 files)

### 4.1 `src/components/capsule/CapsulePlaceholder.tsx`

CSS-only capsule (no images). Two sizes:

| Size | Width | Height | Border-radius |
|------|-------|--------|---------------|
| `md` (default) | 280px | 100px | 50px |
| `sm` | 160px | 56px | 28px |

- Gradient: `linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)`
- Shadow: `0 8px 32px rgba(0,0,0,0.12)` (from DESIGN_SYSTEM.md)
- "NUCLEA" text: Inter 14px/600, color #4A4A4A, letter-spacing 2px, right side
- Responsive: Mobile 240px width / Desktop 320px width (DESIGN_SYSTEM.md responsive table)

### 4.2 `src/components/capsule/PolaroidPlaceholder.tsx`

CSS-only polaroid frame. Props: `size` (80-120px), `rotation` (-15 to +15deg).

- White border: 8px sides, 8px top, 24px bottom (DESIGN_SYSTEM.md)
- Inner area: light gray (#F0F0F0) placeholder
- Shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Border-radius: 2px

### 4.3 `src/components/ui/Button.tsx`

From DESIGN_SYSTEM.md `.btn-primary`:

```
- Background: transparent
- Border: 1.5px solid #1A1A1A
- Border-radius: 8px
- Padding: 16px 32px
- Font: 16px/500
- Width: 100%, max-width 320px
- Hover: bg #1A1A1A, color white
- Transition: 0.2s ease
```

Props: `children`, `onClick`, `className`.

### 4.4 `src/components/ui/Header.tsx`

Only shown on P4. Contains:
- Left: hamburger icon (Menu from lucide) — decorative, no action
- Center: "NUCLEA" text — Inter, 16px, font-weight 600, letter-spacing 3px
- Flex layout, padding 16px 24px

### 4.5 `src/components/icons/CapsuleIcons.tsx`

Maps CapsuleType → Lucide icon (from DESIGN_SYSTEM.md icon table):

| Type | Lucide Icon | Reason |
|------|-------------|--------|
| `legacy` | `Star` (or `Crown`) | "Estrella con corona" → Star is closest |
| `together` | `HeartHandshake` | "Dos corazones entrelazados" |
| `social` | `MessageCircle` | "Globo de chat con puntos" |
| `pet` | `PawPrint` | "Huella de pata" |
| `life-chapter` | `BookOpen` | "Libro abierto" |
| `origin` | `Baby` | "Cuna / bebé" |

All icons: stroke 1.5px, color `--text-secondary` (#6B6B6B), no fill.

### 4.6 `src/components/ui/CapsuleTypeCard.tsx`

From DESIGN_SYSTEM.md `.selection-card`:

```
- Display: flex, align-items center
- Padding: 16px
- Background: #FFFFFF
- Border: 1px solid #E5E5E5
- Border-radius: 12px
- Margin-bottom: 12px
```

Structure: `[Icon 48x48] [Name + Tagline] [ChevronRight]`

- Icon area: 48x48px, margin-right 16px
- Name: Inter 18px/500 (H3 from type scale)
- Tagline: Inter 14px/400, color text-secondary
- Chevron: color text-muted

Props: `capsuleType: CapsuleTypeInfo`, `onClick`.

---

## Phase 5: Onboarding Screens (4 files)

### 5.1 `src/components/onboarding/P1CapsuleClosed.tsx`

**Source**: USER_FLOWS.md P1 + DESIGN_SYSTEM.md

Visual:
- Full white screen, capsule dead center (flex center)
- CapsulePlaceholder size="md"
- No text, no UI chrome
- Subtle pulse animation on capsule (CSS `@keyframes` — gentle scale 1.0→1.02, opacity shimmer on highlight)

Interaction:
- Entire screen is clickable → calls `onNext()`
- `role="button"`, `tabIndex={0}`, `aria-label="Toca para abrir la cápsula"`
- Keyboard: Enter/Space triggers advance
- `cursor-pointer`

### 5.2 `src/components/onboarding/P2CapsuleOpening.tsx`

**Source**: USER_FLOWS.md P2 (this is a PLACEHOLDER — real animation is future)

Visual:
- Center: gray placeholder div 320x320px, bg #F5F5F5, rounded-2xl
- Inside placeholder: text "Animación de apertura" (text-muted, centered)
- 5-6 PolaroidPlaceholder components scattered around the placeholder div
  - Fixed positions (absolute positioning within relative container)
  - Varied sizes: 80px, 100px, 90px, 110px, 85px, 95px
  - Varied rotations: -12deg, 8deg, -5deg, 15deg, -8deg, 3deg
- Progress bar at bottom: 4s CSS animation (width 0%→100%, bg #1A1A1A, height 2px)

Behavior:
- `useEffect` with `setTimeout(onNext, 4000)` — auto-advances after 4s
- Cleanup on unmount
- No user interaction needed

### 5.3 `src/components/onboarding/P3Manifesto.tsx`

**Source**: USER_FLOWS.md P3 + CAPSULE_TYPES.md (manifiesto copy)

Layout (top to bottom, centered, max-width 480px):
1. **CapsulePlaceholder** size="sm" (160x56px) — top section, margin-bottom 48px
2. **Tagline line 1**: "Somos las historias que recordamos."
   - Cormorant Garamond, italic, 20px, text-secondary
3. **Tagline line 2**: "Haz que las tuyas permanezcan."
   - Same style, margin-bottom 32px
4. **Manifesto paragraph**:
   - "NUCLEA transforma tus recuerdos en legado. Un espacio íntimo donde guardar lo que importa: fotos, vídeos, mensajes y momentos que merecen perdurar."
   - Inter, 16px, text-secondary, line-height 1.5, text-center
   - Margin-bottom 48px
5. **Button**: "Continuar" → calls `onNext()`

### 5.4 `src/components/onboarding/P4CapsuleSelection.tsx`

**Source**: USER_FLOWS.md P4 + CAPSULE_TYPES.md

Layout:
1. **Header** component (hamburger + "NUCLEA")
2. **Content** (padding 24px horizontal):
   - "Elige tu cápsula" — Inter 28px/600, text-primary, text-center, margin-bottom 8px
   - "Aquí guardas lo que no quieres perder" — Inter 14px/400, text-muted, text-center, margin-bottom 32px
   - 6x **CapsuleTypeCard** — in order: Legacy, Life Chapter, Together, Social, Pet, Origin
   - Each card onClick → `console.log('Selected:', capsuleType.id)` (future: navigate to detail)

---

## Phase 6: Orchestrator + Routing (3 files)

### 6.1 `src/app/onboarding/layout.tsx`

Full-screen layout wrapper:
- `min-h-screen`, `bg-white`
- No header, no footer, no chrome
- Just `{children}`

### 6.2 `src/app/onboarding/page.tsx`

State machine orchestrator:

```typescript
'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
// import P1, P2, P3, P4

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(1)
  const next = () => setStep(prev => Math.min(prev + 1, 4) as OnboardingStep)

  return (
    <AnimatePresence mode="wait">
      {step === 1 && <motion.div key="p1" {...fadeVariants}><P1 onNext={next} /></motion.div>}
      {step === 2 && <motion.div key="p2" {...fadeVariants}><P2 onNext={next} /></motion.div>}
      {step === 3 && <motion.div key="p3" {...fadeVariants}><P3 onNext={next} /></motion.div>}
      {step === 4 && <motion.div key="p4" {...fadeVariants}><P4 /></motion.div>}
    </AnimatePresence>
  )
}
```

Navigation: `P1 → tap → P2 → auto 4s → P3 → tap → P4 → tap card → console.log`

All within `/onboarding` — no URL changes between P1-P4.

### 6.3 `src/app/page.tsx`

Redirect to `/onboarding`:

```typescript
import { redirect } from 'next/navigation'
export default function Home() {
  redirect('/onboarding')
}
```

---

## Phase 7: Image Generation Prompts (5 files)

### 7.1 `prompts/README.md`

Index of all prompt files + instructions on how to use them with Midjourney v6, DALL-E 3, etc.

### 7.2 `prompts/P1_CAPSULE_CLOSED.md`

Detailed prompt for generating the closed capsule hero image:
- Visual description: brushed silver pill shape, "NUCLEA" engraved, white void, studio lighting
- Midjourney v6 prompt with `--v 6 --s 250 --q 2 --ar 9:16`
- DALL-E 3 alternative prompt
- Negative prompt (no neon, colorful, dark, gradient...)
- Required aspect ratios: 9:16 (mobile), 16:9 (desktop), 1:1 (square)
- Integration notes: replace CapsulePlaceholder with `<Image>` tag

### 7.3 `prompts/P2_CAPSULE_OPENING.md`

Prompt for the capsule opening animation frame/video:
- Capsule splitting horizontally, warm golden light, polaroids emerging
- Based on existing VIDEO_GENERATION.md Prompt 1
- Runway Gen-3 + Luma prompts
- Frame sequence for CSS animation fallback

### 7.4 `prompts/P2_POLAROIDS_FLOATING.md`

Prompt for polaroid placeholder images:
- Warm family moments (abstract, no faces)
- Based on IMAGE_GENERATION.md Prompt 3
- 6 individual polaroid images needed
- Each with different warm tone/feeling

### 7.5 `prompts/CAPSULE_ICONS.md`

Prompts for 6 capsule type icons:
- Based on IMAGE_GENERATION.md Prompt 4
- Line icon style, thin stroke, black on white
- Each type with specific visual symbol
- 1:1 aspect ratio, SVG-friendly output

---

## File Creation Order (19 steps)

| # | File | Phase |
|---|------|-------|
| 1 | `package.json` | Config |
| 2 | `next.config.js` | Config |
| 3 | `tsconfig.json` | Config |
| 4 | `postcss.config.js` | Config |
| 5 | `tailwind.config.ts` | Config |
| 6 | `src/app/globals.css` | Styles |
| 7 | `src/app/layout.tsx` | Layout |
| 8 | `src/types/index.ts` | Types |
| 9 | `src/components/capsule/CapsulePlaceholder.tsx` | Component |
| 10 | `src/components/capsule/PolaroidPlaceholder.tsx` | Component |
| 11 | `src/components/ui/Button.tsx` | Component |
| 12 | `src/components/icons/CapsuleIcons.tsx` | Component |
| 13 | `src/components/ui/Header.tsx` | Component |
| 14 | `src/components/ui/CapsuleTypeCard.tsx` | Component |
| 15 | `src/components/onboarding/P1CapsuleClosed.tsx` | Screen |
| 16 | `src/components/onboarding/P2CapsuleOpening.tsx` | Screen |
| 17 | `src/components/onboarding/P3Manifesto.tsx` | Screen |
| 18 | `src/components/onboarding/P4CapsuleSelection.tsx` | Screen |
| 19 | `src/app/onboarding/layout.tsx` | Route |
| 20 | `src/app/onboarding/page.tsx` | Route |
| 21 | `src/app/page.tsx` | Route |
| 22 | `prompts/README.md` | Prompts |
| 23 | `prompts/P1_CAPSULE_CLOSED.md` | Prompts |
| 24 | `prompts/P2_CAPSULE_OPENING.md` | Prompts |
| 25 | `prompts/P2_POLAROIDS_FLOATING.md` | Prompts |
| 26 | `prompts/CAPSULE_ICONS.md` | Prompts |

**After all files created**: `npm install` → `npm run dev` → verify on localhost:3001

---

## Exact Copy Text (Spanish)

All user-facing text in the app:

| Screen | Element | Text |
|--------|---------|------|
| P1 | aria-label | "Toca para abrir la cápsula" |
| P2 | placeholder | "Animación de apertura" |
| P3 | tagline 1 | "Somos las historias que recordamos." |
| P3 | tagline 2 | "Haz que las tuyas permanezcan." |
| P3 | manifesto | "NUCLEA transforma tus recuerdos en legado. Un espacio íntimo donde guardar lo que importa: fotos, vídeos, mensajes y momentos que merecen perdurar." |
| P3 | button | "Continuar" |
| P4 | title | "Elige tu cápsula" |
| P4 | subtitle | "Aquí guardas lo que no quieres perder" |
| P4 | header | "NUCLEA" |
| Card | Legacy | "Para que tu historia siga presente." |
| Card | Life Chapter | "Para guardar etapas de tu vida." |
| Card | Together | "Una cápsula creada para parejas." |
| Card | Social | "Momentos que compartimos con amigos." |
| Card | Pet | "Momentos que compartimos con nuestras mascotas." |
| Card | Origin | "Una cápsula creada por padres para sus hijos." |

---

## Responsive Breakpoints

From DESIGN_SYSTEM.md:

| Breakpoint | Width | Adaptations |
|------------|-------|-------------|
| sm | 375px | iPhone SE — capsule 240px |
| md | 428px | iPhone 14 Pro Max |
| lg | 768px | Tablet |
| xl | 1024px | Desktop — capsule 320px, content max-width 480px |

---

## Verification Checklist

1. `npm install` completes without errors
2. `npm run dev` starts on port 3001
3. `http://localhost:3001` redirects to `/onboarding`
4. P1: white screen, centered capsule, tap advances
5. P2: placeholder + polaroids + 4s progress bar, auto-advances
6. P3: small capsule + manifesto + "Continuar" button
7. P4: header + 6 capsule type cards, tap logs to console
8. Responsive: test at 375px, 428px, 768px, 1024px
9. Keyboard: Tab navigates all interactive elements
10. No console errors, no TypeScript errors

---

## What This POC Does NOT Include

- No backend/API calls
- No authentication
- No real images (CSS placeholders only)
- No complex animations (just 300ms fade transitions)
- No capsule detail screen (P4 → console.log only)
- No state management library
- No testing framework
- No dark mode
