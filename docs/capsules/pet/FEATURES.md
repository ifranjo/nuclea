# Pet Capsule - Feature Specifications

## Feature Matrix

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Create Pet Capsule | 1 | 2 | Unlimited |
| Content Storage | 500MB | 5GB | 50GB |
| Family Sharing | No | Yes | Yes |
| Memorial Mode | Yes | Yes | Yes |
| Audio Recording | Yes | Yes | Yes |

## Core Features

### F-PET-001: Pet Profile

**Description:** Core pet information displayed prominently.

**Profile Fields:**
```typescript
interface PetProfile {
  name: string;
  species: SpeciesType;
  breed?: string;
  birthDate?: Date;
  passingDate?: Date;
  traits?: string[];  // ["playful", "loyal", "loves swimming"]
  profilePhoto: string;
}

type SpeciesType =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'fish'
  | 'rabbit'
  | 'hamster'
  | 'turtle'
  | 'horse'
  | 'other';
```

**Profile Display:**
```
┌─────────────────────────────────┐
│        ┌──────────┐             │
│        │  [foto]  │             │
│        └──────────┘             │
│           Max                   │
│     Golden Retriever            │
│                                 │
│  🎂 10 Jun 2015 - 20 Ene 2026  │
│     10 años, 7 meses            │
│                                 │
│  💝 Juguetón · Leal · Nadador  │
│                                 │
│  📷 234 fotos · 🎬 45 videos    │
└─────────────────────────────────┘
```

---

### F-PET-002: Species Presets

**Description:** Preset species with relevant icons and defaults.

**Species List:**
```typescript
const SPECIES_OPTIONS = [
  { id: 'dog', label: 'Perro', icon: '🐕', defaultTraits: ['leal', 'juguetón'] },
  { id: 'cat', label: 'Gato', icon: '🐈', defaultTraits: ['independiente', 'curioso'] },
  { id: 'bird', label: 'Pájaro', icon: '🐦', defaultTraits: ['cantarín', 'colorido'] },
  { id: 'fish', label: 'Pez', icon: '🐟', defaultTraits: ['tranquilo', 'hipnótico'] },
  { id: 'rabbit', label: 'Conejo', icon: '🐰', defaultTraits: ['tierno', 'saltarín'] },
  { id: 'hamster', label: 'Hámster', icon: '🐹', defaultTraits: ['activo', 'pequeñito'] },
  { id: 'turtle', label: 'Tortuga', icon: '🐢', defaultTraits: ['tranquilo', 'longevo'] },
  { id: 'horse', label: 'Caballo', icon: '🐴', defaultTraits: ['noble', 'majestuoso'] },
  { id: 'other', label: 'Otro', icon: '🐾', defaultTraits: [] },
];
```

---

### F-PET-003: Audio Emphasis

**Description:** Special support for capturing pet sounds.

**Why Audio Matters:**
- Barks, meows, purrs are irreplaceable
- Voice memories (calling pet's name)
- Unique sounds (snoring, playing)

**Audio Capture UI:**
```
┌─────────────────────────────────┐
│  🎤 Grabar sonido              │
│                                 │
│  Captura los sonidos únicos     │
│  de [Max]: ladridos, ronquidos, │
│  juegos...                      │
│                                 │
│         ◉ 00:00                │
│                                 │
│   ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁             │
│                                 │
│  [Tap para grabar]              │
└─────────────────────────────────┘
```

**Audio Metadata:**
```typescript
interface PetAudioMetadata {
  soundType?: 'bark' | 'meow' | 'purr' | 'chirp' | 'play' | 'sleep' | 'other';
  context?: string;  // "Cuando llegaba a casa"
  durationSeconds: number;
}
```

---

### F-PET-004: Memorial Mode

**Description:** Special mode activated after pet passes.

**Activation:**
- User sets `passingDate` in profile
- System asks: "¿Quieres activar el modo memorial?"
- Memorial mode changes UI tone

**Memorial UI Changes:**
- "En memoria de [Name]" header
- Lifespan display: "10 Jun 2015 - 20 Ene 2026"
- Age at passing calculation
- Subtle visual changes (softer tones)
- "Tribute" layout option

**Tribute View:**
```
┌─────────────────────────────────┐
│  En memoria de                  │
│         MAX                     │
│                                 │
│    🐕 Golden Retriever          │
│    10 años de amor              │
│                                 │
│  "El mejor amigo que pudimos    │
│   haber tenido"                 │
│                                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │foto│ │foto│ │foto│ │foto│  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
│  [Ver todas las fotos]          │
│  [Escuchar sus sonidos]         │
└─────────────────────────────────┘
```

---

### F-PET-005: Family Sharing

**Description:** Share pet capsule with family members.

**Sharing Model:**
- Owner invites family members
- Family can VIEW all content
- Family can ADD content (optional, configurable)
- Only owner can edit/delete

**Permission Levels:**
```typescript
interface FamilySharingPermissions {
  canView: boolean;      // Always true if invited
  canAdd: boolean;       // Configurable
  canDownload: boolean;  // Configurable
}
```

**Use Cases:**
- Parents share with children
- Siblings share family pet
- Partner shares pet memories

**Invitation Flow:**
```
1. Owner taps "Compartir con familia"
2. Enter family member email
3. Set permissions
4. Send invitation
5. Family member accepts
6. Capsule appears in their dashboard (read-only or with add)
```

---

### F-PET-006: Timeline by Age

**Description:** Organize content by pet's age.

**Age Calculation:**
```typescript
function calculatePetAge(birthDate: Date, contentDate: Date): string {
  const years = differenceInYears(contentDate, birthDate);
  const months = differenceInMonths(contentDate, birthDate) % 12;

  if (years === 0) {
    return `${months} mes${months !== 1 ? 'es' : ''}`;
  }
  if (months === 0) {
    return `${years} año${years !== 1 ? 's' : ''}`;
  }
  return `${years} año${years !== 1 ? 's' : ''}, ${months} mes${months !== 1 ? 'es' : ''}`;
}
```

**Timeline Display:**
```
┌─────────────────────────────────┐
│  Cachorro (0-1 año)             │
│  ├── Llegada a casa             │
│  ├── Primer baño                │
│  └── Vacunas                    │
│                                 │
│  Joven (1-3 años)               │
│  ├── Aprendiendo trucos         │
│  └── Viaje a la playa           │
│                                 │
│  Adulto (3-7 años)              │
│  └── ...                        │
│                                 │
│  Senior (7+ años)               │
│  └── ...                        │
└─────────────────────────────────┘
```

---

### F-PET-007: Closure as Memorial

**Description:** Special closure flow for pet capsules.

**Closure Message:**
```
┌─────────────────────────────────┐
│  Cerrar memorial de [Max]       │
│                                 │
│  Has creado un hermoso          │
│  tributo a [Max].               │
│                                 │
│  Al cerrar:                     │
│  • Descargarás todos los        │
│    recuerdos                    │
│  • Podrás verlos siempre        │
│    desde la app                 │
│  • Podemos borrar del servidor  │
│    cuando confirmes             │
│                                 │
│  [Cerrar cuando esté listo]     │
└─────────────────────────────────┘
```

**Soft Language:**
- "Cuando estés listo" not "Cerrar ahora"
- "Tu tributo" not "Tus archivos"
- No urgency, user decides timing

---

### F-PET-008: Anniversary Reminders

**Description:** Optional reminders on significant dates.

**Reminder Types:**
- Birth anniversary: "Hoy [Max] cumpliría X años"
- Passing anniversary: "Hace X año que [Max] nos dejó"
- First memory anniversary: "Hace X años que empezaste este memorial"

**Notification:**
```
┌─────────────────────────────────┐
│  🐕 Recuerdo de Max             │
│                                 │
│  Hoy hace 1 año que Max         │
│  llegó a tu vida.               │
│                                 │
│  [Ver recuerdos de ese día]     │
│  [Añadir un nuevo recuerdo]     │
└─────────────────────────────────┘
```

**Settings:**
```typescript
interface PetReminderSettings {
  birthAnniversary: boolean;
  passingAnniversary: boolean;
  firstMemoryAnniversary: boolean;
  customReminders: Array<{
    date: Date;
    label: string;
  }>;
}
```

## Data Model Extensions

### Metadata for Pet Capsule
```json
{
  "pet_name": "Max",
  "species": "dog",
  "breed": "Golden Retriever",
  "birth_date": "2015-06-10",
  "passing_date": "2026-01-20",
  "traits": ["juguetón", "leal", "le encanta nadar"],
  "memorial_mode": true,
  "family_sharing_enabled": true,
  "family_can_add": false,
  "reminders": {
    "birth_anniversary": true,
    "passing_anniversary": true
  }
}
```

### Family Viewers (using Recipients)
```sql
INSERT INTO recipients (
    capsule_id,
    email,
    name,
    relationship,
    can_view,
    can_download
) VALUES (
    'capsule-uuid',
    'hermano@email.com',
    'Carlos',
    'hermano',
    true,
    true
);

-- Additional field in metadata or separate column
-- for "can_add" permission specific to Pet capsule
```

## Emotional Design Guidelines

### Language Tone
| Avoid | Use Instead |
|-------|-------------|
| "Delete" | "Quitar" or "Eliminar recuerdo" |
| "Close capsule now" | "Cerrar cuando estés listo" |
| "Your pet died" | "Tu compañero ya no está" |
| "Archive" | "Memorial" or "Tributo" |

### UI Considerations
- Soft colors, nothing harsh
- Gentle transitions
- No sudden deletions without multiple confirms
- Supportive microcopy

### Error Messages
- Instead of: "Error al subir"
- Use: "No pudimos guardar este recuerdo. ¿Intentamos de nuevo?"

## Analytics Events

```typescript
// Pet-specific events
'pet.created'
'pet.species_selected'
'pet.profile_completed'
'pet.audio_recorded'
'pet.memorial_mode_enabled'
'pet.family_shared'
'pet.family_content_added'
'pet.anniversary_reminded'
'pet.closure_initiated'
'pet.closure_completed'
```
