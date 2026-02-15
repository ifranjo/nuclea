# Privacy Endpoints Runbook

## Scope

Operational runbook for trust/privacy endpoints added after P0 remediation.

## Endpoints

### 1) Data Export (DSAR Access/Portability)

- Method: `GET`
- Path: `/api/privacy/export`
- Auth: `Authorization: Bearer <firebase_id_token>`
- Response: JSON with `user`, `capsules`, `exportedAt`

Example:

```bash
curl -X GET "http://localhost:3000/api/privacy/export" \
  -H "Authorization: Bearer <ID_TOKEN>"
```

### 2) Account Deletion (DSAR Erasure - Core)

- Method: `DELETE`
- Path: `/api/privacy/account`
- Auth: `Authorization: Bearer <firebase_id_token>`
- Effect:
  - Deletes `users/{uid}` document
  - Deletes `capsules` documents for `userId == uid`
  - Deletes Firebase Auth user

Example:

```bash
curl -X DELETE "http://localhost:3000/api/privacy/account" \
  -H "Authorization: Bearer <ID_TOKEN>"
```

### 3) Waitlist Consent Intake

- Method: `POST`
- Path: `/api/waitlist`
- Auth: None
- Required body fields:
  - `email`
  - `acceptedPrivacy: true`
- Optional:
  - `source`
  - `consentVersion` (default: `1.0`)
- Response includes `unsubscribeUrl` with tokenized opt-out link
- Security controls:
  - `429` per-IP fixed window limit
  - `429` per-email fixed window limit

Example:

```bash
curl -X POST "http://localhost:3000/api/waitlist" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"acceptedPrivacy\":true,\"source\":\"landing-page\",\"consentVersion\":\"1.0\"}"
```

### 4) Waitlist Unsubscribe (Tokenized)

- Method: `GET` or `POST`
- Path: `/api/waitlist/unsubscribe`
- Input:
  - GET: `?token=<unsubscribeToken>`
  - POST body: `{ "token": "<unsubscribeToken>" }`

Examples:

```bash
curl -X GET "http://localhost:3000/api/waitlist/unsubscribe?token=<TOKEN>"
```

```bash
curl -X POST "http://localhost:3000/api/waitlist/unsubscribe" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"<TOKEN>\"}"
```

## Notes

- Firebase Admin now fails fast on first secured runtime use if credentials are missing or malformed.
- `useCapsules.deleteCapsule` now attempts best-effort Storage cleanup before Firestore deletion.
- Account deletion currently targets core user/capsule records; review third-party processor deletion workflows separately.
- Legal closure dependencies for Stage 2 trust gate are tracked in `docs/quality/LEGAL_STAGE2_BLOCKERS.md`.
- Dashboard now exposes self-service actions:
  - `Exportar mis datos` calls `/api/privacy/export`
  - `Eliminar mi cuenta` calls `/api/privacy/account` (requires typed confirmation)

## Auth/Error Semantics

- Protected endpoints (`/api/privacy/export`, `/api/privacy/account`, `/api/capsules`) return:
  - `401` for missing or invalid bearer token
  - `400` for invalid query/body schema
  - `500` only for unexpected server/runtime errors
- This allows downstream quality gates to distinguish authentication failures from backend failures.

## Capsules Pagination

- Endpoint: `GET /api/capsules`
- Query:
  - `limit` (1..50, default 12)
  - `cursor` (opaque base64url token)
- Response includes:
  - `capsules[]`
  - `pagination.hasMore`
  - `pagination.nextCursor`
