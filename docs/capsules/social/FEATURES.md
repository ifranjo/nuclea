# Social Capsule - Feature Specifications

## Feature Matrix

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Create Social Capsule | No | 1 | Unlimited |
| "Mis Socials" (Friends) | - | 10 | 20 |
| Content Storage | - | 5GB | 50GB |
| Reactions | - | Yes | Yes |
| Multiple Capsules | - | No | Yes |

## Core Features

### F-SOC-001: "Mis Socials" Concept

**Description:** Hand-picked close friends who see your private posts.

**Philosophy:**
- NOT followers or connections
- People you'd naturally text
- Quality over quantity
- Intimate sharing circle

**Limits:**
- Esencial: Max 10 socials
- Familiar: Max 20 socials

**Selection Criteria (UX guidance):**
- "¿Le enviarías esto por WhatsApp?" → If yes, add them
- "¿Te importa su opinión?" → If yes, add them
- "¿Confías en que no lo comparta?" → If yes, add them

---

### F-SOC-002: Anti-Algorithm Feed

**Description:** Strictly chronological content display.

**Implementation:**
```sql
-- Feed query (no algorithm, pure chronological)
SELECT c.*, u.display_name, u.avatar_url
FROM contents c
JOIN capsules cap ON c.capsule_id = cap.id
JOIN users u ON cap.owner_id = u.id
WHERE cap.id IN (
    -- Capsules where user is a recipient
    SELECT capsule_id FROM recipients
    WHERE email = current_user_email()
    AND can_view = true
)
OR cap.owner_id = current_user_id()  -- User's own
ORDER BY c.content_date DESC, c.created_at DESC
LIMIT 20 OFFSET :offset;
```

**No "smart" features:**
- No "top posts"
- No "you might like"
- No "trending"
- No reordering based on engagement
- No promotional content

---

### F-SOC-003: Private Reactions

**Description:** Emoji-only reactions, not publicly visible.

**Reaction System:**
- Single emoji per person per content
- Reactions not shown as counts
- Creator sees who reacted (list)
- Others don't see reactions at all

**Available Reactions:**
```typescript
const REACTIONS = ['❤️', '😂', '😢', '🔥', '👏', '🤗'];
```

**UI Behavior:**
- Long-press to react
- Reaction appears subtly on creator's view
- No notification for reactions (optional toggle)
- Reactions list accessible via tap

**Creator's View:**
```
┌─────────────────────────────────┐
│  [Photo]                        │
│                                 │
│  ❤️ 3  😂 1                     │  ← Only creator sees
│  Tap to see who                 │
└─────────────────────────────────┘
```

**Public View (other socials):**
```
┌─────────────────────────────────┐
│  [Photo]                        │
│                                 │
│  (No reactions visible)         │
└─────────────────────────────────┘
```

---

### F-SOC-004: No Engagement Metrics

**Description:** Removing performance pressure.

**Hidden Metrics:**
- No like counts
- No view counts
- No share counts (sharing disabled)
- No "seen by" indicators
- No read receipts

**Why:**
- Removes "posting for likes" behavior
- Encourages authentic sharing
- No FOMO from comparing engagement
- Focus on memories, not performance

---

### F-SOC-005: Posting Flow

**Description:** Simplified content creation.

**Flow:**
```
1. Tap FAB (+)
2. Select content type (photo/video/audio/note)
3. Capture or select from gallery
4. Date auto-set (today) - editable
5. No caption required
6. "Post to Mis Socials" button
7. Done - appears in friends' feeds
```

**Minimal UI Elements:**
- No filters
- No hashtags
- No location tagging
- No mentions
- No polls or interactive elements

**Optional Elements:**
- Description (brief caption)
- Backdate to past date

---

### F-SOC-006: Feed View

**Description:** How content appears in the feed.

**Content Card:**
```
┌─────────────────────────────────┐
│  ○ Carlos · 15 Ene             │
│  ───────────────────────────── │
│                                 │
│  [Full-width content]           │
│                                 │
│  ───────────────────────────── │
│  "Brief description if any"     │
└─────────────────────────────────┘
```

**Card Elements:**
- Creator avatar + name
- Post date (relative or absolute)
- Content (photo/video/audio player/note text)
- Optional description
- Long-press for reaction (subtle indicator)

**No Card Elements:**
- Engagement counts
- Comment section
- Share button
- Save/bookmark

---

### F-SOC-007: Calendar View

**Description:** Browse content by date.

**Implementation:**
- Month grid view
- Days with content highlighted
- Tap day to see that day's posts
- Scroll between months
- Filter by person (own or friend)

**Use Cases:**
- "What did we do last March?"
- "Show me Carlos's posts from December"
- Find specific memory by date

---

### F-SOC-008: Friend Management

**Description:** Adding and removing "Mis Socials."

**Add Friend:**
1. Tap "Mis Socials" section
2. Tap "+"
3. Enter email
4. System sends invitation
5. Friend accepts → Added to list
6. Friend creates account (if new)

**Remove Friend:**
- Swipe to remove
- Confirm dialog
- Friend loses access to future posts
- Friend keeps access to past posts they've already seen

**Friend List UI:**
```
┌─────────────────────────────────┐
│  Mis Socials (8/10)             │
│  ───────────────────────────── │
│  ○ María     ✓ Active           │
│  ○ Carlos    ✓ Active           │
│  ○ Ana       ⏳ Pending         │
│  ○ Luis      ✓ Active           │
│  ...                            │
│  [+ Añadir amigo]               │
└─────────────────────────────────┘
```

---

### F-SOC-009: Closure Options

**Description:** What happens when closing Social capsule.

**Option A: Private Archive**
- Download for self only
- Friends don't receive
- Personal diary preserved

**Option B: Share Archive with Friends**
- Each friend receives download option
- Same 30-day window
- Each friend decides to download or not

**Notification to Friends:**
```
Subject: [Nombre] ha cerrado su cápsula

[Nombre] ha decidido cerrar su espacio de recuerdos.

Si quieres conservar lo que compartió, puedes
descargarlo durante los próximos 30 días.

[Ver y descargar]

Gracias por ser parte de sus momentos.

NUCLEA
```

## Data Model Extensions

### Recipients as "Socials"
```sql
-- For Social capsule, recipients = "Mis Socials"
INSERT INTO recipients (
    capsule_id,
    email,
    name,
    relationship,
    can_view,
    can_download,  -- Only on closure, if owner allows
    notify_on_closure
) VALUES (
    'capsule-uuid',
    'amigo@email.com',
    'Carlos',
    'amigo',
    true,
    false,  -- Updated to true if owner shares on closure
    false
);
```

### Content Reactions Table
```sql
CREATE TABLE IF NOT EXISTS content_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (emoji IN ('❤️', '😂', '😢', '🔥', '👏', '🤗')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, user_id)
);

-- RLS: Only content creator can see reactions
CREATE POLICY "Only creator sees reactions" ON content_reactions
    FOR SELECT USING (
        content_id IN (
            SELECT c.id FROM contents c
            JOIN capsules cap ON c.capsule_id = cap.id
            WHERE cap.owner_id = auth.uid()
        )
    );

-- Anyone can react to content they can view
CREATE POLICY "Can react to viewable content" ON content_reactions
    FOR INSERT WITH CHECK (
        content_id IN (
            SELECT c.id FROM contents c
            JOIN capsules cap ON c.capsule_id = cap.id
            JOIN recipients r ON r.capsule_id = cap.id
            WHERE r.email = auth.email() AND r.can_view = true
        )
    );
```

### Metadata for Social Capsule
```json
{
  "max_socials": 10,
  "reactions_enabled": true,
  "closure_share_with_friends": false,
  "viewing_mode_default": "timeline"  // or "calendar"
}
```

## Feed Construction

### Query for User's Feed
```typescript
async function getSocialFeed(userId: string, offset: number = 0) {
  // 1. Get capsules where user is a "social"
  const { data: accessibleCapsules } = await supabase
    .from('recipients')
    .select('capsule_id')
    .eq('email', userEmail)
    .eq('can_view', true);

  // 2. Get user's own social capsules
  const { data: ownCapsules } = await supabase
    .from('capsules')
    .select('id')
    .eq('owner_id', userId)
    .eq('type', 'social');

  // 3. Combine and fetch content
  const capsuleIds = [
    ...accessibleCapsules.map(r => r.capsule_id),
    ...ownCapsules.map(c => c.id)
  ];

  const { data: content } = await supabase
    .from('contents')
    .select(`
      *,
      capsules!inner (
        owner_id,
        users!inner (display_name, avatar_url)
      )
    `)
    .in('capsule_id', capsuleIds)
    .order('content_date', { ascending: false })
    .range(offset, offset + 19);

  return content;
}
```

## Comparison Table

| Feature | Instagram | TikTok | NUCLEA Social |
|---------|-----------|--------|---------------|
| Audience | Public/followers | Public | 10-20 friends |
| Algorithm | Yes | Yes | No |
| Likes visible | Yes | Yes | No |
| Comments | Yes | Yes | No |
| Shares | Yes | Yes | No |
| DMs | Yes | Yes | No (use your phone) |
| Stories | Yes | No | No |
| Reels | No | Yes | No |
| Ads | Yes | Yes | No |
| Data selling | Yes | Yes | No |
| Purpose | Performance | Entertainment | Authenticity |

## Analytics Events

```typescript
// Social-specific events
'social.created'
'social.friend_invited'
'social.friend_accepted'
'social.friend_removed'
'social.content_posted'
'social.reaction_added'
'social.feed_viewed'
'social.calendar_viewed'
'social.closure_started'
'social.closure_shared'  // with friends
'social.friend_downloaded'
```
