# Social Capsule

**Type ID:** `social`
**Purpose:** Private diary for close friends ("Mis Socials")
**AI Avatar:** No
**Priority:** MEDIUM

## Overview

The Social capsule is NUCLEA's anti-social-media feature. It creates a private space to share day-to-day moments with a curated group of close friends. Key differentiator: **No likes, no algorithms, no public visibility.**

## Philosophy

> "Mis Socials" - Your real social circle, not followers.

Traditional social media problems this solves:
- Performative posting for likes
- Algorithmic content prioritization
- Privacy concerns with public posts
- FOMO from curated highlight reels

NUCLEA Social is:
- Chronological, not algorithmic
- Private by default
- No engagement metrics visible
- Designed for authenticity, not performance

## User Flow (from PDF: NUCLEA_SOCIAL CAPSULE.pdf)

```
1. Create Social Capsule
   └── Title: typically "Mi Diario" or personal

2. Add "Mis Socials" (Close Friends)
   ├── Search by email
   ├── Send invitation
   └── Max: 10-20 people (tier dependent)

3. Post Content
   ├── Photo/Video/Audio/Note
   ├── Date automatically set (today)
   ├── Optional: backdate for past memories
   └── No caption required (privacy focus)

4. Friends View
   ├── See in their feed (chronological)
   ├── No like/comment count shown
   └── Optional: private reactions (emoji only)

5. Closure (Owner decides)
   └── Download archive, share with friends or not
```

## Features

### "Mis Socials" Concept
- Hand-picked list of close friends
- Think: "People I'd text this to"
- Not followers, not connections
- Personal, intimate sharing

### Anti-Algorithm Design
- Strictly chronological feed
- No "top posts" or "suggested"
- No read receipts (reduces pressure)
- No public metrics ever

### Private Reactions
- Emoji-only reactions (optional)
- Not shown as counts
- Creator sees who reacted, not totals
- Can be disabled entirely by creator

### Viewing Modes
- **Timeline:** All posts chronologically
- **Calendar:** Browse by date
- **Friend View:** Filter by specific friend's content (if they have shared capsules)

## Database Specifics

### Metadata JSONB Structure
```json
{
  "max_socials": 15,
  "reactions_enabled": true,
  "reaction_type": "emoji",
  "viewing_mode_default": "timeline",
  "auto_post_date": true
}
```

### Recipients as "Socials"
```sql
-- Social capsule uses recipients table differently
INSERT INTO recipients (
    capsule_id,
    email,
    name,
    relationship,
    can_view,
    can_download
) VALUES (
    'capsule-uuid',
    'amigo@email.com',
    'Carlos',
    'amigo',
    true,   -- Can view posts
    false   -- Cannot download archive (owner decides at closure)
);
```

### Content Reactions (New Table)
```sql
CREATE TABLE IF NOT EXISTS content_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,  -- Single emoji
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, user_id)  -- One reaction per user per content
);
```

## UI Components (from PDF)

### Main Feed
- Full-width content cards
- Date header (sticky)
- Creator avatar (for shared view)
- No engagement counts

### Post Creation
- Camera/gallery quick access
- Date picker (defaults today)
- "Post to Mis Socials" button
- No caption field (minimal UI)

### "Mis Socials" Management
- Avatar grid of friends
- "Add Friend" button
- Remove option (swipe or edit mode)
- Pending invitations section

### Viewing Toggle
- Timeline (default)
- Calendar icon for date view
- Clean, minimal navigation

### Reaction Overlay (if enabled)
- Long-press to react
- Emoji picker (limited set)
- Subtle animation
- Creator sees reactions in separate view

## Technical Implementation Notes

### Feed Construction
- Query all capsules where user is recipient
- Merge with user's own Social content
- Order by `content_date DESC`
- Paginate (20 items per load)

### Real-time Updates
- Supabase Realtime subscription
- New posts appear at top
- Smooth animation for new content
- Optional: Disable real-time for battery

### Privacy Enforcement
- RLS: Only "Socials" can view content
- No sharing/repost functionality
- No embed links
- Screenshots: Can't prevent, but no incentive

### Edge Cases
- Friend removes you → You still see past content in your feed
- You remove friend → They lose access to your future posts
- Capsule closure → Friends receive notification option
- Friend deletes account → Their reactions remain anonymous

## Pricing Tier Requirements

| Feature | Free | Esencial | Familiar |
|---------|------|----------|----------|
| Social Capsule | No | 1 | Unlimited |
| Max Socials | - | 10 | 20 |
| Reactions | - | Yes | Yes |
| Storage | - | 5GB | 50GB |

## Comparison with Social Media

| Aspect | Instagram/TikTok | NUCLEA Social |
|--------|-----------------|---------------|
| Audience | Public/Followers | Hand-picked friends |
| Algorithm | Yes | No (chronological) |
| Metrics | Likes, views, shares | Hidden |
| Purpose | Performance | Authenticity |
| Data Use | Ads, profiling | Private, no ads |
| Ownership | Platform owns | User owns, can export |
