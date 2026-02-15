# NUCLEA Target Architecture (Supabase)

> Status: target-state reference, not the current runtime implementation.
> Last reviewed: February 13, 2026.

## Overview

NUCLEA is a memory capsule platform with 6 distinct capsule types, each with specific features and closure mechanics. The architecture prioritizes:

1. **Cost Efficiency:** Closure model where downloaded capsules are deleted from servers
2. **Privacy:** End-user data ownership, minimal server retention
3. **Scalability:** Supabase handles auth, database, and storage

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         Next.js (App Router)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │  Landing │  │ Dashboard│  │ Capsule  │  │  Viewer  │               │
│  │   Page   │  │   Page   │  │  Editor  │  │  (Read)  │               │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │     Auth     │  │  PostgreSQL  │  │         Storage              │ │
│  │  Email/OAuth │  │   Database   │  │  Buckets per capsule type   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │   Realtime   │  │  Edge Funcs  │  │      Row Level Security      │ │
│  │ Subscriptions│  │   (Deno)     │  │        (RLS Policies)        │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │   Stripe     │  │   Resend     │  │      Vercel (Deploy)         │ │
│  │  Payments    │  │   Emails     │  │       Edge Network           │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Content Upload Flow
```
User → Upload Media → Supabase Storage → Create Content Record → Link to Capsule
```

### Capsule Closure Flow (Critical for Cost)
```
User clicks "Close" → Generate Archive → User Downloads → Verify Download → Delete from Storage → Mark Capsule as "closed"
```

### Future Message Flow (Legacy Capsule)
```
Create Message → Store with unlock_date → Cron checks daily → On date: notify recipient → 30-day download window → Auto-delete
```

## Storage Architecture

### Bucket Structure
```
supabase-storage/
├── avatars/                    # User profile pictures
├── capsules/
│   ├── legacy/
│   │   └── {capsule_id}/
│   │       ├── photos/
│   │       ├── videos/
│   │       ├── audio/
│   │       └── future_messages/
│   ├── together/
│   │   └── {capsule_id}/...
│   ├── social/
│   │   └── {capsule_id}/...
│   ├── pet/
│   │   └── {capsule_id}/...
│   ├── life-chapter/
│   │   └── {capsule_id}/...
│   └── origin/
│       └── {capsule_id}/
│           ├── photos/
│           ├── videos/
│           ├── audio/
│           └── drawings/       # Unique to Origin
└── downloads/                  # Temporary closed capsule archives
```

## Authentication

### Supported Methods
1. **Email/Password** - Standard registration
2. **Apple Sign-In** - iOS priority
3. **Google OAuth** - Cross-platform

### Session Management
- JWT tokens stored in secure cookies
- Refresh token rotation enabled
- Session timeout: 7 days (configurable)

## Security

### Row Level Security (RLS)
All tables use RLS policies:
- Users can only read/write their own capsules
- Recipients can read capsules they're invited to
- Collaborators (Together capsule) can edit shared capsules

### Data Retention
- Active capsules: Retained until closure
- Closed capsules: Deleted after user download confirmed
- Future messages: 30-day window post-unlock, then deleted
- Account deletion: Full data purge within 30 days

## Scalability Considerations

### Supabase Limits (Pro Plan - $25/mo)
- Database: 8GB included
- Storage: 100GB included
- Bandwidth: 250GB included
- Edge Functions: 500K invocations

### Growth Path
1. **0-1K users:** Free tier sufficient for testing
2. **1K-10K users:** Pro plan ($25/mo)
3. **10K+ users:** Team plan or custom
