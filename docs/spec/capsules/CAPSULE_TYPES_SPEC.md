# NUCLEA - Capsule Types Specification

**Source:** 12 PDF mockups from `DISEÑO_ANDREA_PANTALLAS/`
**Last Updated:** Feb 2026

---

## Overview

NUCLEA supports 6 capsule types, each with distinct UI patterns, workflows, and data requirements.

---

## Capsule Type Matrix

| Type | Purpose | AI Avatar | Shared | Recipients | Complexity |
|------|---------|-----------|--------|------------|------------|
| **Legacy** | Post-mortem inheritance | ✓ EverLife | ✗ | Designated beneficiaries | High |
| **Together** | Couples shared memories | ✗ | ✓ | Partner | Medium |
| **Social** | Private diary (friends) | ✗ | ✗ | Selected friends | Low |
| **Pet** | Pet memorial | ✗ | ✗ | Owner only | Low |
| **Life Chapter** | Document life stages | Optional | ✗ | Self | Medium |
| **Origin** | Parents → children | Optional | ✗ | Children | Medium |

---

## 1. Legacy Capsule

**PDF Source:** `N UCLEA_LEGACY CAPSULE.pdf`, `NUCLEA_LEGACY MENSJ FUUROS.pdf`

### Purpose
Post-mortem digital inheritance with AI avatar (EverLife).

### Key Features
- **Avatar creation:** User records video/audio for AI training
- **Beneficiary designation:** Multiple recipients with access rules
- **Future messages:** Scheduled delivery after death
- **Verification flow:** Death certificate or trustee verification

### UI Screens
1. **Avatar Recording**
   - Video capture prompt
   - Script suggestions for natural responses
   - Sample questions for user to answer

2. **Beneficiary Setup**
   - Add recipients (name, email, relationship)
   - Set access levels (full, partial, specific content)
   - Backup contact (trustee)

3. **Future Messages**
   - Calendar picker for scheduled delivery
   - Message composer (text, video, audio)
   - Preview modal

### Data Schema

```typescript
interface LegacyCapsule {
  id: string;
  type: 'legacy';
  creator_id: string;
  avatar_config: {
    everlife_enabled: boolean;
    training_videos: string[];  // Storage URLs
    voice_samples: string[];
    personality_traits?: string[];
  };
  beneficiaries: Array<{
    id: string;
    name: string;
    email: string;
    relationship: string;
    access_level: 'full' | 'partial' | 'custom';
    custom_access?: string[];  // Content IDs
  };
  trustee: {
    name: string;
    email: string;
    verification_method: 'certificate' | 'manual';
  };
  future_messages: Array<{
    id: string;
    content: string;
    media_urls: string[];
    scheduled_delivery: Date;  // Triggered by death verification
    delivered: boolean;
  }>;
  death_verification: {
    status: 'pending' | 'verified' | 'delivered';
    certificate_url?: string;
    verified_at?: Date;
  };
  created_at: Date;
  updated_at: Date;
}
```

---

## 2. Together Capsule

**PDF Source:** `NUCLEA_TOGETHER CAPSULE_COMPARTIR.pdf`, `NUCLEA_TOGETHER_REGALAR.pdf`

### Purpose
Shared memory capsule for couples/partners.

### Key Features
- **Dual ownership:** Both partners can add content
- **Gift mode:** One partner creates, sends to other
- **Shared timeline:** Unified view of relationship milestones
- **Anniversary reminders:** Optional notifications

### UI Screens
1. **Partner Invite**
   - Enter partner email
   - Personal invitation message
   - Acceptance pending state

2. **Gift Flow**
   - Select capsule template
   - Add initial memories
   - Schedule delivery date (surprise)

3. **Shared Timeline**
   - Chronological feed of memories
   - Filter by date, type, or contributor
   - React/comment on memories

### Data Schema

```typescript
interface TogetherCapsule {
  id: string;
  type: 'together';
  owners: [string, string];  // Two user IDs
  status: 'pending' | 'active' | 'archived';
  gift_mode: boolean;
  gift_metadata?: {
    sender_id: string;
    recipient_id: string;
    delivery_date: Date;
    delivered: boolean;
  };
  memories: Array<{
    id: string;
    contributor_id: string;
    type: 'photo' | 'video' | 'text' | 'audio';
    content: string;
    media_urls?: string[];
    timestamp: Date;
    location?: string;
    tags?: string[];
  }>;
  anniversary_date?: Date;
  reminder_enabled: boolean;
  created_at: Date;
}
```

---

## 3. Social Capsule

**PDF Source:** `NUCLEA_SOCIAL CAPSULE.pdf`

### Purpose
Private diary shared with selected friends.

### Key Features
- **Friend selection:** Choose who sees what
- **Privacy groups:** Different content for different friends
- **Reaction system:** Friends can react to content
- **Time capsule:** Optional delayed reveal

### Data Schema

```typescript
interface SocialCapsule {
  id: string;
  type: 'social';
  creator_id: string;
  friends: Array<{
    user_id: string;
    access_level: 'all' | 'filtered';
    tags_visible?: string[];
  }>;
  entries: Array<{
    id: string;
    content: string;
    media_urls: string[];
    visible_to: 'all' | string[];  // User IDs or 'all'
    reactions?: Array<{
      user_id: string;
      emoji: string;
    }>;
    created_at: Date;
  }>;
  reveal_date?: Date;  // Optional time capsule
}
```

---

## 4. Pet Capsule

**PDF Source:** `NUCLEA_PET CAPSULE.pdf`

### Purpose
Memorial and memories for beloved pets.

### Key Features
- **Pet profile:** Name, breed, photos, lifespan
- **Memory timeline:** From adoption to passing
- **Rainbow Bridge:** Memorial section
- **Paw prints:** Virtual paw print stamp

### Data Schema

```typescript
interface PetCapsule {
  id: string;
  type: 'pet';
  owner_id: string;
  pet: {
    name: string;
    breed?: string;
    birth_date?: Date;
    passing_date?: Date;
    photos: string[];
  };
  memories: Array<{
    id: string;
    date: Date;
    content: string;
    media_urls: string[];
    memory_type: 'milestone' | 'moment' | 'memorial';
  }>;
  rainbow_bridge_message?: string;
}
```

---

## 5. Life Chapter Capsule

**PDF Source:** `NUCLEA_LIFE CHAPTER.pdf`

### Purpose
Document specific life stages (childhood, career, etc.).

### Key Features
- **Chapter definition:** Time period + theme
- **Progressive building:** Add over time
- **Chapter export:** Download as PDF/book
- **Privacy control:** Private, shared, or public

### Data Schema

```typescript
interface LifeChapterCapsule {
  id: string;
  type: 'life_chapter';
  user_id: string;
  chapter: {
    title: string;
    start_date: Date;
    end_date?: Date;  // null if ongoing
    theme: string;
    cover_image?: string;
  };
  privacy: 'private' | 'shared' | 'public';
  content: Array<{
    id: string;
    type: 'milestone' | 'reflection' | 'media';
    title: string;
    content: string;
    media_urls?: string[];
    date: Date;
  }>;
}
```

---

## 6. Origin Capsule

**PDF Source:** `NUCLEA_TOGETHER_REGALAR.pdf` (parent-child pattern)

### Purpose
Messages from parents to children (digital inheritance).

### Key Features
- **Parent as creator:** Parent initiates
- **Child as recipient:** Receives at milestone or death
- **Wisdom transfer:** Life lessons, family history
- **Milestone delivery:** Birthday, graduation, wedding

### Data Schema

```typescript
interface OriginCapsule {
  id: string;
  type: 'origin';
  parent_id: string;
  children: string[];  // User IDs
  delivery_triggers: Array<{
    child_id: string;
    trigger: 'milestone' | 'death' | 'manual';
    milestone?: string;  // '18th_birthday', 'graduation', etc.
    delivered: boolean;
  }>;
  content: {
    family_history?: string;
    life_lessons?: string;
    recipes?: string[];
    photos?: string[];
    videos?: string[];
    personal_messages: Array<{
      for_child: string;
      message: string;
    }>;
  };
}
```

---

## Shared Capsule Properties

All capsule types inherit:

```typescript
interface BaseCapsule {
  id: string;
  type: CapsuleType;
  created_at: Date;
  updated_at: Date;
  storage_used: number;  // bytes
  thumbnail_url?: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
}

type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life_chapter' | 'origin';
```

---

## UI Component: Capsule Card

Used on landing page and capsule selection screens.

```tsx
interface CapsuleCardProps {
  type: CapsuleType;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}
```

**Visual states:**
- Default: Gray border, dark surface
- Hover: Gold border, slight lift
- Selected: Gold border, gold glow
- Disabled: Dimmed, no hover effect

---

## Storage Requirements per Capsule

| Type | Avg Storage | Max Storage | Primary Content |
|------|-------------|-------------|-----------------|
| Legacy | 2GB | 100GB | Avatar training videos |
| Together | 500MB | 10GB | Shared photos/videos |
| Social | 200MB | 5GB | Text + images |
| Pet | 100MB | 2GB | Pet photos |
| Life Chapter | 1GB | 20GB | Documents + media |
| Origin | 500MB | 10GB | Family media |

---

## Implementation Priority

1. **Phase 1 (MVP):** Legacy, Social
2. **Phase 2:** Together, Pet
3. **Phase 3:** Life Chapter, Origin

---

*Extracted from: DISEÑO_ANDREA_PANTALLAS/*.pdf*
*Last verified: Feb 2026*
