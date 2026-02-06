# NUCLEA Design System

**Source:** DISEÑO_ANDREA_PANTALLAS/*.pdf

## Brand Identity

### Tagline
> "Somos las historias que recordamos. Haz que las tuyas permanezcan."

### Tone
- Emotional but not sad
- Intimate, personal
- Timeless, elegant
- Warm, inviting
- Never clinical or corporate

---

## Colors

### Primary Palette
```css
:root {
  /* Background */
  --nuclea-bg: #FFFFFF;           /* Pure white - primary background */
  --nuclea-bg-subtle: #FAFAFA;    /* Off-white - cards, sections */

  /* Text */
  --nuclea-text: #1A1A1A;         /* Near black - primary text */
  --nuclea-text-secondary: #666666; /* Gray - secondary text */
  --nuclea-text-muted: #999999;   /* Light gray - hints, placeholders */

  /* Accent */
  --nuclea-gold: #D4AF37;         /* Gold - primary accent */
  --nuclea-gold-light: #E8D48A;   /* Light gold - hover states */
  --nuclea-gold-dark: #B8972F;    /* Dark gold - active states */

  /* Capsule Metal */
  --nuclea-metal: #C0C0C0;        /* Silver - capsule icon */
  --nuclea-metal-shine: #E8E8E8;  /* Highlight */
  --nuclea-metal-shadow: #A0A0A0; /* Shadow */

  /* Semantic */
  --nuclea-success: #4CAF50;
  --nuclea-warning: #FF9800;
  --nuclea-error: #F44336;
  --nuclea-info: #2196F3;
}
```

### Usage Guidelines
| Element | Color |
|---------|-------|
| Background | `--nuclea-bg` |
| Cards | `--nuclea-bg-subtle` |
| Primary text | `--nuclea-text` |
| Secondary text | `--nuclea-text-secondary` |
| CTAs, accents | `--nuclea-gold` |
| Capsule icon | Metallic gradient |
| Errors | `--nuclea-error` |

---

## Typography

### Font Families
```css
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;
}
```

### Font Sizes (rem)
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}
```

### Typography Scale
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Hero title | Display | 5xl | 400 |
| Page title | Display | 3xl | 500 |
| Section title | Display | 2xl | 500 |
| Card title | Body | xl | 600 |
| Body text | Body | base | 400 |
| Caption | Body | sm | 400 |
| Button | Body | base | 500 |
| Label | Body | sm | 500 |

---

## Spacing

### Scale (rem)
```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
}
```

### Usage
| Context | Spacing |
|---------|---------|
| Between elements | space-4 |
| Card padding | space-6 |
| Section padding | space-12 |
| Page margins | space-6 (mobile), space-12 (desktop) |

---

## Components

### Buttons

**Primary Button (Gold)**
```css
.btn-primary {
  background: var(--nuclea-gold);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: var(--nuclea-gold-light);
}

.btn-primary:active {
  background: var(--nuclea-gold-dark);
}
```

**Secondary Button (Outline)**
```css
.btn-secondary {
  background: transparent;
  color: var(--nuclea-text);
  border: 1px solid var(--nuclea-text-muted);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
}
```

**Ghost Button (Text only)**
```css
.btn-ghost {
  background: transparent;
  color: var(--nuclea-text-secondary);
  padding: var(--space-2) var(--space-4);
}
```

### Cards

**Content Card**
```css
.card {
  background: var(--nuclea-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: var(--space-6);
}
```

**Elevated Card**
```css
.card-elevated {
  background: var(--nuclea-bg);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  padding: var(--space-8);
}
```

### Inputs

**Text Input**
```css
.input {
  background: var(--nuclea-bg-subtle);
  border: 1px solid transparent;
  border-radius: 8px;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--nuclea-gold);
  outline: none;
}
```

### Capsule Icon

**3D Metallic Capsule**
- Primary visual element
- Used throughout app
- Closed state: Full capsule
- Open state: Lid lifting, content emerging
- Animated transitions

```css
.capsule-icon {
  /* Metallic gradient for 3D effect */
  background: linear-gradient(
    135deg,
    var(--nuclea-metal-shine) 0%,
    var(--nuclea-metal) 50%,
    var(--nuclea-metal-shadow) 100%
  );
  border-radius: 50%;
  /* Add shadows for depth */
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}
```

---

## Navigation

### Bottom Navigation
```
┌─────────────────────────────────────────┐
│                                         │
│     🏠          +          👤          │
│    Home      Create      Profile        │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Height: 64px (mobile), hidden on desktop
- Icons: 24px
- Labels: 10px
- Active: Gold color
- Inactive: Gray

### Top Navigation (if needed)
- Logo left
- Actions right
- Minimal, not prominent

---

## Animations

### Principles
- Slow, deliberate movements
- Emotional, not flashy
- Ease-in-out timing
- Duration: 300-500ms for transitions

### Key Animations

**Capsule Opening**
```typescript
const capsuleOpen = {
  initial: { rotateY: 0, scale: 1 },
  animate: {
    rotateY: -30,
    scale: 1.1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};
```

**Memories Emerging**
```typescript
const memoryFloat = {
  initial: { y: 0, opacity: 0, rotate: 0 },
  animate: {
    y: -100,
    opacity: 1,
    rotate: Math.random() * 20 - 10,
    transition: {
      duration: 1,
      ease: 'easeOut',
      delay: index * 0.2
    }
  }
};
```

**Page Transition**
```typescript
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};
```

---

## Iconography

### Style
- Outline style (not filled)
- 24px default size
- Stroke width: 1.5px
- Rounded caps and joins

### Icon Set
Use [Lucide Icons](https://lucide.dev/) or similar:
- Camera, Video, Mic, FileText
- Calendar, Clock, Lock, Unlock
- Users, User, UserPlus
- Heart, Star, Gift
- Download, Upload, Share
- Settings, Edit, Trash
- ChevronRight, ArrowLeft

---

## Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
}
```

### Design Priorities
1. **Mobile-first** - Primary experience
2. Tablet - Expanded layout
3. Desktop - Full feature set

---

## Accessibility

### Requirements
- Color contrast: WCAG AA minimum
- Touch targets: 44x44px minimum
- Focus states: Visible outline
- Screen reader: All images have alt text
- Reduced motion: Respect `prefers-reduced-motion`

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode (Future)

Currently not designed. Light mode only for v1.

If implemented:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --nuclea-bg: #0D0D12;
    --nuclea-bg-subtle: #1A1A22;
    --nuclea-text: #FFFFFF;
    --nuclea-text-secondary: #A0A0A0;
    /* Gold remains the same */
  }
}
```

---

## Component Library

### Recommended
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons

### File Structure
```
src/
├── components/
│   ├── ui/                 # Base components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── capsule/            # Capsule-specific
│   │   ├── CapsuleIcon.tsx
│   │   ├── CapsuleCard.tsx
│   │   └── ...
│   ├── content/            # Content components
│   │   ├── PhotoCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── ...
│   └── layout/             # Layout components
│       ├── BottomNav.tsx
│       ├── Header.tsx
│       └── ...
└── styles/
    └── globals.css         # CSS variables, base styles
```
