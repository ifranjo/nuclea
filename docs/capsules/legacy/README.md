# Legacy Capsule

**Type ID:** `legacy`
**Purpose:** Post-mortem emotional inheritance
**AI Avatar:** Yes (optional)
**Priority:** HIGH (flagship product)

## Overview

The Legacy capsule is NUCLEA's flagship product. It allows users to create a digital emotional inheritance that will be delivered to designated recipients after the creator's death or extended inactivity.

## Key Differentiators

| Feature | Legacy | Other Capsules |
|---------|--------|----------------|
| Inactivity Detection | Yes | No |
| Trusted Contacts | Yes | No |
| Future Messages | Yes | No |
| AI Avatar | Optional | No |
| Closure Trigger | Death/Inactivity | Manual |

## User Flow (from PDF: N UCLEA_LEGACY CAPSULE.pdf)

```
1. Create Legacy Capsule
   └── Set title, description, cover image

2. Add Content
   ├── Photos (memories, albums)
   ├── Videos (messages, moments)
   ├── Audio (voice recordings)
   └── Notes (letters, wishes)

3. Configure Recipients
   ├── Add email/phone
   ├── Set relationship
   └── Define permissions (view/download)

4. Set Inactivity Rules
   ├── Inactivity period: 6 or 12 months
   ├── Verification method before delivery
   └── Trusted contact for confirmation

5. Create Future Messages (optional)
   ├── Time-locked content
   ├── Unlock date (e.g., child's 18th birthday)
   └── Specific recipient

6. Review & Confirm
   └── Legal acknowledgment
```

## Features

### Inactivity Detection
- User sets period: 6 or 12 months
- System tracks `last_active_at` timestamp
- Before triggering delivery:
  1. Email notification to user
  2. Push notification (if app installed)
  3. Contact trusted person for verification
- Only delivers if all verification attempts fail

### Trusted Contacts
- Different from recipients
- Purpose: Confirm creator's status before delivery
- Can delay/cancel delivery if creator is alive but incapacitated

### Future Messages
- Time-locked content within the capsule
- Displayed as blurred thumbnail with lock icon
- Unlocks automatically on specified date
- 30-day download window, then deleted from servers

### AI Avatar (Premium Feature)
- Trained on text content from capsule
- Can answer questions "as if" the creator was speaking
- Ethical guardrails: Cannot make new decisions or commitments
- Only available with consent checkbox

## Database Specifics

### Metadata JSONB Structure
```json
{
  "inactivity_months": 12,
  "last_verification_sent": "2026-01-15T10:00:00Z",
  "trusted_contacts": [
    {
      "name": "María García",
      "email": "maria@example.com",
      "phone": "+34600123456",
      "relationship": "hermana"
    }
  ],
  "ai_avatar_enabled": true,
  "ai_avatar_consent_at": "2026-01-10T15:30:00Z",
  "delivery_status": "pending"
}
```

### Content Organization
- Chronological by `content_date`
- Calendar view (same as other capsules)
- Future messages shown separately with lock indicators

## UI Components (from PDF)

### Main View
- Capsule visualization (3D metal capsule icon)
- Content timeline (scrollable)
- "Add Memory" floating action button
- Recipients badge (count)
- Inactivity status indicator

### Recipients Management
- List of recipients with avatars
- Inline permission toggles
- "Add Recipient" modal
- Relationship dropdown

### Inactivity Settings
- Toggle: Enable/disable
- Slider or dropdown: 6 / 12 months
- Trusted contacts list
- Verification method preferences

### Future Messages Section
- Grid of locked items
- Unlock date displayed
- "Create Future Message" button
- Preview with blur effect

## Technical Implementation Notes

### Cron Jobs Required
1. **Daily:** Check for unlocked future messages
2. **Weekly:** Check for approaching inactivity threshold
3. **Monthly:** Clean up expired downloads

### Edge Cases
- User reactivates after inactivity warning → Reset timer
- Recipient email bounces → Retry 3x, then notify trusted contact
- Trusted contact unresponsive → Wait additional 30 days
- Multiple recipients → Each gets separate notification

### Security Considerations
- Encryption at rest for sensitive content
- Two-factor for inactivity override
- Audit log for all delivery attempts
