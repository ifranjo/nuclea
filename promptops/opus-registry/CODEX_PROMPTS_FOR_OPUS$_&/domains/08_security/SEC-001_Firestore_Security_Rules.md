# Firestore Security Rules — Deploy & Version

## Metadata

- Prompt ID: `PRM-SEC-001`
- Version: `1.0.0`
- Owner: `CTO`
- Status: `active`
- Last Updated: `2026-02-21`
- Approved By: `Audit Arquitectural v4`
- Priority: `P0 CRITICAL`
- Target App: `PREREUNION_ANDREA`

## Purpose

PREREUNION_ANDREA runs on Firebase (Auth, Firestore, Storage) in production but has **zero security rules versioned in the repository**. Either rules are deployed manually (drift risk) or don't exist (deny-all or open-all). This task creates, deploys, and versions Firestore security rules.

## Context

Current Firestore collections (from code analysis):
- `users/{uid}` — User profile, plan, consent metadata
- `capsules/{docId}` — Capsule metadata (userId field = owner)
- `waitlist/{docId}` — Pre-launch email signups
- `users/{uid}/consents/{consentId}` — Biometric consent records
- `_rate_limits/{docId}` — Rate limiting counters (server-only)

API routes that write to Firestore:
- `POST /api/capsules` — Creates capsule (server-side, Firebase Admin)
- `POST /api/waitlist` — Adds to waitlist (server-side)
- `POST /api/consent/biometric` — Signs consent (server-side)
- `DELETE /api/consent/biometric` — Revokes consent (server-side)
- `DELETE /api/privacy/account` — Deletes user + all data (server-side)

Client-side Firestore access:
- `useCapsules.ts` — Reads capsules via `onSnapshot()` (real-time listener)
- `useAuth.ts` — Reads/writes user profile

## Inputs

### Required

- `PREREUNION_ANDREA/` source code (already in repo)
- Firebase project ID (from `.env.local`)

### Optional

- Existing manually-deployed rules (check Firebase Console)

## Output Contract

Create the following files:

### 1. `PREREUNION_ANDREA/firestore.rules`
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: only owner can read/write their own doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Consent subcollection: owner + server
      match /consents/{consentId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Server-only via Admin SDK
      }
    }

    // Capsules: owner can read; server creates/updates
    match /capsules/{capsuleId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow create: if false; // Server-only via Admin SDK
      allow update: if false; // Server-only via Admin SDK
      allow delete: if false; // Server-only via Admin SDK
    }

    // Waitlist: server-only
    match /waitlist/{docId} {
      allow read, write: if false;
    }

    // Rate limits: server-only
    match /_rate_limits/{docId} {
      allow read, write: if false;
    }
  }
}
```

### 2. `PREREUNION_ANDREA/firestore.indexes.json`
Minimal indexes needed (if any compound queries exist).

### 3. `PREREUNION_ANDREA/firebase.json`
If not exists, create with rules reference:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## Quality Gates

- Gate 1: `firebase emulators:exec --only firestore "npm run test:rules"` — rules pass unit tests
- Gate 2: All existing `useCapsules.ts` read patterns still work (client reads own capsules)
- Gate 3: All API routes still work (Admin SDK bypasses rules)
- Gate 4: Rules file committed to version control (no manual deploy drift)

## Verification Steps

1. Read ALL Firestore access patterns in `src/hooks/useCapsules.ts` and `src/hooks/useAuth.ts`
2. Read ALL API route handlers in `src/app/api/` to confirm they use Admin SDK (not client SDK)
3. Verify rules don't block legitimate client reads
4. Check Firebase Console for any existing rules
5. Deploy: `firebase deploy --only firestore:rules`

## Risks

- If client SDK writes exist that we missed, rules will block them → 403 errors
- Admin SDK operations bypass rules entirely (by design)
- Rate limit writes happen server-side — rules set to `false` is correct
