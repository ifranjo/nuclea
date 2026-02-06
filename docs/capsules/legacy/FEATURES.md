# Legacy Capsule - Feature Specifications

## Feature Matrix

| Feature | Free | Esencial | Familiar | EverLife |
|---------|------|----------|----------|----------|
| Create Legacy Capsule | No | No | Yes | Yes |
| Content Storage | - | - | 50GB | 100GB |
| Recipients | - | - | 10 | Unlimited |
| Trusted Contacts | - | - | 3 | 10 |
| Future Messages | - | - | 5 | Unlimited |
| AI Avatar | - | - | No | Yes |
| Inactivity Period | - | - | 6-12 mo | 3-12 mo |
| Video Messages | - | - | 10 min max | 30 min max |

## Core Features

### F-LEG-001: Inactivity Detection System

**Description:** Monitors user activity and triggers delivery workflow after configured inactivity period.

**Configuration Options:**
- Inactivity period: 6 months (default) or 12 months
- Verification attempts before trigger: 3 (email) + 1 (trusted contact)
- Grace period after verification: 30 days

**Activity Events That Reset Timer:**
- App login
- Content upload
- Content edit
- Settings change
- Manual "I'm still here" button

**Workflow:**
```
Day 0: Last activity recorded
Day 180 (6mo): First warning email
Day 187: Second warning email
Day 194: Third warning email + push notification
Day 201: Contact trusted person
Day 231: If no response → Trigger delivery
```

**Database Fields:**
```sql
users.last_active_at       -- Timestamp of last activity
capsules.metadata->>'inactivity_months'
capsules.metadata->>'last_verification_sent'
capsules.metadata->>'delivery_status'  -- 'pending', 'warning_sent', 'triggered', 'delivered'
```

---

### F-LEG-002: Trusted Contacts

**Description:** Secondary verification layer to prevent false triggers.

**Purpose:**
- Verify creator's status before delivery
- Can delay/cancel delivery if creator is incapacitated but alive
- Emergency contact if email fails

**Data Model:**
```typescript
interface TrustedContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;  // "hermano", "amigo", "abogado"
  canCancelDelivery: boolean;
  addedAt: Date;
  lastVerificationAt?: Date;
}
```

**Permissions:**
- View capsule status: No
- View capsule content: No
- Cancel delivery: Yes (within grace period)
- Delay delivery: Yes (up to 60 days)
- Confirm creator deceased: Yes

---

### F-LEG-003: Recipient Management

**Description:** Define who receives the capsule contents.

**Recipient Fields:**
```typescript
interface Recipient {
  id: string;
  email: string;
  name: string;
  phone?: string;
  relationship: string;
  permissions: {
    canView: boolean;
    canDownload: boolean;
  };
  deliveryPreferences: {
    notifyOnClosure: boolean;
    notifyOnInactivity: boolean;
    deliveryDelay?: number;  // Days after trigger
  };
  invitationStatus: 'pending' | 'accepted' | 'declined';
}
```

**Invitation Flow:**
1. Creator adds recipient (email, name, relationship)
2. System sends invitation email
3. Recipient can preview (limited) or accept
4. After acceptance, recipient appears in creator's list
5. Recipient can set notification preferences

---

### F-LEG-004: Future Messages

**Description:** Time-locked content within the capsule.

**See:** `docs/flows/FUTURE_MESSAGES.md` for detailed specification.

**Quick Reference:**
- Max messages: 5 (Familiar) / Unlimited (EverLife)
- Content types: Photo, Video, Audio, Note
- Unlock precision: Date + Time (default 09:00)
- Download window: 30 days
- Storage: Counts toward capsule storage limit

---

### F-LEG-005: AI Avatar (EverLife Only)

**Description:** Conversational AI trained on capsule content.

**Training Data:**
- All text notes in capsule
- Audio transcriptions
- Video transcriptions (if AI-transcribed)
- Metadata (dates, relationships, context)

**Capabilities:**
- Answer questions about creator's life
- Share memories contextually
- Speak in creator's "voice" (style transfer)
- Reference specific content items

**Limitations:**
- Cannot make decisions or commitments
- Cannot create new content
- Cannot access external information
- Clear disclaimer: "This is an AI representation"

**Consent Flow:**
```
1. Creator enables AI Avatar in settings
2. Explicit consent checkbox: "I understand this AI will represent me"
3. Terms acceptance
4. Training begins (async)
5. Preview available before final confirmation
6. Can disable at any time
```

**Technical Notes:**
- Fine-tuned language model
- RAG (Retrieval Augmented Generation) over content
- Guardrails for sensitive topics
- Rate limiting per recipient

---

### F-LEG-006: Delivery Workflow

**Description:** Process of transferring capsule to recipients after trigger.

**Trigger Events:**
1. Inactivity period exceeded + verification failed
2. Trusted contact confirms creator deceased
3. Manual trigger by creator (end-of-life)

**Delivery Steps:**
```
1. TRIGGER
   └── Record trigger event, reason, timestamp

2. PREPARATION
   └── Generate individual recipient packages
   └── Encrypt with recipient-specific keys

3. NOTIFICATION
   └── Email each recipient
   └── Include: Condolence message, access link, download instructions

4. ACCESS
   └── Recipients can view online
   └── Recipients can download archive

5. GRACE PERIOD
   └── 90 days for all recipients to access
   └── Reminder emails at 30, 60, 80 days

6. CLEANUP
   └── After 90 days, delete from server
   └── Metadata retained indefinitely
```

**Recipient Notification Email:**
```
Subject: Un mensaje de [Nombre] para ti

[Nombre] preparó algo especial para ti.

Antes de que no estuviera, quiso dejarte recuerdos,
mensajes y momentos que compartisteis.

[Acceder a tu legado]

Este contenido estará disponible durante 90 días.
Te recomendamos descargarlo para guardarlo siempre.

Con cariño,
NUCLEA
```

---

### F-LEG-007: Content Organization

**Description:** How content is structured within Legacy capsule.

**Primary Views:**
- **Timeline:** Chronological, all content
- **Calendar:** Month/year navigation
- **Albums:** User-created groupings
- **Recipients:** Filter by recipient permissions

**Special Sections:**
- **Future Messages:** Separate area with locked indicators
- **For [Recipient]:** Content tagged for specific person
- **Shared:** Content visible to all recipients
- **Private Notes:** Creator-only (not delivered)

---

### F-LEG-008: Closure Options

**Description:** How Legacy capsule can be closed.

**Option A: Voluntary Closure (while alive)**
- Creator decides to finalize
- Downloads archive
- Can still trigger delivery manually later
- Or keeps as personal archive

**Option B: Automatic Closure (inactivity)**
- System triggers after verification fails
- Recipients receive notification
- 90-day access window
- Server cleanup after

**Option C: Manual Death Trigger**
- Creator pre-authorizes trusted contact
- Trusted contact confirms death
- Immediate delivery to recipients

## Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Content encryption at rest | AES-256 |
| Transfer encryption | TLS 1.3 |
| Access tokens | JWT, 24h expiry |
| Recipient verification | Email link + optional 2FA |
| Trusted contact verification | Phone call + security question |
| Audit logging | All access, modifications, triggers |

## Performance Requirements

| Metric | Target |
|--------|--------|
| Inactivity check | Daily, <1s per user |
| Delivery trigger | <5 minutes |
| Archive generation | <10 minutes for 10GB |
| Recipient notification | <30 seconds after trigger |
| Content load time | <2s for first item |

## Analytics Events

```typescript
// Legacy-specific events
'legacy.created'
'legacy.recipient.added'
'legacy.recipient.accepted'
'legacy.trusted_contact.added'
'legacy.future_message.created'
'legacy.inactivity.warning_sent'
'legacy.inactivity.triggered'
'legacy.delivery.started'
'legacy.delivery.completed'
'legacy.recipient.accessed'
'legacy.recipient.downloaded'
'legacy.ai_avatar.enabled'
'legacy.ai_avatar.conversation'
```
