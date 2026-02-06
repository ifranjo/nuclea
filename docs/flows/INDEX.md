# User Flows Index

## Core Flows

| Flow | Document | Description |
|------|----------|-------------|
| Onboarding | [ONBOARDING.md](./ONBOARDING.md) | New user journey from splash to first capsule |
| Content Upload | [CONTENT_UPLOAD.md](./CONTENT_UPLOAD.md) | Adding photos, videos, audio, notes, drawings |
| Capsule Closure | [CAPSULE_CLOSURE.md](./CAPSULE_CLOSURE.md) | Finalizing, downloading, server cleanup |
| Future Messages | [FUTURE_MESSAGES.md](./FUTURE_MESSAGES.md) | Time-locked content (Legacy capsule) |

## Flow Dependencies

```
                    ONBOARDING
                        │
                        ▼
              ┌─────────────────┐
              │  Capsule Active │
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   CONTENT_UPLOAD  RECIPIENTS   COLLABORATORS
         │             │             │
         └─────────────┼─────────────┘
                       ▼
              ┌─────────────────┐
              │  Capsule Ready  │
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             │             ▼
   FUTURE_MESSAGES     │      CAPSULE_CLOSURE
   (Legacy only)       │             │
         │             │             ▼
         └─────────────┼───────► DOWNLOAD
                       │             │
                       ▼             ▼
              ┌─────────────────┐
              │  Server Cleanup │
              └─────────────────┘
```

## Capsule-Specific Flows

### Legacy Capsule
1. Onboarding → Create Legacy
2. Content Upload (ongoing)
3. Add Recipients
4. Add Trusted Contacts
5. Create Future Messages (optional)
6. Enable AI Avatar (optional)
7. **Wait for trigger OR manual closure**
8. Delivery to recipients
9. Recipients download

### Together Capsule
1. Onboarding → Create Together
2. Invite Partner
3. Partner accepts
4. Content Upload (both)
5. **Dual consent closure**
6. Both partners download

### Social Capsule
1. Onboarding → Create Social
2. Add "Mis Socials"
3. Content Upload (ongoing)
4. Friends view in feed
5. **Owner closure**
6. Owner downloads
7. Optional: Share with friends

### Pet Capsule
1. Onboarding → Create Pet
2. Set pet profile
3. Content Upload (ongoing)
4. Optional: Enable memorial mode
5. Optional: Family sharing
6. **Owner closure**
7. Owner/family download

### Life Chapter Capsule
1. Onboarding → Create Chapter
2. Select template
3. Set date range
4. Content Upload (ongoing)
5. Mark milestones
6. **Owner closure** (add reflection)
7. Owner downloads
8. Optional: Gift to someone

### Origin Capsule
1. Onboarding → Create Origin
2. Set child info
3. Optional: Start during pregnancy
4. Content Upload (18+ years)
5. Mark milestones
6. Add parent reflections
7. **Gift preparation**
8. Gift to child at target age

## State Transitions

### Capsule States
```
┌──────────┐     ┌──────────┐     ┌────────────┐     ┌─────────┐
│  ACTIVE  │ ──▶ │  CLOSED  │ ──▶ │ DOWNLOADED │ ──▶ │ DELETED │
└──────────┘     └──────────┘     └────────────┘     └─────────┘
     │                │                 │
     │                │                 └── Server cleanup
     │                └── Archive generated
     └── Content editable
```

### Future Message States
```
┌───────────┐     ┌──────────┐     ┌────────────┐     ┌─────────┐
│ SCHEDULED │ ──▶ │ UNLOCKED │ ──▶ │ DOWNLOADED │ ──▶ │ EXPIRED │
└───────────┘     └──────────┘     └────────────┘     └─────────┘
     │                │                 │                 │
     │                │                 │                 └── Content deleted
     │                │                 └── Recipient confirmed
     │                └── Unlock date reached
     └── Waiting
```

### Invitation States
```
┌─────────┐     ┌──────────┐
│ PENDING │ ──▶ │ ACCEPTED │
└─────────┘     └──────────┘
     │
     ├──▶ ┌──────────┐
     │    │ DECLINED │
     │    └──────────┘
     │
     └──▶ ┌─────────┐
          │ EXPIRED │
          └─────────┘
```

## Error Flows

### Upload Failure
1. Upload starts
2. Network error / file too large
3. Show error message
4. Offer retry
5. Queue for later (if offline)

### Closure Conflict (Together)
1. Partner A requests closure
2. Partner B declines
3. A notified
4. Capsule remains active

### Inactivity False Positive
1. System sends warning
2. User logs in
3. Timer reset
4. No delivery

## Analytics Touchpoints

| Flow | Key Events |
|------|------------|
| Onboarding | `onboarding_started`, `capsule_type_selected`, `registration_completed` |
| Content Upload | `upload_started`, `upload_completed`, `upload_failed` |
| Closure | `closure_initiated`, `archive_generated`, `download_confirmed` |
| Future Messages | `future_message_created`, `future_message_unlocked`, `future_message_downloaded` |

## Related Documentation

- [Capsule Types](../capsules/INDEX.md)
- [API Endpoints](../api/ENDPOINTS.md)
- [Database Schema](../DATABASE_SCHEMA.md)
