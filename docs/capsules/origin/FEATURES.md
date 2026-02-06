# Origin Capsule - Feature Specifications

## Feature Matrix

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Create Origin Capsule | No | 1 | Unlimited |
| Content Storage | - | 5GB | 50GB |
| Years Coverage | - | 18 years | 18+ years |
| Drawing Capture | - | Yes | Yes |
| AI Avatar | - | No | Yes |
| Co-parent Access | - | No | Yes |

## Core Features

### F-ORI-001: Child Profile

**Description:** Core information about the child.

**Profile Fields:**
```typescript
interface ChildProfile {
  name: string;
  birthDate: Date;
  profilePhoto: string;
  startedDuringPregnancy: boolean;
  pregnancyStartDate?: Date;  // If started before birth
  targetGiftAge: number;       // Default: 18
}
```

**Profile Display:**
```
┌─────────────────────────────────┐
│        ┌──────────┐             │
│        │  [foto]  │             │
│        └──────────┘             │
│          Lucas                  │
│                                 │
│  🎂 15 Mar 2020                │
│     Ahora tiene 5 años          │
│                                 │
│  📷 1,234 recuerdos guardados   │
│  🎨 45 dibujos                  │
│                                 │
│  🎁 Regalo previsto: 18 años    │
│     (13 años restantes)         │
└─────────────────────────────────┘
```

---

### F-ORI-002: Pre-Birth Content

**Description:** Start documenting before the child is born.

**Pre-Birth Content Types:**
- Ultrasound images
- Pregnancy diary entries
- Anticipation notes to future child
- Baby shower photos
- Nursery preparation

**Timeline Display:**
```
┌─────────────────────────────────┐
│  Antes de nacer                 │
│  ───────────────────────────── │
│  📷 Primera ecografía           │
│  📝 "Querido Lucas, aún no      │
│      sabes que existes..."      │
│  📷 Tu habitación casi lista    │
│                                 │
│  🎂 15 Mar 2020 - Nació Lucas   │
│  ═══════════════════════════════│
│                                 │
│  Año 1 (0-12 meses)             │
│  ───────────────────────────── │
│  📷 Primer día en casa          │
│  🎤 Primera risa                │
│  ...                            │
└─────────────────────────────────┘
```

---

### F-ORI-003: Drawing Content Type

**Description:** Unique feature for preserving children's artwork.

**Why Drawings:**
- Children's art is ephemeral
- Evolves dramatically over years
- Parents often lose or discard
- Digital preservation is permanent

**Capture Options:**

**Option A: Photograph Physical Drawing**
```
┌─────────────────────────────────┐
│  📷 Fotografiar dibujo          │
│                                 │
│  ┌───────────────────────────┐  │
│  │   Camera viewfinder       │  │
│  │                           │  │
│  │   ┌─────────────────┐     │  │
│  │   │  Coloca el      │     │  │
│  │   │  dibujo aquí    │     │  │
│  │   └─────────────────┘     │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  💡 Asegúrate de tener buena    │
│     iluminación y fondo plano   │
│                                 │
│  [Capturar]                     │
└─────────────────────────────────┘
```

**Option B: Digital Canvas**
```
┌─────────────────────────────────┐
│  🎨 Dibujar aquí                │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │     (drawing canvas)      │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  🖌️ Pincel  🎨 Color  ↩️ Deshacer│
│                                 │
│  [Guardar dibujo]               │
└─────────────────────────────────┘
```

**Drawing Metadata:**
```typescript
interface DrawingMetadata {
  childAgeAtCreation: string;   // "4 años, 3 meses"
  titleByChild?: string;        // "Mi familia" (in child's words)
  medium?: string;              // "Crayones", "Acuarelas", "Digital"
  preservedOriginal?: boolean;  // Physical copy kept?
  context?: string;             // "Para el día del padre"
}
```

---

### F-ORI-004: Age-Based Navigation

**Description:** Browse content by child's age.

**Age Periods:**
```typescript
const AGE_PERIODS = [
  { id: 'pregnancy', label: 'Antes de nacer', icon: '🤰' },
  { id: 'year-0', label: '0-1 año', icon: '👶' },
  { id: 'year-1', label: '1-2 años', icon: '🧒' },
  { id: 'year-2', label: '2-3 años', icon: '🧒' },
  // ... continues
  { id: 'year-17', label: '17-18 años', icon: '👨‍🎓' },
];
```

**Navigation UI:**
```
┌─────────────────────────────────┐
│  [🤰][0][1][2][3][4][5][→]      │ ← Horizontal scroll
│  ════════════════════════════   │
│                                 │
│  4 años (actual)                │
│  ───────────────────────────── │
│  📷 142 fotos                   │
│  🎬 23 videos                   │
│  🎨 12 dibujos                  │
│                                 │
│  [Ver contenido de este año]    │
└─────────────────────────────────┘
```

---

### F-ORI-005: Milestone Markers

**Description:** Significant events in child's development.

**Default Milestones:**
```typescript
const DEFAULT_MILESTONES = [
  // Physical
  { category: 'physical', title: 'Primera sonrisa' },
  { category: 'physical', title: 'Primeros pasos' },
  { category: 'physical', title: 'Primer diente' },

  // Communication
  { category: 'communication', title: 'Primera palabra' },
  { category: 'communication', title: 'Primera frase' },

  // Social
  { category: 'social', title: 'Primer amigo' },
  { category: 'social', title: 'Primera fiesta de cumpleaños' },

  // Education
  { category: 'education', title: 'Primer día de guardería' },
  { category: 'education', title: 'Primer día de cole' },
  { category: 'education', title: 'Aprender a leer' },
  { category: 'education', title: 'Aprender a escribir' },

  // Special
  { category: 'special', title: 'Primer viaje' },
  { category: 'special', title: 'Primera mascota' },
];
```

**Milestone View:**
```
┌─────────────────────────────────┐
│  Hitos de Lucas                 │
│                                 │
│  ✓ Primera sonrisa    2 meses   │
│  ✓ Primeros pasos     11 meses  │
│  ✓ Primera palabra    13 meses  │
│  ✓ Primer día cole    3 años    │
│  ○ Aprender a leer    ? años    │
│  ○ Aprender a nadar   ? años    │
│                                 │
│  [+ Añadir hito personalizado]  │
└─────────────────────────────────┘
```

---

### F-ORI-006: Parent Reflections

**Description:** Parent's thoughts and feelings alongside content.

**Reflection Prompts:**
```typescript
const REFLECTION_PROMPTS_BY_AGE = {
  0: ["¿Cómo fue verte por primera vez?"],
  1: ["¿Cuál fue su primera palabra?", "¿Qué te sorprende de su personalidad?"],
  5: ["¿Cómo es su primer día de cole?", "¿Qué hace que sea único/a?"],
  10: ["¿Qué te enorgullece de él/ella?"],
  18: ["¿Qué le dirías ahora que es adulto/a?"]
};
```

**Reflection Note Format:**
```
┌─────────────────────────────────┐
│  💭 Reflexión de mamá/papá      │
│  ───────────────────────────── │
│  Fecha: 15 Mar 2025             │
│  Lucas tiene: 5 años            │
│                                 │
│  "Hoy empezaste el cole. Te vi  │
│   tan pequeño con tu mochila    │
│   gigante. Tenías miedo pero    │
│   no llorabas. Me hiciste       │
│   sentir muy orgullosa."        │
│                                 │
│  📷 [Foto del primer día]       │
└─────────────────────────────────┘
```

---

### F-ORI-007: Gift Preparation

**Description:** Preparing the capsule for handover to the child.

**Target Gift Age:**
- Default: 18 años
- Configurable: 15, 16, 18, 21, 25, custom

**Preparation Flow (1 year before target):**
```
1. Notification: "Lucas cumplirá 18 en 1 año"
2. Review capsule content
3. Add final reflections
4. Write closing letter
5. Set delivery date
6. Preview as Lucas would see it
7. Confirm gift preparation
```

**Closing Letter UI:**
```
┌─────────────────────────────────┐
│  Carta para Lucas               │
│                                 │
│  Esta carta se mostrará cuando  │
│  Lucas abra su cápsula.         │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Querido Lucas,            │  │
│  │                           │  │
│  │ Hace 18 años empezamos    │  │
│  │ a guardar estos recuerdos │  │
│  │ para ti...                │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Vista previa]  [Guardar]      │
└─────────────────────────────────┘
```

---

### F-ORI-008: Co-Parent Access (Familiar only)

**Description:** Both parents can contribute to the capsule.

**Permission Model:**
```typescript
interface CoParentPermissions {
  canView: boolean;       // Always true
  canAdd: boolean;        // Default true
  canEdit: boolean;       // Own content only
  canDelete: boolean;     // Own content only
  canGift: boolean;       // Both must agree
}
```

**Co-Parent Invitation:**
- Similar to Together capsule
- Both parents see same capsule
- Content attributed to each parent
- Gift requires both to confirm

---

### F-ORI-009: Child's Future View

**Description:** How the child experiences receiving the capsule.

**Gift Receiving Flow:**
```
1. Child receives notification on gift date
   "Un regalo de tus padres"

2. Unwrap animation
   Capsule opens, reveals contents

3. Parent's letter first
   Read before seeing content

4. Explore capsule
   Timeline from pregnancy to now

5. Own the capsule
   Full control, can add own content
   Can close when ready
```

**Child's Dashboard:**
```
┌─────────────────────────────────┐
│  Tu historia                    │
│  Un regalo de mamá y papá       │
│                                 │
│  18 años de recuerdos           │
│  📷 2,456 fotos                 │
│  🎬 312 videos                  │
│  🎨 89 dibujos                  │
│  📝 45 reflexiones              │
│                                 │
│  [Empezar el viaje]             │
└─────────────────────────────────┘
```

---

### F-ORI-010: Continuous Prompts

**Description:** Encourage regular content addition over years.

**Prompt Schedule:**
- Weekly: "¿Qué hizo [Name] esta semana?"
- Monthly: "Foto del mes"
- Birthday: "Reflexión de cumpleaños"
- Milestones: "¿Ha aprendido algo nuevo?"

**Smart Prompts:**
```typescript
function generatePrompt(child: Child, lastContent: Date): string {
  const age = calculateAge(child.birthDate);
  const daysSinceContent = differenceInDays(new Date(), lastContent);

  if (daysSinceContent > 30) {
    return `Hace un mes que no añades recuerdos de ${child.name}. ¿Qué ha pasado?`;
  }

  // Age-specific prompts
  if (age.years === 0) {
    return `¿Cómo duerme ${child.name} últimamente?`;
  }
  if (age.years >= 3 && age.years <= 5) {
    return `¿Qué ha dibujado ${child.name} esta semana?`;
  }
  // ...
}
```

## Data Model Extensions

### Metadata for Origin Capsule
```json
{
  "child_name": "Lucas",
  "birth_date": "2020-03-15",
  "started_during_pregnancy": true,
  "pregnancy_start_date": "2019-06-20",
  "target_gift_age": 18,
  "co_parent_id": "uuid-partner",
  "milestones": [
    {
      "id": "uuid",
      "title": "Primera sonrisa",
      "date": "2020-05-10",
      "age_at_milestone": "2 meses",
      "content_ids": ["content-1"]
    }
  ],
  "closing_letter": null,
  "gift_prepared_at": null,
  "gift_delivered_at": null,
  "prompts_enabled": true,
  "last_prompt_at": "2026-01-15T10:00:00Z"
}
```

### Drawing Content Metadata
```json
{
  "type": "drawing",
  "child_age_at_creation": "4 años, 3 meses",
  "title_by_child": "Mi familia",
  "medium": "Crayones",
  "preserved_original": true,
  "context": "Día del padre 2024"
}
```

## Long-Term Considerations

### Storage Over 18 Years
- Average: 5-10 GB per year
- Total: 90-180 GB over 18 years
- Familiar tier: 50GB limit → Needs upgrade path

### Data Portability
- Export available at any time
- Standard formats (images, video, JSON metadata)
- No vendor lock-in

### Parent Separation Scenario
- Each parent keeps access to own content
- Option to duplicate capsule
- Child receives from both (or combined)

### Parent Death Scenario
- Capsule continues with surviving parent
- Or triggers early delivery to child
- Or passes to designated guardian

## Analytics Events

```typescript
// Origin-specific events
'origin.created'
'origin.pregnancy_content_added'
'origin.drawing_captured'
'origin.milestone_recorded'
'origin.reflection_added'
'origin.co_parent_invited'
'origin.co_parent_contributed'
'origin.gift_age_set'
'origin.gift_prepared'
'origin.gift_delivered'
'origin.child_opened'
'origin.child_added_content'  // After receiving
```
