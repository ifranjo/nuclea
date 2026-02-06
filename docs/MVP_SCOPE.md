# NUCLEA MVP Scope

**Version:** 1.0
**Target:** Pre-seed demo for €150K funding
**Timeline:** TBD (depends on available hours/week)

## MVP Goal

Demonstrate core value proposition:
> "Create and preserve memory capsules that can be inherited, shared, or gifted."

## What's IN MVP

### Core Infrastructure
- [x] Documentation complete
- [ ] Next.js project setup
- [ ] Supabase integration (Auth, DB, Storage)
- [ ] Basic authentication (Email + Google OAuth)
- [ ] User profile management
- [ ] Subscription tiers (logic, not payment)

### Capsule Types (Priority Order)

#### 1. Legacy Capsule (MUST HAVE)
Flagship product. Demonstrates unique value.

**Include:**
- Create/edit/view capsule
- Add photos, videos, audio, notes
- Calendar timeline view
- Add recipients
- Basic closure flow (manual)
- Download archive

**Exclude from MVP:**
- Inactivity detection
- Trusted contacts
- Future messages
- AI Avatar

#### 2. Life Chapter Capsule (SHOULD HAVE)
Common use case, easy to demonstrate.

**Include:**
- Create with template (Erasmus, Travel, Fitness)
- Progress tracking (if end date set)
- Basic milestones
- Closure with download

**Exclude from MVP:**
- Content suggestions
- Gift mode
- Reflection prompts

#### 3. Pet Capsule (NICE TO HAVE)
Quick emotional win.

**Include:**
- Pet profile (name, species, photo)
- Add content
- Basic closure

**Exclude from MVP:**
- Memorial mode
- Family sharing
- Anniversary reminders

### User Experience

#### Include in MVP:
- Onboarding animation (simplified)
- Manifesto screen
- Capsule selection
- Basic registration
- Dashboard with capsule cards
- Capsule detail view
- Content upload (photo, video, audio, note)
- Calendar view
- Basic closure flow

#### Exclude from MVP:
- Apple Sign-In (requires Apple Developer)
- Payment integration (Stripe)
- Push notifications
- Offline mode
- Real-time sync

### Design

#### Include in MVP:
- Mobile-first responsive design
- Core component library (Button, Card, Input)
- Capsule icon (simplified)
- Basic animations (page transitions)
- Design system colors and typography

#### Exclude from MVP:
- 3D capsule animation
- Complex particle effects
- Dark mode
- Full icon set

## Feature Breakdown

### Must Have (MVP Core)
| Feature | Status | Notes |
|---------|--------|-------|
| User registration | Pending | Email + Google |
| User profile | Pending | Basic fields |
| Create capsule | Pending | Legacy + Life Chapter |
| View capsule | Pending | Timeline + Calendar |
| Add content | Pending | Photo, Video, Audio, Note |
| Edit content | Pending | Title, description, date |
| Delete content | Pending | With confirmation |
| Add recipients | Pending | Legacy only |
| Close capsule | Pending | Manual trigger |
| Download archive | Pending | ZIP generation |
| Mobile-responsive | Pending | Tailwind CSS |

### Should Have (Demo Polish)
| Feature | Status | Notes |
|---------|--------|-------|
| Pet capsule | Pending | Third priority |
| Onboarding animation | Pending | Simplified version |
| Progress tracking | Pending | Life Chapter |
| Milestones | Pending | Life Chapter |
| Content thumbnails | Pending | Auto-generated |

### Nice to Have (If Time)
| Feature | Status | Notes |
|---------|--------|-------|
| Video player | Pending | In-app playback |
| Audio waveform | Pending | Recording UI |
| Batch upload | Pending | Multiple photos |
| Calendar navigation | Pending | Month picker |

### Post-MVP
| Feature | Phase |
|---------|-------|
| Together capsule | Phase 2 |
| Social capsule | Phase 2 |
| Origin capsule | Phase 2 |
| Inactivity detection | Phase 2 |
| Future messages | Phase 2 |
| AI Avatar | Phase 3 |
| Stripe payments | Phase 2 |
| Apple Sign-In | Phase 2 |
| Push notifications | Phase 2 |

## Technical Decisions for MVP

### Simplifications
| Area | MVP Approach | Full Version |
|------|--------------|--------------|
| Auth | Email + Google | + Apple, phone |
| Storage | Single bucket | Per-capsule-type buckets |
| Archive | Client-side ZIP | Server-side Edge Function |
| Thumbnails | On-upload | Background processing |
| Real-time | Polling | Supabase Realtime |
| Offline | None | Service Worker |

### Database
All tables defined in schema, but only these actively used:
- `users`
- `capsules` (type: legacy, life_chapter, pet)
- `contents`
- `recipients` (legacy only)

### API
Minimal endpoints:
- Auth (signup, signin, signout)
- Capsules (CRUD)
- Contents (CRUD)
- Recipients (CR)
- Archive (generate, download)

## Demo Scenarios

### Scenario 1: Legacy Capsule
1. User signs up
2. Selects "Legacy" capsule
3. Adds title: "Para mis hijos"
4. Uploads 3 photos, 1 video, 1 note
5. Adds 2 recipients (email only)
6. Views timeline
7. Closes capsule
8. Downloads archive

### Scenario 2: Life Chapter
1. User selects "Life Chapter"
2. Chooses "Erasmus" template
3. Sets dates: Sep 2025 - Jun 2026
4. Adds content over time
5. Marks milestones as complete
6. Closes at end of chapter
7. Downloads archive

### Scenario 3: Pet Memorial
1. User creates Pet capsule
2. Adds pet info: "Max", Dog, Golden Retriever
3. Uploads pet photos and audio (bark)
4. Views memorial
5. Downloads

## Success Metrics for MVP

| Metric | Target |
|--------|--------|
| User can register | ✓ Works |
| User can create capsule | ✓ Works |
| User can upload content | ✓ Works |
| User can view timeline | ✓ Works |
| User can close capsule | ✓ Works |
| User can download archive | ✓ Works |
| Mobile-responsive | ✓ Works |
| Demo-ready | ✓ Investor presentation |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Storage costs | Archive cleanup after download |
| Large video uploads | 100MB limit for MVP |
| Complex animations | Simplified/placeholder |
| Auth issues | Fallback to email-only |
| Archive generation | Client-side ZIP (JSZip) |

## Post-MVP Priorities

### Phase 2 (Post-funding)
1. Payment integration (Stripe)
2. Inactivity detection (Legacy)
3. Future messages (Legacy)
4. Together capsule
5. Origin capsule
6. Social capsule

### Phase 3
1. AI Avatar
2. Advanced analytics
3. Native mobile apps (React Native)
4. Multi-language support

---

## Development Checklist

### Setup
- [ ] Create Next.js project
- [ ] Configure Tailwind CSS
- [ ] Setup Supabase project
- [ ] Configure environment variables
- [ ] Create database schema
- [ ] Setup Vercel deployment

### Auth
- [ ] Email/password signup
- [ ] Email/password signin
- [ ] Google OAuth
- [ ] Protected routes
- [ ] User context

### Capsules
- [ ] Create capsule page
- [ ] Capsule type selection
- [ ] Capsule detail page
- [ ] Timeline view
- [ ] Calendar view
- [ ] Capsule settings

### Content
- [ ] Upload component (photo)
- [ ] Upload component (video)
- [ ] Upload component (audio)
- [ ] Note editor
- [ ] Content card
- [ ] Content detail modal
- [ ] Edit content
- [ ] Delete content

### Recipients
- [ ] Add recipient form
- [ ] Recipients list
- [ ] Remove recipient

### Closure
- [ ] Closure flow UI
- [ ] Archive generation
- [ ] Download handling
- [ ] Post-download cleanup

### Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Success toasts
- [ ] Mobile navigation
- [ ] Basic animations
