# Runtime API Endpoints (PREREUNION)

Last reviewed: 2026-02-13

This file documents the currently implemented runtime API in `PREREUNION_ANDREA/src/app/api/**`.

For the broader target API contract (future/expanded scope), see `ENDPOINTS.md`.

## Runtime Base

- App: `PREREUNION_ANDREA`
- Runtime style: Next.js App Router route handlers
- Base path: `/api`
- Auth model: Firebase ID token (Bearer)

## Implemented routes

### Waitlist

- `POST /api/waitlist`
  - Auth: none
  - Behavior: upsert waitlist entry with consent metadata
- `GET /api/waitlist`
  - Auth: none
  - Behavior: returns aggregate count

### Capsules

- `GET /api/capsules`
  - Auth: required (Bearer token)
  - Behavior: returns current user's capsules
- `POST /api/capsules`
  - Auth: required (Bearer token)
  - Behavior: creates capsule, enforces plan limits

### Privacy

- `GET /api/privacy/export`
  - Auth: required (Bearer token)
  - Behavior: exports user privacy data payload
- `DELETE /api/privacy/account`
  - Auth: required (Bearer token)
  - Behavior: account deletion workflow entrypoint

### Waitlist unsubscribe

- `POST /api/waitlist/unsubscribe`
  - Auth: none
  - Behavior: unsubscribes a waitlist email/token

### Cron Jobs

- `POST /api/cron/lifecycle`
  - Auth: `x-cron-secret` header or Bearer token
  - Behavior: Runs expiry sweep, video purge queue, trust contact notifications
  - Frequency: Hourly recommended
- `POST /api/cron/biometric-cleanup`
  - Auth: `x-cron-secret` header or Bearer token
  - Behavior: Cleans up expired biometric consent records
  - Frequency: Daily recommended

### Consent

- `POST /api/consent/biometric`
  - Auth: required (Bearer token)
  - Behavior: Signs biometric consent for AI avatar
- `GET /api/consent/biometric`
  - Auth: required (Bearer token)
  - Behavior: Returns current consent status
- `DELETE /api/consent/biometric`
  - Auth: required (Bearer token)
  - Behavior: Revokes biometric consent

### Notifications

- `POST /api/notifications/whatsapp/opt-in`
  - Auth: required (Bearer token)
  - Behavior: Enables WhatsApp notifications for user

## Runtime verification

These checks mechanically validate route behavior:

```bash
cd PREREUNION_ANDREA
npm run smoke:routes
```

Smoke assertions currently include:

- public page availability (`/`, `/privacidad`, `/terminos`)
- waitlist count response shape
- auth boundary behavior (`/api/capsules`, `/api/privacy/export`, `/api/privacy/account` return 401 without token)
