# NUCLEA API Endpoints

> [!IMPORTANT]
> This file is the target/expanded API contract (aspirational scope).
> For currently implemented runtime endpoints, see `RUNTIME_ENDPOINTS.md`.

**Base URL:** `/api` (Next.js API Routes) or Supabase Edge Functions
**Authentication:** Supabase JWT (Bearer token)

## Authentication

### POST /auth/signup
Create new account.

```typescript
// Request
{
  email: string;
  password: string;
  displayName?: string;
}

// Response
{
  user: User;
  session: Session;
}
```

### POST /auth/signin
Sign in with credentials.

### POST /auth/signout
Sign out current user.

### POST /auth/oauth/{provider}
OAuth login (apple, google).

---

## Users

### GET /users/me
Get current user profile.

```typescript
// Response
{
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  subscriptionTier: 'free' | 'esencial' | 'familiar' | 'everlife';
  createdAt: string;
}
```

### PATCH /users/me
Update user profile.

### DELETE /users/me
Delete account (GDPR compliance).

---

## Capsules

### GET /capsules
List user's capsules.

```typescript
// Query params
?status=active|closed|all
?type=legacy|together|social|pet|life_chapter|origin

// Runtime note: current UI/runtime slug uses `life-chapter`.
// `life_chapter` is retained here for target schema-level compatibility.

// Response
{
  capsules: Capsule[];
  total: number;
}
```

### POST /capsules
Create new capsule.

```typescript
// Request
{
  type: CapsuleType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Response
{
  capsule: Capsule;
}
```

### GET /capsules/:id
Get capsule details.

### PATCH /capsules/:id
Update capsule.

### DELETE /capsules/:id
Delete capsule (soft delete, requires confirmation).

### POST /capsules/:id/close
Initiate capsule closure.

```typescript
// Request
{
  closingMessage?: string;
  shareWithRecipients?: boolean;  // For Social capsule
}

// Response
{
  capsule: Capsule;
  archiveUrl?: string;  // If immediately available
  archiveJobId?: string; // If async generation
}
```

### GET /capsules/:id/archive
Download capsule archive.

### POST /capsules/:id/confirm-download
Confirm download complete (triggers server cleanup).

---

## Contents

### GET /capsules/:capsuleId/contents
List capsule contents.

```typescript
// Query params
?type=photo|video|audio|note|drawing
?startDate=2026-01-01
?endDate=2026-01-31
?limit=20
?offset=0

// Response
{
  contents: Content[];
  total: number;
}
```

### POST /capsules/:capsuleId/contents
Upload new content.

```typescript
// Multipart form data
{
  type: ContentType;
  file: File;  // For photo/video/audio/drawing
  contentDate: string;  // YYYY-MM-DD
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Response
{
  content: Content;
}
```

### GET /contents/:id
Get content details.

### PATCH /contents/:id
Update content metadata.

### DELETE /contents/:id
Delete content.

---

## Recipients (Legacy, Social, Pet)

### GET /capsules/:capsuleId/recipients
List capsule recipients.

### POST /capsules/:capsuleId/recipients
Add recipient.

```typescript
// Request
{
  email: string;
  name: string;
  relationship?: string;
  permissions: {
    canView: boolean;
    canDownload: boolean;
  };
  deliveryPreferences?: {
    notifyOnClosure: boolean;
    notifyOnInactivity: boolean;
  };
}

// Response
{
  recipient: Recipient;
}
```

### PATCH /recipients/:id
Update recipient.

### DELETE /recipients/:id
Remove recipient.

### POST /recipients/:id/resend-invitation
Resend invitation email.

---

## Collaborators (Together)

### GET /capsules/:capsuleId/collaborators
List capsule collaborators.

### POST /capsules/:capsuleId/collaborators
Invite collaborator.

```typescript
// Request
{
  email: string;
  personalMessage?: string;
}
```

### DELETE /collaborators/:id
Remove collaborator.

### POST /collaborators/:id/accept
Accept invitation.

### POST /collaborators/:id/decline
Decline invitation.

---

## Future Messages (Legacy)

### GET /capsules/:capsuleId/future-messages
List future messages.

### POST /capsules/:capsuleId/future-messages
Create future message.

```typescript
// Request
{
  title: string;
  messageText?: string;
  contentIds: string[];  // Content to include
  unlockDate: string;    // YYYY-MM-DD
  unlockTime?: string;   // HH:MM (default 09:00)
  recipientId: string;
}

// Response
{
  futureMessage: FutureMessage;
}
```

### GET /future-messages/:id
Get future message details.

### PATCH /future-messages/:id
Update future message (only if status = scheduled).

### DELETE /future-messages/:id
Delete future message.

---

## Trusted Contacts (Legacy)

### GET /capsules/:capsuleId/trusted-contacts
List trusted contacts.

### POST /capsules/:capsuleId/trusted-contacts
Add trusted contact.

```typescript
// Request
{
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  canCancelDelivery: boolean;
}
```

### DELETE /trusted-contacts/:id
Remove trusted contact.

---

## Subscriptions

### GET /subscriptions/current
Get current subscription.

### POST /subscriptions/checkout
Create checkout session.

```typescript
// Request
{
  tier: 'esencial' | 'familiar' | 'everlife';
  billingCycle: 'monthly' | 'yearly' | 'one_time';
  successUrl: string;
  cancelUrl: string;
}

// Response
{
  checkoutUrl: string;  // Stripe checkout URL
}
```

### POST /subscriptions/cancel
Cancel subscription.

### POST /subscriptions/webhook
Stripe webhook handler.

---

## Feed (Social)

### GET /feed
Get social feed for current user.

```typescript
// Query params
?limit=20
?offset=0
?before=2026-01-15  // Pagination by date

// Response
{
  items: FeedItem[];
  hasMore: boolean;
}
```

---

## Reactions (Social)

### POST /contents/:id/reactions
Add reaction.

```typescript
// Request
{
  emoji: '❤️' | '😂' | '😢' | '🔥' | '👏' | '🤗';
}
```

### DELETE /contents/:id/reactions
Remove reaction.

### GET /contents/:id/reactions
Get reactions (only for content owner).

---

## Milestones (Life Chapter, Origin)

### GET /capsules/:capsuleId/milestones
List milestones.

### POST /capsules/:capsuleId/milestones
Add milestone.

```typescript
// Request
{
  title: string;
  date?: string;
  contentIds?: string[];
}
```

### PATCH /milestones/:id
Update milestone.

### POST /milestones/:id/complete
Mark milestone complete.

### DELETE /milestones/:id
Delete milestone.

---

## Inactivity (Legacy - Admin/System)

### POST /system/check-inactivity
Trigger inactivity check (cron job).

### POST /system/send-verification
Send verification to user.

### POST /system/trigger-delivery
Trigger legacy delivery (after verification fails).

---

## Archive Generation (System)

### POST /system/generate-archive
Generate capsule archive (async).

```typescript
// Request
{
  capsuleId: string;
}

// Response
{
  jobId: string;
  status: 'queued' | 'processing';
}
```

### GET /system/archive-status/:jobId
Check archive generation status.

---

## Notifications

### GET /notifications
Get user notifications.

### PATCH /notifications/:id/read
Mark notification as read.

### POST /notifications/settings
Update notification preferences.

---

## Error Responses

All errors follow this format:

```typescript
{
  error: {
    code: string;       // Machine-readable code
    message: string;    // Human-readable message
    details?: any;      // Additional context
  }
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for this resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `QUOTA_EXCEEDED` | 402 | Storage or capsule limit reached |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 10/minute |
| Read operations | 100/minute |
| Write operations | 30/minute |
| File uploads | 10/minute |
| Archive generation | 3/hour |

---

## Webhooks (Outgoing)

### Subscription Events
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `subscription.expired`

### Capsule Events
- `capsule.closed`
- `capsule.delivered`
- `capsule.archived`

### Future Message Events
- `future_message.unlocked`
- `future_message.expired`
