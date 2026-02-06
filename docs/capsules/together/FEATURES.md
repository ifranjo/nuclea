# Together Capsule - Feature Specifications

## Feature Matrix

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Create Together Capsule | No | Yes | Yes |
| Content Storage | - | 5GB shared | 50GB shared |
| Share Mode | - | Yes | Yes |
| Gift Mode | - | Yes | Yes |
| Real-time Sync | - | Yes | Yes |
| Attribution | - | Yes | Yes |

## Core Features

### F-TOG-001: Share Mode (Collaborative)

**Description:** Two partners co-create and co-own a capsule.

**Ownership Model:**
- Capsule has `owner_id` (original creator)
- Partner added via `collaborators` table
- Both have equal edit rights
- Neither can delete without consent

**Permissions Matrix:**
| Action | Owner | Partner |
|--------|-------|---------|
| Add content | Yes | Yes |
| Edit own content | Yes | Yes |
| Edit partner's content | No | No |
| Delete own content | Yes | Yes |
| Delete partner's content | No | No |
| Invite others | No | No |
| Close capsule | Initiate | Confirm |
| Delete capsule | Both required | Both required |

**Real-time Features:**
- Content appears instantly for both
- "Partner is adding..." indicator
- Conflict resolution: Last write wins (content-level)
- Offline: Queue changes, sync when online

---

### F-TOG-002: Gift Mode (Transfer)

**Description:** Create a capsule to gift to partner with ownership transfer.

**Gift Flow:**
```
Creator Phase:
1. Create capsule → Mark as "gift"
2. Add content (photos, videos, notes)
3. Write gift message (cover note)
4. Set delivery date (optional) or "Send now"
5. Preview as recipient would see
6. Confirm transfer

Transfer Phase:
1. Recipient receives notification
2. "Unwrap" animation on first view
3. Gift message displayed
4. Access to full content
5. Full ownership transferred

Post-Transfer:
- Original creator loses all access
- Cannot undo transfer
- Recipient can edit, close, delete freely
```

**Gift Wrapping UI Elements:**
- Cover design selector (templates)
- Gift message input
- Delivery date picker
- Preview mode
- "Wrap & Send" button

---

### F-TOG-003: Partner Invitation System

**Description:** How one partner invites the other.

**Invitation States:**
```
PENDING → ACCEPTED
        → DECLINED
        → EXPIRED (30 days)
```

**Invitation Email:**
```
Subject: [Nombre] quiere crear recuerdos contigo

¡Hola!

[Nombre] te ha invitado a compartir una cápsula
de recuerdos en NUCLEA.

"[Optional personal message from inviter]"

[Aceptar invitación]

Esta invitación caduca en 30 días.

Con cariño,
NUCLEA
```

**Reminder Schedule:**
- Day 7: First reminder
- Day 21: Second reminder
- Day 29: Final reminder (expires tomorrow)

---

### F-TOG-004: Dual Consent Actions

**Description:** Actions requiring both partners to agree.

**Dual Consent Required For:**
- Closing the capsule
- Deleting the capsule
- (Optional) Deleting partner's content

**Consent Flow:**
```
Partner A initiates → Notification to Partner B
Partner B has 48 hours to respond
  → Accept: Action completes
  → Decline: Action cancelled, A notified
  → No response: Action cancelled, both notified
```

**UI for Initiator:**
```
┌─────────────────────────────────┐
│  Solicitud enviada              │
│                                 │
│  Esperando a [Partner B]...     │
│                                 │
│  Tiempo restante: 47h 23m       │
│                                 │
│  [Cancelar solicitud]           │
└─────────────────────────────────┘
```

**UI for Responder:**
```
┌─────────────────────────────────┐
│  🔔 Solicitud de [Partner A]    │
│                                 │
│  [Partner A] quiere cerrar      │
│  vuestra cápsula compartida.    │
│                                 │
│  [Aceptar]  [Rechazar]          │
└─────────────────────────────────┘
```

---

### F-TOG-005: Content Attribution

**Description:** Showing who added what content.

**Attribution Display:**
```
┌─────────────────────────────────┐
│  [photo]                        │
│                                 │
│  ○ Añadido por Carlos           │
│  📅 15 Ene 2026                 │
└─────────────────────────────────┘
```

**Attribution Options:**
- Show creator avatar
- Show creator name
- Optional: Creator's comment/caption
- Filterable: "Ver solo lo de [Partner]"

---

### F-TOG-006: Timeline Merging

**Description:** How both partners' content appears together.

**Merge Strategy:**
- All content in single chronological timeline
- Sorted by `content_date`
- Visual differentiation by creator (subtle)
- No separation by creator

**Visual Differentiation Options:**
- Border color (Partner A: gold, Partner B: silver)
- Avatar badge on corner
- Name label below
- None (unified view)

---

### F-TOG-007: Breakup Handling

**Description:** What happens if partners separate.

**Options:**
1. **Duplicate & Separate:**
   - Each partner gets copy of all content
   - Original capsule archived
   - Two new individual capsules created

2. **Delete Shared:**
   - Both agree to delete
   - All content removed
   - No recovery

3. **One Keeps:**
   - One partner "buys out" the other
   - Full ownership to one
   - Other loses access

**Implementation:** Manual process, requires customer support for Duplicate & Separate or One Keeps options.

---

### F-TOG-008: Closure Download

**Description:** How downloads work for shared capsules.

**Both Partners Download:**
- Each receives notification when closure confirmed
- Each gets independent download link
- Downloads are identical
- Both must confirm download before server deletion

**Archive Attribution:**
```json
{
  "capsule": {
    "type": "together",
    "mode": "share",
    "partners": [
      { "name": "Carlos", "contentCount": 45 },
      { "name": "María", "contentCount": 52 }
    ]
  },
  "content": [
    {
      "id": "...",
      "creator": "Carlos",
      "creatorId": "uuid"
    }
  ]
}
```

## Data Model Extensions

### Collaborators Table Usage
```sql
INSERT INTO collaborators (
    capsule_id,
    user_id,
    invited_email,
    can_edit,
    can_delete,
    can_invite,
    invitation_sent_at,
    invitation_accepted_at
) VALUES (
    'capsule-uuid',
    NULL,  -- Filled when accepted
    'partner@email.com',
    true,
    false,
    false,
    NOW(),
    NULL
);
```

### Metadata for Together Capsule
```json
{
  "mode": "share",  // or "gift"
  "original_creator_id": "uuid",
  "partner_invited_at": "2026-01-15T10:00:00Z",
  "partner_accepted_at": "2026-01-16T14:00:00Z",
  "closure_request": {
    "initiated_by": "uuid",
    "initiated_at": "2026-06-01T10:00:00Z",
    "status": "pending",  // pending, accepted, declined, expired
    "expires_at": "2026-06-03T10:00:00Z"
  },
  // Gift mode specific
  "gift_message": "Para el amor de mi vida...",
  "gift_cover_template": "romantic-1",
  "gift_scheduled_at": null,
  "gift_delivered_at": null
}
```

## Real-time Implementation

### Supabase Realtime Subscription
```typescript
// Subscribe to capsule content changes
const subscription = supabase
  .channel(`capsule:${capsuleId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'contents',
      filter: `capsule_id=eq.${capsuleId}`
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        // New content added by partner
        addToTimeline(payload.new);
        showNotification(`${partnerName} añadió un recuerdo`);
      }
    }
  )
  .subscribe();
```

### Presence Indicator
```typescript
// Show when partner is active
const presence = supabase.channel(`presence:${capsuleId}`);

presence
  .on('presence', { event: 'sync' }, () => {
    const state = presence.presenceState();
    setPartnerOnline(Object.keys(state).length > 1);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presence.track({
        user_id: userId,
        online_at: new Date().toISOString()
      });
    }
  });
```

## Analytics Events

```typescript
// Together-specific events
'together.created'
'together.mode_selected'  // share or gift
'together.partner_invited'
'together.partner_accepted'
'together.partner_declined'
'together.content_added'  // with creator attribution
'together.closure_requested'
'together.closure_accepted'
'together.closure_declined'
'together.gift_wrapped'
'together.gift_delivered'
'together.gift_opened'
```

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| Partner not found | "No encontramos esa dirección" | Re-enter email |
| Partner already invited | "Ya has enviado una invitación" | Wait or cancel |
| Invite expired | "La invitación ha caducado" | Send new invite |
| Partner offline (sync) | "Los cambios se sincronizarán" | Queue locally |
| Closure conflict | "Solicitud en curso" | Wait for response |
