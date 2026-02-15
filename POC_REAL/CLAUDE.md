# CLAUDE.md — POC_REAL

## Purpose

POC_REAL is the functional backend POC for NUCLEA — same UI as POC_INTERNA but wired to a real Supabase local instance (Docker). 5 test users (Simpson family), seed images, real auth, real uploads, real persistence. Includes a production-grade beta invitation system.

**Last session:** 15 Feb 2026 | Commit: `2522b30` | All QA: 11/11 PASS

## Stack

| Aspect | Value |
|--------|-------|
| Port | **3002** |
| Theme | White (`#FFFFFF`) |
| Backend | Supabase local (Docker) |
| Next.js | 15.x |
| React | 19 |
| Auth | Supabase email/password + OTP magic links (beta) |
| Storage | Supabase Storage (capsule-contents bucket) |
| State | React hooks + `useRef(createClient())` pattern |
| Build | 22 routes, clean |

## Quick Start

```bash
# 1. Start Supabase (requires Docker running)
npx supabase start

# 2. Install deps
npm install

# 3. Apply migrations + seed data
npx supabase db reset
npx tsx scripts/seed.ts
npx tsx scripts/seed-beta.ts

# 4. Start dev server
npm run dev   # http://localhost:3002
```

## Test Users

| User | Email | Password | Capsules | Beta |
|------|-------|----------|----------|------|
| Homer | homer@nuclea.test | nuclea123 | 2 (Legacy + Together) | Active |
| Marge | marge@nuclea.test | nuclea123 | 1 (Social) + collab | Active |
| Bart | bart@nuclea.test | nuclea123 | 1 (Pet) | Active |
| Lisa | lisa@nuclea.test | nuclea123 | 1 (Origin) | Active |
| Maggie | maggie@nuclea.test | nuclea123 | 0 (designated person) | Active |

## Routes (22)

### App Routes
| Route | Auth | Purpose |
|-------|------|---------|
| `/login` | Public | Email/password login with quick-fill |
| `/registro` | Public | Registration form |
| `/dashboard` | Protected | Capsule grid with storage display |
| `/capsule/[id]` | Protected | Calendar, upload, share, persons |
| `/share/[token]` | Public | Read-only shared capsule view |
| `/settings` | Protected | Profile + Coming Soon badges |
| `/onboarding` | Public | P1-P4 onboarding flow (?step=N) |

### Beta Routes
| Route | Auth | Purpose |
|-------|------|---------|
| `/beta/accept?t=<token>` | Public | Invitation landing page |
| `/beta/waitlist` | Public | Holding page (no beta access) |
| `/beta/complete` | Auth | Post-OTP activation |
| `POST /api/beta/invite` | Admin | Create invitation |
| `GET /api/beta/invite` | Admin | List invitations |
| `GET/POST /api/beta/accept` | Public | Validate token / send OTP |
| `POST /api/beta/complete` | Auth | Grant beta access |
| `POST /api/beta/revoke` | Admin | Revoke access |

## Database (8 tables)

| Table | Purpose |
|-------|---------|
| `users` | User profiles (auth_id FK) |
| `capsules` | Capsule metadata, share_token |
| `contents` | Media files + text notes |
| `collaborators` | Shared capsule access |
| `designated_persons` | Capsule inheritors |
| `beta_invitations` | Email invites with token_hash |
| `beta_access` | Per-user gate (enabled bool) |
| `beta_audit_log` | All beta events |

## Critical Patterns

### useRef for Supabase Client
All hooks MUST use `useRef(createClient())`. Without this, new instances are created on re-render causing auth state inconsistency and infinite loading.

### Middleware try/catch
`getUser()` in middleware MUST be wrapped in try/catch. It throws during logout when cookies are in a partial state, crashing the entire server.

### signOut Sequence
1. Clear React state (`setUser(null)`, `setProfile(null)`)
2. Call `supabase.auth.signOut()` (wrapped in try/catch)
3. Full page redirect: `window.location.href = '/login'`

### Beta Gate
Controlled by `BETA_GATE_ENABLED=true` env var. OFF by default for development. When ON, middleware checks `beta_access.enabled` for protected routes.

## Supabase Studio

http://localhost:54323 — browse tables, run SQL, manage auth users.

## RLS

Disabled for POC simplicity (`00002_disable_rls.sql`). Do NOT deploy to production without re-enabling.

## Pending Items

- Deploy to Vercel (needs Supabase Cloud, not local Docker)
- Enable RLS with proper policies
- Fix seed.ts to set file_size_bytes on uploads
- Implement ZIP export on "Cerrar y descargar"
- Admin UI for beta invitations (currently API-only)
- Test file upload flow via Playwright

---

*Last updated: 2026-02-15*
