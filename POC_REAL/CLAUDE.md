# CLAUDE.md — POC_REAL

## Purpose

POC_REAL is the functional backend POC for NUCLEA — same UI as POC_INTERNA but wired to a real Supabase local instance (Docker). 5 test users (Simpson family), 92 seed images, real auth, real uploads, real persistence.

## Stack

| Aspect | Value |
|--------|-------|
| Port | **3002** |
| Theme | White (`#FFFFFF`) |
| Backend | Supabase local (Docker) |
| Next.js | 15.x |
| React | 19 |
| Auth | Supabase email/password |
| Storage | Supabase Storage (capsule-contents bucket) |
| State | React hooks + Supabase client |

## Quick Start

```bash
# 1. Start Supabase (requires Docker)
npx supabase start

# 2. Install deps
npm install

# 3. Seed data (92 Simpsons images + 5 users)
npx tsx scripts/seed.ts

# 4. Start dev server
npm run dev   # http://localhost:3002
```

## Test Users

| User | Email | Password |
|------|-------|----------|
| Homer | homer@nuclea.test | nuclea123 |
| Marge | marge@nuclea.test | nuclea123 |
| Bart | bart@nuclea.test | nuclea123 |
| Lisa | lisa@nuclea.test | nuclea123 |
| Maggie | maggie@nuclea.test | nuclea123 |

## Key Routes

| Route | Auth | Purpose |
|-------|------|---------|
| `/login` | Public | Email/password login |
| `/registro` | Public | Registration |
| `/dashboard` | Protected | Capsule grid |
| `/capsule/[id]` | Protected | Capsule detail (calendar, upload, persons) |
| `/share/[token]` | Public | Read-only shared view |
| `/settings` | Protected | Profile + Coming Soon |
| `/onboarding` | Public | Onboarding flow (P1-P4) |

## Supabase Studio

http://localhost:54323 — browse tables, run SQL, manage auth users.

## RLS

Disabled for POC simplicity (`00002_disable_rls.sql`). Do NOT deploy to production without re-enabling.

## Differences from POC_INTERNA

- P4 creates a real capsule in Supabase on type selection
- Dashboard shows real capsules from DB
- Capsule detail uploads to Supabase Storage
- Share page renders from server with service role
- Middleware protects routes, refreshes auth tokens
