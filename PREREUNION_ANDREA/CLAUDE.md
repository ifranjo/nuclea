# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See `../CLAUDE.md` for project overview, capsule types, pricing plans, and workspace navigation.

## Development Commands

All commands run from this directory (`PREREUNION_ANDREA/`):

```bash
npm install              # Install dependencies
npm run dev              # Dev server at http://localhost:3000
npm run build            # Production build
$env:ANALYZE='true'; npx next build --webpack # Build + bundle analyzer (PowerShell, Next16)
npm run start            # Start production server
npm run lint             # ESLint
npm run deploy           # Deploy to Vercel (--prod)
```

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.4 |
| Language | TypeScript | 5.7.2 |
| Styling | Tailwind CSS | 3.4.17 |
| State | Zustand | 5.0.2 |
| Backend | Firebase (Auth, Firestore, Storage) | 10.14.1 |
| Backend (server) | Firebase Admin SDK | 12.7.0 |
| Animation | Framer Motion | 11.15.0 |
| Validation | Zod | 3.24.1 |
| Dates | date-fns | 4.1.0 |
| IDs | uuid | 11.0.4 |
| Notifications | React Hot Toast | 2.4.1 |
| Icons | Lucide React | 0.469.0 |
| Deployment | Vercel | — |

**React 18** (POC_INTERNA uses React 19).

## Architecture

### Data Flow

```
useAuth (Firebase Auth) → User state
    ↓
useCapsules(userId) → Real-time Firestore subscription → Capsule[]
    ↓
Zustand store → UI state, modals, capsule creation flow, notifications
```

### Auth (`src/hooks/useAuth.ts`)

Returns: `user`, `firebaseUser`, `loading`, `error`, `signInWithGoogle(acceptedTerms?)`, `signInWithEmail(email, password)`, `signUpWithEmail(email, password, displayName, acceptedTerms?)`, `signOut()`

Does not auto-create profile documents from `onAuthStateChanged`. Profile creation now happens only in explicit registration flows that also persist consent metadata (`termsAcceptedAt`, `privacyAcceptedAt`, `consentVersion`).

### Capsules (`src/hooks/useCapsules.ts`)

Returns: `capsules`, `loading`, `error`, `createCapsule(type, title, description)`, `updateCapsule(id, updates)`, `deleteCapsule(id)`, `addContent(capsuleId, content)`

Uses `onSnapshot` for real-time Firestore subscription.

### API Routes

| Route | Method | Auth | Behavior |
|-------|--------|------|----------|
| `/api/waitlist` | `POST` | No | Add email to waitlist (deduplication) |
| `/api/waitlist` | `GET` | No | Get waitlist count |
| `/api/capsules` | `GET` | Bearer token | Get user's capsules |
| `/api/capsules` | `POST` | Bearer token | Create capsule (enforces plan limits) |

Token verification via Firebase Admin Auth.

### Zustand Store (`src/lib/store.ts`)

State slices: `user`, `sidebarOpen`, `modalOpen`, `newCapsuleType`, `selectedCapsule`, `isLoading`, `notifications`

### Firebase Schema (Firestore collections)

- **users/** — Profile with plan tier (`free|esencial|familiar|premium`), `storageUsed`, `capsuleCount`
- **capsules/** — Capsule documents with `contents[]` array and optional `aiAvatar`
- **waitlist/** — Pre-launch email signups

## Type System (`src/types/index.ts`)

```typescript
type CapsuleType = 'everlife' | 'life-chapter' | 'social' | 'pet' | 'origin'
```

**Note:** This defines 5 types. The canonical spec defines 6 (adds `legacy` and `together`). See root `CLAUDE.md` for the discrepancy details.

Key interfaces: `User`, `Capsule`, `CapsuleContent`, `AIAvatar`

Constants: `CAPSULE_TYPES` (display names + icons for 5 types), `PLANS` (4 pricing tiers)

## Design System

| Element | Value | Tailwind Class |
|---------|-------|----------------|
| Background | `#0D0D12` | `nuclea-bg` |
| Elevated BG | `#14141A` | `nuclea-bg-elevated` |
| Gold accent | `#D4AF37` | `nuclea-gold` |
| Gold light | `#F4E4BA` | `nuclea-gold-light` |
| Gold muted | `#B8956B` | `nuclea-gold-muted` |
| Text primary | `#FAFAFA` | `text-primary` |
| Text secondary | `rgba(250,250,250,0.7)` | `text-secondary` |
| Display font | Cormorant Garamond | `font-display` |
| Body font | DM Sans | `font-sans` |

Fonts loaded via `next/font/google` in `src/app/layout.tsx` with CSS variables `--font-sans` and `--font-display`.

## Path Alias

`@/*` resolves to `./src/*` (configured in `tsconfig.json`).

## Environment Variables

Required in `.env.local`:

```bash
# Client-side (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_REGION=europe-west1

# Server-side (API routes — Firebase Admin)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Demo fallback values are hardcoded in `src/lib/firebase.ts` — the app runs locally without real Firebase credentials.

## Legal Routes

Static legal pages available in App Router:
- `/privacidad`
- `/terminos`
- `/consentimiento`
- `/contacto`

## Landing Page Structure

`src/app/page.tsx` renders: `Header` → `Hero` → `Capsules` → `AISection` → `Pricing` → `Waitlist` → `Footer`

Landing sections are in `src/components/landing/`.

## Next.js Config

`next.config.js` configures:
- `reactStrictMode: true`
- Image remote patterns: `firebasestorage.googleapis.com`, `lh3.googleusercontent.com`
- App env: `NEXT_PUBLIC_APP_NAME=NUCLEA`, `NEXT_PUBLIC_APP_VERSION=1.0.0`
- Optional bundle analysis via `@next/bundle-analyzer` when `ANALYZE=true`

## No Testing Infrastructure

No Jest/Vitest config, no test files, no `__tests__/` directories.

---

*Last updated: Feb 2026*
