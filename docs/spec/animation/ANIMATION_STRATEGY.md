# NUCLEA - Animation Strategy

**Context:** Video demo from Andrea (CEO) showing capsule → polaroids metaphor
**Purpose:** Define technical approach for recreating the animation in web

---

## The Concept (From Video Demo)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  [CLOSED CAPSULE]                                           │
│  • Metallic gold capsule object                             │
│  • Centered on screen                                       │
│  • Subtle particle effects floating                         │
│  • Ambient glow                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                    [USER TAPS/CAPSULE]
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  [OPENING ANIMATION]                                        │
│  • Capsule halves separate smoothly                         │
│  • Light/glow emanates from inside                          │
│  • Duration: ~800ms                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  [POLAROIDS EMERGE]                                         │
│  • Photos float out from capsule interior                   │
│  • Staggered timing (not all at once)                      │
│  • Random slight rotation for natural feel                  │
│  • Z-axis depth (some closer, some farther)                │
│  • Gentle floating animation                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  [TRANSITION TO CONTENT]                                   │
│  • Polaroids disperse outward                               │
│  • Fade to actual capsule content view                      │
│  • Content loads with stagger animation                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Approach

### Option A: Framer Motion (RECOMMENDED for web)

**Pros:**
- React-native, integrates with Next.js
- Declarative API
- GPU-accelerated
- Good physics/spring animations
- Smaller bundle than GSAP

**Cons:**
- Less precise timeline control than GSAP
- 3D effects limited

**Best for:** MVP, web-only implementation

### Option B: GSAP + Three.js

**Pros:**
- Timeline precision (frame-perfect)
- True 3D with Three.js
- Professional-grade motion design
- ScrollTrigger for scroll-based animations

**Cons:**
- Larger bundle size
- Steeper learning curve
- Overkill for simple transitions

**Best for:** Production polish, investor demo, marketing site

### Option C: Rive / Lottie

**Pros:**
- After Effects integration
- Small file size
- Consistent across platforms

**Cons:**
- Requires After Effects design work
- Less dynamic (harder to make content-reactive)
- Separate workflow from dev

**Best for:** Loading animations, icon animations, NOT main interactions

---

## Recommended Implementation

### Phase 1: Framer Motion Prototype (MVP)

```tsx
import { motion, AnimatePresence } from 'framer-motion';

const CapsuleAnimation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<'closed' | 'opening' | 'polaroids' | 'content'>('closed');

  const capsuleVariants = {
    closed: {
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.5 }
    },
    opening: {
      scale: 1.1,
      rotateY: 15,
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
    open: {
      opacity: 0,
      scale: 2,
      transition: { duration: 0.3, delay: 0.4 }
    }
  };

  const polaroidVariants = {
    hidden: (i: number) => ({
      y: 0,
      x: 0,
      rotate: 0,
      opacity: 0,
      scale: 0.5,
      zIndex: 0
    }),
    visible: (i: number) => ({
      y: -100 - (i * 20),
      x: (i % 2 === 0 ? 1 : -1) * (50 + i * 30),
      rotate: (i % 2 === 0 ? 1 : -1) * (10 + i * 5),
      opacity: 1,
      scale: 1,
      zIndex: 10 - i,
      transition: {
        delay: 0.5 + (i * 0.1),
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1]
      }
    }),
    floating: {
      y: -100 - (i * 20) + Math.sin(Date.now() / 1000 + i) * 10,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black">
      {/* Capsule */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="cursor-pointer"
            variants={capsuleVariants}
            initial="closed"
            animate={phase === 'opening' ? 'opening' : 'closed'}
            exit="open"
            onClick={() => {
              setIsOpen(true);
              setPhase('opening');
              setTimeout(() => setPhase('polaroids'), 400);
            }}
          >
            {/* 3D Capsule Visual */}
            <div className="w-48 h-48 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Polaroids */}
      <AnimatePresence>
        {phase === 'polaroids' && [0,1,2,3,4,5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-40 bg-white p-2 shadow-xl"
            custom={i}
            variants={polaroidVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-full h-24 bg-gray-200 mb-2" />
            <div className="w-full h-8 bg-gray-100" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

### Phase 2: GSAP + Three.js (Production Polish)

```typescript
// For investor demo / marketing site
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

class CapsuleScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private capsule: THREE.Group;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.capsule = this.createCapsule();
  }

  createCapsule() {
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.8,
      roughness: 0.2
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);
    return group;
  }

  openCapsule() {
    const timeline = gsap.timeline();

    // Rotate and scale
    timeline.to(this.capsule.rotation, {
      y: Math.PI / 4,
      duration: 0.4,
      ease: 'power2.inOut'
    });

    // Separate halves
    timeline.to(
      [this.capsule.children[0].position, this.capsule.children[1].position],
      {
        x: (i) => (i === 0 ? -1 : 1),
        duration: 0.6,
        ease: 'power2.out'
      },
      '-=0.2'
    );

    // Emit glow
    timeline.to(
      this.capsule.children[2].material,
      {
        opacity: 1,
        duration: 0.3
      },
      '-=0.4'
    );
  }

  spawnPolaroids() {
    // Create polaroid meshes and animate them floating out
  }
}
```

---

## Animation Timing

| Phase | Duration | Delay | Easing |
|-------|----------|-------|--------|
| Tap response | 150ms | 0 | easeOut |
| Capsule opening | 400ms | 150ms | easeInOut |
| Light glow | 300ms | 350ms | easeOut |
| First polaroid | 800ms | 500ms | cubic-bezier(0.215, 0.61, 0.355, 1) |
| Polaroid stagger | 100ms | per item | cubic-bezier(0.215, 0.61, 0.355, 1) |
| Float animation | 2000ms | infinite | easeInOut |
| Transition to content | 500ms | after last polaroid | easeOut |

---

## Particle Effects

### Background Particles (Always active)

```typescript
// Gold dust particles floating
const particles = {
  count: 50,
  size: { min: 2, max: 6 },
  opacity: { min: 0.1, max: 0.4 },
  speed: { min: 0.2, max: 0.8 },
  color: '#D4AF37'
};
```

### Burst Particles (On capsule open)

```typescript
// Quick burst of light when capsule opens
const burst = {
  count: 30,
  speed: 2,
  duration: 600,  // ms
  fade: true
};
```

---

## Performance Considerations

1. **Lazy load animation library** - Only load on landing page
2. **Use CSS transforms** - GPU accelerated
3. **Limit polaroid count** - 6-8 max for performance
4. **Will-change hint** - Apply to animated elements
5. **Reduce motion** - Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .capsule-animation {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## Assets Needed

| Asset | Type | Dimensions | Format |
|-------|------|------------|--------|
| Capsule 3D model | GLTF/OBJ | - | .glb |
| Polaroid texture | Image | 512x768 | .webp |
| Particle sprite | Image | 64x64 | .png with alpha |
| Ambient light map | Cube texture | 1024 | .hdr |

---

## Implementation Checklist

- [ ] Install Framer Motion (`npm install framer-motion`)
- [ ] Create capsule component with variants
- [ ] Build polaroid card component
- [ ] Implement tap interaction
- [ ] Add stagger animation
- [ ] Create floating effect
- [ ] Add particle system
- [ ] Implement transition to content
- [ ] Test on mobile (touch targets)
- [ ] Add reduced motion support
- [ ] Performance audit (Lighthouse)

---

*Strategy defined: Feb 2026*
*Based on: WhatsApp video demo from Andrea Box López*
