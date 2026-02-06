# Life Chapter Capsule

**Type ID:** `life_chapter`
**Purpose:** Document specific life stages/experiences
**AI Avatar:** Optional (premium)
**Priority:** MEDIUM

## Overview

The Life Chapter capsule is designed to document bounded periods of life: a pregnancy, an Erasmus exchange, a solo travel adventure, a fitness challenge, a career transition. It has a clear beginning and ideally a natural ending when "the story makes sense."

## Philosophy

> "Not all of life, just this chapter."

Unlike Legacy (lifetime) or Social (ongoing), Life Chapter is:
- **Bounded:** Has start and intended end
- **Thematic:** Focused on one experience
- **Completable:** Natural closure point
- **Giftable:** Can be gifted after completion

## Use Cases

| Chapter Type | Example | Duration |
|--------------|---------|----------|
| Pregnancy | "Esperando a Lucas" | 9 months |
| Erasmus/Study Abroad | "Mi año en Berlín" | 6-12 months |
| Solo Travel | "Camino de Santiago" | Weeks |
| Fitness Challenge | "Mi maratón" | Months |
| Career Transition | "De abogado a chef" | Variable |
| Home Renovation | "Nuestra nueva casa" | Months |
| Recovery/Health | "Mi recuperación" | Variable |
| Sabbatical | "Año sabático 2026" | 12 months |

## User Flow (from PDF: NUCLEA_LIFE CHAPTER.pdf)

```
1. Create Life Chapter
   ├── Chapter title (e.g., "Mi Erasmus")
   ├── Start date
   ├── Expected end date (optional)
   └── Cover image

2. Document the Journey
   ├── Photos, videos, audio, notes
   ├── Organized by date (calendar)
   └── Add as you go

3. Track Progress (optional)
   ├── Milestones (e.g., "Llegada", "Primer mes")
   └── Progress indicators

4. Complete the Chapter
   ├── When story feels complete
   ├── Add closing reflection (optional)
   └── Download archive

5. Gift (optional)
   ├── Transfer to someone who shared the experience
   └── Or keep private
```

## Features

### Bounded Timeframe
- Clear start date (required)
- Expected end date (optional, can adjust)
- Visual progress indicator if end date set
- Reminders as end date approaches

### Milestones
- Marker events within the chapter
- Examples: "Día 1", "Mitad del camino", "Final"
- Appear in timeline as special items
- Optional: Auto-suggest milestones based on chapter type

### Chapter Types (Preset Templates)
- **Embarazo:** 40-week structure, trimester milestones
- **Erasmus:** Semester structure, arrival/departure
- **Viaje:** Day-by-day, location-based
- **Fitness:** Goal-oriented, progress metrics
- **Custom:** Fully flexible

### Gift Mode
- Similar to Together capsule gift
- Transfer ownership when chapter complete
- Perfect for: Baby capsule → child when grown
- Pregnancy capsule → partner or child

### Reflection Prompt
- At closure, prompt for final reflection
- "¿Qué aprendiste?" / "¿Qué recordarás?"
- Optional but encouraged
- Saved as final note

## Database Specifics

### Metadata JSONB Structure
```json
{
  "chapter_type": "erasmus",
  "chapter_title": "Mi año en Berlín",
  "start_date": "2025-09-01",
  "expected_end_date": "2026-06-30",
  "actual_end_date": null,
  "milestones": [
    {
      "id": "uuid",
      "title": "Llegada a Berlín",
      "date": "2025-09-01",
      "completed": true
    },
    {
      "id": "uuid",
      "title": "Primer semestre completo",
      "date": "2026-01-31",
      "completed": false
    }
  ],
  "closing_reflection": null,
  "gift_recipient_id": null
}
```

### Chapter Type Templates
```json
{
  "pregnancy": {
    "default_duration_months": 9,
    "suggested_milestones": [
      "Primera ecografía",
      "Fin del primer trimestre",
      "Saber el sexo",
      "Fin del segundo trimestre",
      "Baby shower",
      "Nacimiento"
    ]
  },
  "erasmus": {
    "default_duration_months": 10,
    "suggested_milestones": [
      "Llegada",
      "Primer mes",
      "Fin del primer semestre",
      "Viaje de mitad",
      "Exámenes finales",
      "Despedida"
    ]
  }
}
```

## UI Components (from PDF)

### Main View
- Chapter title prominent
- Progress bar (if end date set)
- "Day X of Y" counter
- Timeline/calendar toggle
- "Add Memory" FAB

### Chapter Setup
- Template selector (cards with icons)
- Title input
- Date range picker
- Cover image selector
- "Start Chapter" CTA

### Milestone Management
- Timeline with milestone markers
- Add/edit/delete milestones
- Mark as completed
- Drag to reorder

### Progress Indicators
- Circular progress ring
- Days remaining
- Percentage complete
- Encouraging messages

### Closure Flow
- "Complete Chapter" button
- Reflection prompt (textarea)
- Preview full chapter
- Download options
- Gift option

## Technical Implementation Notes

### Progress Calculation
```typescript
function calculateProgress(startDate: Date, endDate: Date | null): number {
  if (!endDate) return null;
  const now = new Date();
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
```

### Milestone Suggestions
- Based on chapter type
- Auto-populate but editable
- User can add custom milestones
- Completion tracking

### End Date Handling
- Optional but recommended
- Can extend if chapter continues
- Reminder at expected end: "Ready to close?"
- No auto-closure (user decides)

### Gift Transfer
- Same mechanism as Together gift
- Ownership change
- Original creator loses edit access
- All content transfers

### Edge Cases
- No end date → Infinite chapter (convert to Legacy?)
- End date passed but not closed → Gentle reminder
- Chapter shorter than expected → Allow early closure
- Gift rejected → Returns to creator

## Pricing Tier Requirements

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Life Chapter | 1 | 3 | Unlimited |
| Templates | Basic | All | All |
| Milestones | 3 max | Unlimited | Unlimited |
| Storage | 500MB | 5GB | 50GB |
| Gift Mode | No | Yes | Yes |
| AI Avatar | No | No | Yes |

## Content Suggestions by Chapter Type

### Pregnancy
- Weekly bump photos
- Ultrasound scans
- Heartbeat recordings
- Nursery progress
- Baby shower memories
- Birth story

### Erasmus/Travel
- Daily snapshots
- Local food discoveries
- Friend group photos
- Language learning moments
- Cultural experiences
- Farewell messages

### Fitness Challenge
- Progress photos
- Workout logs
- Personal records
- Nutrition wins
- Coach/trainer messages
- Race day content
