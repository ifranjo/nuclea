# Origin Capsule

**Type ID:** `origin`
**Purpose:** Parents documenting child's life (birth → adulthood)
**AI Avatar:** Optional (premium)
**Priority:** MEDIUM-HIGH

## Overview

The Origin capsule is a parent's gift to their child: a documented journey from birth (or even before) to whenever the parent decides to pass it on. It's the ultimate "time capsule" - created by parents, gifted to the child when they're old enough to appreciate it.

## Unique Feature

**Drawing Content Type:** Only Origin capsule includes drawings/artwork as a content type, allowing parents to preserve their child's artistic creations.

## Philosophy

> "Tu historia, desde antes de que pudieras recordarla."

The Origin capsule captures what children can't remember themselves:
- Birth stories
- First words, first steps
- Childhood milestones
- Daily life moments
- School memories
- Family traditions
- Parent's perspective on raising them

## User Flow (from PDF: Nuclea_Capsulas_Base_y_Botones_AJUSTADO.pdf, NUCLEA_CAPSULAS.pdf)

```
1. Create Origin Capsule
   ├── Child's name
   ├── Birth date
   ├── Cover photo (ultrasound, newborn, etc.)
   └── Optional: Start before birth (pregnancy)

2. Document the Journey
   ├── Photos (daily life, milestones)
   ├── Videos (first steps, birthdays)
   ├── Audio (first words, songs)
   ├── Notes (parent's reflections)
   └── Drawings (child's artwork)

3. Long-term Commitment
   ├── Add content over years
   ├── Milestone markers
   └── Annual reflections (optional)

4. Gift When Ready
   ├── Child reaches appropriate age (18?)
   ├── Transfer ownership
   └── Parent adds closing message
```

## Features

### Pre-Birth Content
- Can start during pregnancy
- Ultrasound images
- Pregnancy diary entries
- Anticipation notes
- Baby shower memories

### Drawing/Artwork
- Unique to Origin capsule
- Photograph child's drawings
- Digital drawings on tablet
- School art projects
- Evolution of artistic ability

### Milestone System
- Age-based milestones (1 month, 6 months, 1 year, etc.)
- Achievement milestones (first word, first tooth, etc.)
- School milestones (first day, graduation, etc.)
- Custom milestones

### Long-Duration Design
- 18+ years of content
- Scalable storage
- Easy navigation by age/year
- Search and filtering

### Gift Ceremony
- Special transfer experience
- Parent's closing letter
- Reveal animation
- Option for in-person gift moment

## Database Specifics

### Metadata JSONB Structure
```json
{
  "child_name": "Lucas",
  "birth_date": "2020-03-15",
  "started_during_pregnancy": true,
  "pregnancy_start_date": "2019-06-20",
  "milestones": [
    {
      "id": "uuid",
      "type": "age",
      "title": "1 año",
      "date": "2021-03-15",
      "content_ids": ["uuid1", "uuid2"]
    },
    {
      "id": "uuid",
      "type": "achievement",
      "title": "Primeros pasos",
      "date": "2021-01-10",
      "content_ids": ["uuid3"]
    }
  ],
  "target_gift_age": 18,
  "closing_letter": null,
  "gifted_at": null
}
```

### Content Type Extension
```sql
-- Origin capsule allows 'drawing' content type
-- Already defined in contents table ENUM

-- Drawings metadata
{
  "type": "drawing",
  "metadata": {
    "child_age_at_creation": "4 años",
    "medium": "crayones",
    "title_by_child": "Mi familia",
    "preserved_original": true
  }
}
```

## UI Components (from PDFs)

### Main View
- Child's photo/avatar
- Age display (calculated from birth date)
- Year/age navigation
- Content timeline
- "Add Memory" FAB with drawing option

### Age Navigation
- Horizontal scrollable years: 0, 1, 2, 3...
- Quick jump to specific age
- Visual indicator for years with content
- Special markers for milestone years

### Drawing Capture
- Camera with flat-lay guide
- Or digital canvas for drawing
- Metadata: age, medium, title
- Gallery of artwork

### Milestone Markers
- Prominent in timeline
- Photo + description
- "First [X]" templates
- Anniversary highlights

### Gift Preparation
- "Prepare Gift" button (appears when child is near target age)
- Write closing letter
- Preview entire capsule
- Set reveal date
- Send or gift in person

### Gift Receiving (Child's POV)
- Special app notification
- "A gift from [Parent]" message
- Unwrap animation
- Letter displayed first
- Access to full capsule

## Technical Implementation Notes

### Age Calculation
```typescript
function calculateAge(birthDate: Date): { years: number; months: number } {
  const now = new Date();
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months };
}

function formatAge(birthDate: Date): string {
  const { years, months } = calculateAge(birthDate);
  if (years === 0) {
    return `${months} mes${months !== 1 ? 'es' : ''}`;
  }
  return `${years} año${years !== 1 ? 's' : ''}`;
}
```

### Content Organization
- Primary: Chronological by date
- Secondary: By age (calculated from birth date)
- Filterable by content type
- Searchable by description

### Drawing Capture Flow
1. Select "Drawing" content type
2. Camera opens with flat-lay guide overlay
3. Capture photo of physical artwork
4. Or switch to digital canvas
5. Add metadata (age, title, medium)
6. Save to timeline

### Long-term Storage
- Expect 18+ years of content
- Storage optimization: Compress old videos
- Archive option for old years
- Export by year functionality

### Gift Transfer Mechanism
- Similar to Together gift mode
- Additional: Closing letter storage
- Ownership transfers completely
- Parent can request "viewer" access (child decides)

### Edge Cases
- Multiple children → Separate capsules
- Co-parents → Collaborator model (like Together)
- Parent passes before gift → Legacy fallback
- Child doesn't want it → Archive option

## Pricing Tier Requirements

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Origin Capsule | No | 1 | Unlimited |
| Storage | - | 5GB | 50GB |
| Years Coverage | - | 18 years | 18+ years |
| Drawing Capture | - | Yes | Yes |
| AI Avatar | - | No | Yes |
| Collaborator (Co-parent) | - | No | Yes |

## Emotional Design Considerations

### Long-Term Commitment
- Encourage consistent updates
- Gentle reminders (not naggy)
- "Remember this day last year" prompts
- Celebrate capsule anniversaries

### Privacy for Child
- Child's content, parent's custody
- Consider child's future consent
- No embarrassing content guidelines
- Easy deletion by child after transfer

### Parent's Journey
- Also captures parenting experience
- Reflections on growth
- Lessons learned notes
- Evolution of relationship

### Gift Moment
- Make it special
- Printable letter option
- QR code for in-person reveal
- Shareable moment (optional)
