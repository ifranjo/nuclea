# NUCLEA Design System v1.0

**Extracted from:** `DISEÑO_ANDREA_PANTALLAS/NUCLEA_INICIO.pdf` (verified Feb 2026)
**Status:** SOURCE OF TRUTH - Override any assumptions

---

## Color Palette

### Primary Colors

| Token | Hex | Usage | Component |
|-------|-----|-------|-----------|
| `--nuclea-black` | `#000000` | Background (main) | All pages |
| `--nuclea-gold` | `#D4AF37` | Accent, CTAs, borders | Buttons, highlights |
| `--nuclea-white` | `#FFFFFF` | Text primary | Headings, body |
| `--nuclea-gray-light` | `#CCCCCC` | Text secondary | Subtitles |
| `--nuclea-gray-dark` | `#1A1A1A` | Cards, surfaces | Capsule cards |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | TBD | Form success |
| `--color-error` | TBD | Form errors |
| `--color-warning` | TBD | Warnings |

---

## Typography

### Font Families

```css
--font-display: 'Cormorant Garamond', serif;  /* Títulos, headings */
--font-body: 'Inter', sans-serif;              /* Cuerpo de texto */
```

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 64px | 300 | 1.2 | "NUCLEA" hero |
| H2 | 48px | 400 | 1.3 | Page titles |
| H3 | 32px | 500 | 1.4 | Section headers |
| Body | 16px | 400 | 1.6 | Content |
| Small | 14px | 400 | 1.5 | Labels, metadata |
| Caption | 12px | 400 | 1.4 | Fine print |

### Typography Examples from PDF

```
NUCLEA                          # Cormorant Garamond, 64px, Light (#D4AF37)
Somos las historias que...      # Inter, 24px, Regular (#FFFFFF)
Comenzar                        # Inter, 16px, Medium, Bg: #D4AF37
```

---

## Components

### 1. Primary Button (CTA)

```css
.btn-primary {
  background: #D4AF37;
  color: #000000;
  border: none;
  padding: 14px 32px;
  border-radius: 4px;
  font: 16px Medium;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #E5C157;
  transform: translateY(-1px);
}
```

**Variants:**
- `.btn-secondary` - Outline gold, transparent bg
- `.btn-ghost` - Transparent, gold border

### 2. Capsule Card (Grid)

```css
.capsule-card {
  background: #1A1A1A;
  border: 1px solid #333333;
  border-radius: 8px;
  padding: 24px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.capsule-card:hover {
  border-color: #D4AF37;
  background: #252525;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
}
```

### 3. Input Fields

```css
.input-field {
  background: #1A1A1A;
  border: 1px solid #333333;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 4px;
  font: 16px Regular;
}

.input-field:focus {
  outline: none;
  border-color: #D4AF37;
}
```

---

## Layout

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

### Grid System

| Breakpoint | Width | Columns | Gap |
|------------|-------|---------|-----|
| Mobile | < 768px | 1 | 16px |
| Tablet | 768px - 1024px | 2 | 24px |
| Desktop | > 1024px | 3 | 32px |

---

## Spacing Scale

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

---

## Animations

```css
/* Easing */
--ease-out: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);

/* Durations */
--duration-fast: 150ms;
--duration-base: 250ms;
--duration-slow: 350ms;
```

---

## Iconography

- **Style:** Line icons, 2px stroke
- **Color:** #D4AF37 (gold) or #CCCCCC (gray)
- **Size:** 24px default, 16px small, 32px large

---

## Page-Specific Layouts

### Landing Page (NUCLEA_INICIO.pdf)

1. **Hero Section**
   - Centered content
   - "NUCLEA" title (64px, Cormorant Garamond, gold)
   - Tagline subtitle (24px, Inter, white)
   - "Comenzar" CTA button

2. **Capsule Selection**
   - Grid of 6 capsule cards
   - Each card: icon + label + description
   - Hover state with gold border

### Registration Flow (NUCLEA_REGISTRO.pdf)

1. Step indicator
2. Form with input fields
3. "Continuar" button (right aligned)
4. Back link (left aligned)

---

## Dark Mode

**Note:** NUCLEA is dark-first. No light mode planned for MVP.

---

## Accessibility

- WCAG AA contrast ratio: All gold-on-black passes
- Focus states: 2px gold outline
- Touch targets: Minimum 44x44px

---

## Tokens for Implementation

```css
:root {
  /* Colors */
  --color-bg: #000000;
  --color-surface: #1A1A1A;
  --color-accent: #D4AF37;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #CCCCCC;
  --color-border: #333333;

  /* Typography */
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Animation */
  --ease-smooth: cubic-bezier(0.215, 0.61, 0.355, 1);
  --duration-base: 250ms;
}
```

---

## Dev Notes

1. **Google Fonts needed:**
   - Cormorant Garamond (weights: 300, 400, 500, 600)
   - Inter (weights: 400, 500, 600)

2. **Tailwind config should extend:**
   ```js
   colors: {
     nuclea: {
       black: '#000000',
       gold: '#D4AF37',
       gray: {
         light: '#CCCCCC',
       },
       surface: '#1A1A1A',
     }
   },
   fontFamily: {
     display: ['Cormorant Garamond', 'serif'],
     sans: ['Inter', 'sans-serif'],
   }
   ```

3. **Component library priority:**
   - shadcn/ui (with custom theme)
   - Framer Motion for animations
   - React Hook Form + Zod for forms

---

*Extracted by: Claude (Supervisor Agent) - Feb 2026*
*Source: DISEÑO_ANDREA_PANTALLAS/NUCLEA_INICIO.pdf*
