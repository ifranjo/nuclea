# Together Capsule

**Type ID:** `together`
**Purpose:** Shared memories for couples
**AI Avatar:** No
**Priority:** MEDIUM

## Overview

The Together capsule is designed for couples to create a shared memory space. It has two modes: **Share** (collaborative editing) and **Gift** (ownership transfer).

## Modes

### Share Mode
- Both partners can add/edit content
- Real-time collaboration
- Neither can delete without consent
- Capsule appears in both dashboards

### Gift Mode
- One person creates, fills with memories
- Transfers ownership to partner
- Original creator loses edit access
- Perfect for anniversaries, birthdays

## User Flow (from PDFs: NUCLEA_TOGETHER CAPSULE_COMPARTIR.pdf, NUCLEA_TOGETHER_REGALAR.pdf)

### Share Flow
```
1. Create Together Capsule
   └── Set title, cover image

2. Invite Partner
   ├── Enter email
   ├── Optional: personal message
   └── Send invitation

3. Partner Accepts
   ├── Receives email notification
   ├── Creates account (if new)
   └── Capsule appears in their dashboard

4. Collaborative Editing
   ├── Both can add content
   ├── Content shows creator attribution
   └── Timeline merges both contributions

5. Closure (requires both)
   ├── One initiates closure request
   ├── Other confirms
   └── Both can download
```

### Gift Flow
```
1. Create Together Capsule (Gift mode)
   └── Mark as "gift"

2. Fill with Memories
   ├── Photos, videos, audio, notes
   └── Organize by date

3. Prepare Gift
   ├── Add cover message
   ├── Set delivery date (optional)
   └── Preview as recipient

4. Transfer Ownership
   ├── Enter recipient email
   ├── Confirm transfer
   └── Ownership changes permanently

5. Recipient Receives
   ├── Email notification
   ├── Capsule in their dashboard
   └── Full edit control
```

## Features

### Invitation System
- Email-based invitations
- Pending state until accepted
- Automatic expiry after 30 days
- Reminder emails (7 days, 1 day before expiry)

### Attribution
- Each content item shows creator
- "Added by [Name] on [Date]"
- Visual differentiation (optional avatar/color)

### Dual Closure
- Both collaborators must agree to close
- One initiates → Other receives request
- 48-hour window to accept/decline
- If declined, capsule remains active

### Gift Wrapping
- Special "unwrap" animation for gifts
- Cover message displayed first
- Reveal animation before content access
- Cannot be undone after transfer

## Database Specifics

### Metadata JSONB Structure
```json
{
  "mode": "share",
  "original_creator_id": "uuid-here",
  "partner_invited_at": "2026-01-15T10:00:00Z",
  "partner_accepted_at": "2026-01-16T14:30:00Z",
  "closure_initiated_by": null,
  "closure_initiated_at": null,
  "gift_message": null,
  "gift_delivered_at": null
}
```

### Collaborators Table Usage
```sql
-- For Together capsules
INSERT INTO collaborators (
    capsule_id,
    user_id,
    invited_email,
    can_edit,
    can_delete,
    can_invite
) VALUES (
    'capsule-uuid',
    'partner-uuid',
    'partner@email.com',
    true,   -- Can add/edit content
    false,  -- Cannot delete (requires mutual consent)
    false   -- Cannot invite others (couple only)
);
```

## UI Components (from PDF)

### Main View
- Two-column or merged timeline
- Creator attribution badges
- "Invite Partner" prominent CTA (if solo)
- Partner status indicator

### Invitation Modal
- Email input
- Personal message textarea
- "Send Invitation" button
- Cancel option

### Partner Pending State
- "Waiting for [Name]..." status
- Resend invitation option
- Cancel invitation option

### Gift Wrapping UI
- Card-style cover design
- Message input (multiline)
- Delivery date picker
- Preview button
- "Wrap & Send" CTA

### Dual Closure Flow
- Initiate: "Request Closure" button
- Waiting: "Waiting for [Partner]..." status
- Accept: "Approve Closure" modal
- Complete: Both download, capsule closes

## Technical Implementation Notes

### Real-time Sync
- Supabase Realtime for content updates
- Both users see changes immediately
- Conflict resolution: Last write wins (content-level)

### Ownership Transfer (Gift)
- Update `owner_id` in capsules table
- Remove collaborator entry for original owner
- Send email to new owner
- Maintain content creator attribution

### Edge Cases
- Partner never accepts → Auto-expire invitation
- Partner deletes account → Solo capsule conversion
- Breakup scenario → Option to duplicate content to separate capsules
- Gift returned → Not implemented (one-way transfer)

## Pricing Tier Requirements

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Create Together | No | Yes | Yes |
| Gift Mode | No | Yes | Yes |
| Max Collaborators | - | 1 | 1 |
