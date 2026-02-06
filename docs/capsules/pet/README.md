# Pet Capsule

**Type ID:** `pet`
**Purpose:** Pet memorial
**AI Avatar:** No
**Priority:** LOW-MEDIUM

## Overview

The Pet capsule is designed for preserving memories of beloved pets. It's emotionally significant and serves as a memorial space, typically created after a pet passes or as an ongoing memory collection.

## Key Characteristics

- Simpler feature set than human-focused capsules
- Emphasis on photos, videos, and audio (barks, purrs, etc.)
- Manual closure only (no inactivity triggers)
- No recipients by default (private memorial)
- Optional sharing with family members

## User Flow (from PDF: NUCLEA_PET CAPSULE.pdf)

```
1. Create Pet Capsule
   ├── Pet name
   ├── Species (dog, cat, bird, etc.)
   ├── Birth date (optional)
   ├── Passing date (optional)
   └── Cover photo

2. Add Memories
   ├── Photos (daily life, adventures)
   ├── Videos (playing, tricks)
   ├── Audio (sounds, barks, meows)
   └── Notes (stories, funny moments)

3. Organize Timeline
   └── Calendar view by date

4. Optional: Share with Family
   ├── Add family members as viewers
   └── Collaborative adding (optional)

5. Closure (when ready)
   ├── Owner decides when complete
   ├── Download archive
   └── Delete from servers
```

## Features

### Pet-Specific Metadata
- Species selection (preset list + custom)
- Breed (optional)
- Birth date and passing date
- Special characteristics/traits

### Audio Emphasis
- Audio content type is especially valuable
- Pet sounds as memories (barks, meows, purrs)
- Voice recordings of pet's name
- Easy recording interface

### Memorial Mode
- Special view for after pet passes
- "In loving memory" header option
- Date range: Birth → Passing
- Tribute page layout

### Family Sharing
- Unlike Social capsule, sharing is optional
- Family members can view but not edit (default)
- Option to allow collaborative adding
- Useful for families who shared the pet

## Database Specifics

### Metadata JSONB Structure
```json
{
  "pet_name": "Max",
  "species": "dog",
  "breed": "Golden Retriever",
  "birth_date": "2015-06-10",
  "passing_date": "2026-01-20",
  "traits": ["playful", "loyal", "loves swimming"],
  "memorial_mode": true,
  "family_sharing_enabled": true,
  "collaborators_can_add": false
}
```

### Simplified Recipients
```sql
-- Pet capsule recipients are "family viewers"
INSERT INTO recipients (
    capsule_id,
    email,
    name,
    relationship,
    can_view,
    can_download
) VALUES (
    'capsule-uuid',
    'familia@email.com',
    'Ana',
    'familia',
    true,
    true  -- Usually allowed to download memorial
);
```

## UI Components (from PDF)

### Main View
- Large cover photo of pet
- Pet name prominently displayed
- Birth/Passing dates (if set)
- Content grid or timeline

### Pet Profile Card
- Avatar (pet photo, circular)
- Name, species, breed
- Age/lifespan display
- Quick stats (X photos, Y videos)

### Memory Addition
- Camera-first interface
- "Record Sound" prominent for audio
- Quick date picker
- Minimal text input

### Memorial Layout
- "In Loving Memory" banner (optional)
- Chronological slideshow option
- Background music option (user's audio)
- Print-ready layout for physical memorial

### Calendar View
- Same as other capsules
- Special icons for pet (paw prints)
- Memorial dates highlighted

## Technical Implementation Notes

### Species List
```typescript
const SPECIES_OPTIONS = [
  { id: 'dog', label: 'Perro', icon: '🐕' },
  { id: 'cat', label: 'Gato', icon: '🐈' },
  { id: 'bird', label: 'Pájaro', icon: '🐦' },
  { id: 'fish', label: 'Pez', icon: '🐟' },
  { id: 'rabbit', label: 'Conejo', icon: '🐰' },
  { id: 'hamster', label: 'Hámster', icon: '🐹' },
  { id: 'turtle', label: 'Tortuga', icon: '🐢' },
  { id: 'horse', label: 'Caballo', icon: '🐴' },
  { id: 'other', label: 'Otro', icon: '🐾' },
];
```

### Audio Handling
- Max duration: 5 minutes
- Formats: MP3, M4A, WAV
- Waveform visualization
- Easy playback controls

### Memorial Features
- Date calculations: Age at passing
- Time since passing display
- Anniversary reminders (optional)
- Slideshow generator for download

### Edge Cases
- No passing date → Active pet memorial
- Multiple pets → Separate capsules recommended
- Pet still alive → Normal capsule, memorial mode later
- Family disagreement → Owner has final control

## Pricing Tier Requirements

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Pet Capsule | 1 | 2 | Unlimited |
| Storage | 500MB | 5GB | 50GB |
| Family Sharing | No | Yes | Yes |
| Memorial Mode | Yes | Yes | Yes |

## Emotional Design Considerations

### Sensitivity
- Avoid "delete" language near memories
- Soft confirmations for closure
- Supportive copy: "When you're ready..."
- No aggressive prompts

### Memorial as Healing
- Creating the capsule is part of grieving process
- No time pressure
- Option to revisit and add memories over time
- Closure when emotionally ready

### Family Dynamics
- Shared pets, shared memories
- Avoid conflicts over ownership
- Clear permissions model
- Everyone can keep a copy
