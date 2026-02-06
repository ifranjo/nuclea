# Life Chapter Capsule - Feature Specifications

## Feature Matrix

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Create Life Chapter | 1 | 3 | Unlimited |
| Content Storage | 500MB | 5GB | 50GB |
| Templates | Basic | All | All |
| Milestones | 3 max | Unlimited | Unlimited |
| Gift Mode | No | Yes | Yes |
| AI Avatar | No | No | Yes |

## Core Features

### F-LCH-001: Chapter Templates

**Description:** Pre-configured templates for common life chapters.

**Available Templates:**

```typescript
const CHAPTER_TEMPLATES = {
  pregnancy: {
    id: 'pregnancy',
    label: 'Embarazo',
    icon: '🤰',
    defaultDuration: 9,
    durationUnit: 'months',
    suggestedMilestones: [
      'Primera ecografía',
      'Fin del primer trimestre',
      'Saber el sexo',
      'Fin del segundo trimestre',
      'Baby shower',
      'Nacimiento'
    ],
    suggestedContent: [
      'Fotos de la barriga (semanal)',
      'Ecografías',
      'Preparación de la habitación',
      'Regalos recibidos'
    ]
  },

  erasmus: {
    id: 'erasmus',
    label: 'Erasmus / Estudios',
    icon: '🎓',
    defaultDuration: 10,
    durationUnit: 'months',
    suggestedMilestones: [
      'Llegada',
      'Primer mes',
      'Fin del primer semestre',
      'Viaje de mitad',
      'Exámenes finales',
      'Despedida'
    ],
    suggestedContent: [
      'Nuevos amigos',
      'Lugares visitados',
      'Comida local',
      'Clases y proyectos'
    ]
  },

  travel: {
    id: 'travel',
    label: 'Viaje',
    icon: '✈️',
    defaultDuration: null,  // Variable
    durationUnit: 'days',
    suggestedMilestones: [
      'Día 1',
      'Punto medio',
      'Último día'
    ],
    suggestedContent: [
      'Paisajes',
      'Comida',
      'Gente que conocí',
      'Momentos inesperados'
    ]
  },

  fitness: {
    id: 'fitness',
    label: 'Reto Fitness',
    icon: '💪',
    defaultDuration: 3,
    durationUnit: 'months',
    suggestedMilestones: [
      'Inicio',
      'Primera marca personal',
      'Mitad del reto',
      'Meta alcanzada'
    ],
    suggestedContent: [
      'Fotos de progreso',
      'Entrenamientos',
      'Comidas saludables',
      'Récords personales'
    ]
  },

  career: {
    id: 'career',
    label: 'Cambio Profesional',
    icon: '💼',
    defaultDuration: 6,
    durationUnit: 'months',
    suggestedMilestones: [
      'Decisión tomada',
      'Primer paso',
      'Punto de no retorno',
      'Nueva etapa comenzada'
    ],
    suggestedContent: [
      'Motivaciones',
      'Aprendizajes',
      'Miedos superados',
      'Celebraciones'
    ]
  },

  renovation: {
    id: 'renovation',
    label: 'Reforma / Nueva Casa',
    icon: '🏠',
    defaultDuration: 4,
    durationUnit: 'months',
    suggestedMilestones: [
      'Antes',
      'Obras en progreso',
      'Casi terminado',
      'Resultado final'
    ],
    suggestedContent: [
      'Estado inicial',
      'Proceso de obra',
      'Detalles elegidos',
      'Resultado final'
    ]
  },

  custom: {
    id: 'custom',
    label: 'Personalizado',
    icon: '✨',
    defaultDuration: null,
    durationUnit: 'days',
    suggestedMilestones: [],
    suggestedContent: []
  }
};
```

---

### F-LCH-002: Progress Tracking

**Description:** Visual progress indicators for time-bound chapters.

**Progress Calculation:**
```typescript
interface ChapterProgress {
  startDate: Date;
  endDate: Date | null;
  currentDay: number;
  totalDays: number | null;
  percentComplete: number | null;
  daysRemaining: number | null;
}

function calculateProgress(startDate: Date, endDate: Date | null): ChapterProgress {
  const now = new Date();
  const currentDay = differenceInDays(now, startDate) + 1;

  if (!endDate) {
    return {
      startDate,
      endDate: null,
      currentDay,
      totalDays: null,
      percentComplete: null,
      daysRemaining: null
    };
  }

  const totalDays = differenceInDays(endDate, startDate) + 1;
  const daysRemaining = Math.max(0, differenceInDays(endDate, now));
  const percentComplete = Math.min(100, Math.max(0, (currentDay / totalDays) * 100));

  return {
    startDate,
    endDate,
    currentDay,
    totalDays,
    percentComplete,
    daysRemaining
  };
}
```

**Progress UI:**
```
┌─────────────────────────────────┐
│  Mi Erasmus en Berlín           │
│                                 │
│  Día 127 de 300                 │
│  ████████░░░░░░░░░░░░  42%     │
│                                 │
│  173 días restantes             │
│  Fin previsto: 30 Jun 2026      │
└─────────────────────────────────┘
```

---

### F-LCH-003: Milestone System

**Description:** Key events within the chapter.

**Milestone Structure:**
```typescript
interface Milestone {
  id: string;
  title: string;
  date: Date | null;      // Can be set in advance or when completed
  completed: boolean;
  contentIds: string[];   // Content associated with this milestone
  notes?: string;
}
```

**Milestone States:**
- **Planned:** Date set, not yet reached
- **Active:** Date is today
- **Completed:** Marked as done
- **Missed:** Date passed without completion

**Milestone UI:**
```
┌─────────────────────────────────┐
│  Hitos del capítulo             │
│                                 │
│  ✓ Llegada         1 Sep        │
│  ✓ Primer mes      1 Oct        │
│  ○ Fin primer sem  31 Ene       │ ← Next
│  ○ Viaje mitad     Mar          │
│  ○ Exámenes        Jun          │
│  ○ Despedida       30 Jun       │
│                                 │
│  [+ Añadir hito]                │
└─────────────────────────────────┘
```

---

### F-LCH-004: Closing Reflection

**Description:** Prompt for final thoughts when closing chapter.

**Reflection Prompts (by template):**

```typescript
const REFLECTION_PROMPTS = {
  pregnancy: [
    "¿Qué sentiste cuando le viste por primera vez?",
    "¿Cuál fue el momento más emotivo?",
    "¿Qué consejo te darías a ti misma de hace 9 meses?"
  ],
  erasmus: [
    "¿Qué aprendiste de ti mismo/a?",
    "¿Cuál fue tu mejor recuerdo?",
    "¿Qué extrañarás más?"
  ],
  travel: [
    "¿Qué te sorprendió más?",
    "¿Volverías? ¿Por qué?",
    "¿Qué te llevas de este viaje?"
  ],
  fitness: [
    "¿Cómo te sientes ahora comparado con el inicio?",
    "¿Cuál fue el momento más difícil?",
    "¿Qué hábitos mantendrás?"
  ],
  custom: [
    "¿Qué aprendiste?",
    "¿Qué recordarás siempre?",
    "¿Qué viene ahora?"
  ]
};
```

**Reflection UI:**
```
┌─────────────────────────────────┐
│  Reflexión final                │
│                                 │
│  Tu capítulo está por cerrarse. │
│  Antes de terminar, ¿quieres    │
│  añadir unas palabras finales?  │
│                                 │
│  💭 ¿Qué aprendiste de ti       │
│     mismo/a?                    │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Omitir]  [Guardar reflexión]  │
└─────────────────────────────────┘
```

---

### F-LCH-005: Gift Mode

**Description:** Transfer completed chapter to someone who shared the experience.

**Gift Use Cases:**
- Pregnancy chapter → Child when grown
- Erasmus chapter → Friends from that time
- Travel chapter → Travel partner
- Renovation chapter → Partner/family

**Gift Flow:**
```
1. Complete chapter (closure initiated)
2. Option appears: "¿Quieres regalar este capítulo?"
3. Enter recipient email
4. Add gift message
5. Preview as recipient
6. Confirm transfer
7. Ownership changes, creator becomes viewer (optional)
```

**Gift Options:**
- **Full transfer:** Recipient owns, creator loses access
- **Shared access:** Both can view, recipient "owns" for archiving

---

### F-LCH-006: End Date Extension

**Description:** Handling chapters that last longer than expected.

**Extension Flow:**
```
┌─────────────────────────────────┐
│  Tu capítulo iba a terminar     │
│  el 30 Jun 2026                 │
│                                 │
│  ¿La historia continúa?         │
│                                 │
│  [Extender 1 mes]               │
│  [Extender 3 meses]             │
│  [Sin fecha de fin]             │
│  [Cerrar ahora]                 │
└─────────────────────────────────┘
```

**Notification Timing:**
- 7 days before end date: "Tu capítulo termina pronto"
- On end date: "¿Listo para cerrar?"
- 7 days after: "Tu capítulo pasó su fecha, ¿extendemos?"

---

### F-LCH-007: Content Suggestions

**Description:** Proactive prompts for relevant content.

**Suggestion Engine:**
```typescript
interface ContentSuggestion {
  type: ContentType;
  prompt: string;
  timing: 'daily' | 'weekly' | 'milestone';
  template: ChapterTemplate;
}

const SUGGESTIONS: ContentSuggestion[] = [
  // Pregnancy
  { type: 'photo', prompt: 'Foto semanal de la barriga', timing: 'weekly', template: 'pregnancy' },
  { type: 'note', prompt: '¿Cómo te sientes hoy?', timing: 'daily', template: 'pregnancy' },

  // Erasmus
  { type: 'photo', prompt: '¿Qué has descubierto hoy?', timing: 'daily', template: 'erasmus' },
  { type: 'video', prompt: 'Graba un mensaje para tu yo del futuro', timing: 'milestone', template: 'erasmus' },

  // Travel
  { type: 'photo', prompt: '¿Cuál ha sido el momento del día?', timing: 'daily', template: 'travel' },
  { type: 'audio', prompt: 'Graba los sonidos de donde estás', timing: 'weekly', template: 'travel' },
];
```

**Suggestion Notification:**
```
┌─────────────────────────────────┐
│  📷 Sugerencia                  │
│                                 │
│  Es domingo - ¿foto semanal     │
│  de la barriga?                 │
│                                 │
│  [Ahora] [Más tarde] [No más]   │
└─────────────────────────────────┘
```

---

### F-LCH-008: Chapter Comparison

**Description:** Compare similar chapters over time.

**Use Case:**
- User did Erasmus in 2024, another exchange in 2026
- Side-by-side comparison available

**Comparison View:**
```
┌─────────────────────────────────┐
│  Mis capítulos de estudios      │
│                                 │
│  ┌─────────┐   ┌─────────┐     │
│  │ Berlín  │   │ Lisboa  │     │
│  │ 2024-25 │   │ 2026-27 │     │
│  │ 156 fot │   │ 89 fot  │     │
│  └─────────┘   └─────────┘     │
│                                 │
│  [Comparar lado a lado]         │
└─────────────────────────────────┘
```

## Data Model Extensions

### Metadata for Life Chapter
```json
{
  "chapter_type": "erasmus",
  "chapter_title": "Mi año en Berlín",
  "start_date": "2025-09-01",
  "expected_end_date": "2026-06-30",
  "actual_end_date": null,
  "milestones": [
    {
      "id": "uuid-1",
      "title": "Llegada",
      "date": "2025-09-01",
      "completed": true,
      "content_ids": ["content-uuid-1", "content-uuid-2"]
    },
    {
      "id": "uuid-2",
      "title": "Fin primer semestre",
      "date": "2026-01-31",
      "completed": false,
      "content_ids": []
    }
  ],
  "closing_reflection": null,
  "gift_recipient_id": null,
  "gift_message": null,
  "suggestions_enabled": true,
  "last_suggestion_at": "2026-01-15T10:00:00Z"
}
```

## Calendar Integration

### Optional External Calendar Sync
```typescript
interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate?: Date;
  source: 'milestone' | 'end_date' | 'reminder';
}

function exportToCalendar(chapter: Chapter): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // End date event
  if (chapter.expectedEndDate) {
    events.push({
      title: `Fin de "${chapter.title}"`,
      startDate: chapter.expectedEndDate,
      source: 'end_date'
    });
  }

  // Milestone events
  chapter.milestones.forEach(m => {
    if (m.date && !m.completed) {
      events.push({
        title: `${chapter.title}: ${m.title}`,
        startDate: m.date,
        source: 'milestone'
      });
    }
  });

  return events;
}
```

## Analytics Events

```typescript
// Life Chapter-specific events
'life_chapter.created'
'life_chapter.template_selected'
'life_chapter.milestone_added'
'life_chapter.milestone_completed'
'life_chapter.end_date_extended'
'life_chapter.suggestion_shown'
'life_chapter.suggestion_acted'
'life_chapter.reflection_added'
'life_chapter.closure_initiated'
'life_chapter.gift_prepared'
'life_chapter.gift_transferred'
```
