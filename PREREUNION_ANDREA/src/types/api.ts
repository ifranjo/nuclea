/**
 * API Response Type Contracts — PREREUNION_ANDREA
 *
 * This file declares TypeScript interfaces that exactly match the JSON shapes
 * returned by each route handler. These are read-only contracts — routes are
 * NOT modified here. Routes can adopt these types as return annotations later.
 *
 * Sources of truth:
 *   - src/app/api/capsules/route.ts      (GET, POST)
 *   - src/app/api/waitlist/route.ts      (GET, POST)
 *   - src/app/api/consent/biometric/route.ts  (GET, POST, DELETE)
 */

import type { CapsuleType } from './index'

// ---------------------------------------------------------------------------
// Shared error responses
// ---------------------------------------------------------------------------

/**
 * Standard error shape returned by all route handlers on 4xx/5xx.
 *
 * Returned by:
 *   - All routes on validation failure (ApiValidationError) → `details` is present
 *   - All routes on auth failure (AuthError) → `details` is absent
 *   - All routes on unexpected server error → `details` is absent
 *
 * @example { error: "Invalid request body", details: ["type: Required"] }
 * @example { error: "Unauthorized" }
 */
export interface ApiErrorResponse {
  error: string
  details?: string[]
}

/**
 * Rate limit error shape — only returned by POST /api/waitlist on HTTP 429.
 *
 * Returned when the fixed-window rate limiter blocks a request (by IP or by email).
 *
 * @example { error: "Demasiadas solicitudes desde esta IP, prueba mas tarde", retryAfterSeconds: 840 }
 */
export interface ApiRateLimitResponse {
  error: string
  retryAfterSeconds: number
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Pagination metadata embedded in GET /api/capsules list responses.
 *
 * `nextCursor` is a base64-encoded Firestore document ID. Pass it as the
 * `cursor` query parameter to fetch the next page. It is null when there are
 * no more results.
 */
export interface PaginationMeta {
  /** The page size used for this response (between 1 and 50). */
  limit: number
  /** Whether more results exist beyond this page. */
  hasMore: boolean
  /** Opaque cursor token for the next page, or null if this is the last page. */
  nextCursor: string | null
}

// ---------------------------------------------------------------------------
// Capsule responses
// ---------------------------------------------------------------------------

/**
 * Serialized capsule shape as returned by the API.
 *
 * Produced by `serializeCapsule()` in api/capsules/route.ts. All Firestore
 * fields are spread onto this object, with Timestamps converted to ISO 8601
 * strings. The `type` field is always a normalized canonical CapsuleType
 * (never the legacy alias 'everlife').
 *
 * Used in:
 *   - GET  /api/capsules  → CapsuleListResponse.capsules[]
 *   - POST /api/capsules  → CapsuleCreateResponse.capsule (slightly different
 *     source but same shape — see note on CapsuleCreateResponse)
 */
export interface CapsuleResponse {
  /** Firestore document ID. */
  id: string
  /** Owner user ID. */
  userId: string
  /** Normalized capsule type — always one of the 6 canonical values. */
  type: CapsuleType
  /** Human-readable title (1–140 chars). */
  title: string
  /** Optional description (up to 5000 chars). */
  description: string
  /** ISO 8601 creation timestamp. */
  createdAt: string
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string
  /** Whether the capsule is publicly accessible. */
  isPublic: boolean
  /** Array of user IDs with shared access. Empty array if not shared. */
  sharedWith: string[]
  /**
   * Inline content items. Empty array when no content has been added yet.
   * Each item mirrors CapsuleContent from types/index.ts but with Date fields
   * as strings (serialized from Firestore).
   */
  contents: unknown[]
  /** Optional tags for filtering/search. Empty array when none. */
  tags: string[]
  /** Optional cover image URL (Firebase Storage). Present when set. */
  coverImage?: string
  /** Optional AI avatar configuration. Present only on legacy/life-chapter capsules. */
  aiAvatar?: unknown
  /** ISO 8601 scheduled release date. Present when a future release is configured. */
  scheduledRelease?: string
}

/**
 * Response shape for GET /api/capsules (HTTP 200).
 *
 * Returns a paginated list of capsules belonging to the authenticated user,
 * ordered by `updatedAt` descending.
 *
 * @example
 * {
 *   capsules: [{ id: "abc", type: "legacy", ... }],
 *   pagination: { limit: 12, hasMore: false, nextCursor: null }
 * }
 */
export interface CapsuleListResponse {
  capsules: CapsuleResponse[]
  pagination: PaginationMeta
}

/**
 * Response shape for POST /api/capsules (HTTP 201).
 *
 * The `capsule` field is built inline from the data written to Firestore,
 * not from `serializeCapsule()`. The shape is effectively the same but
 * guarantees the exact fields that were written:
 * userId, type, title, description, createdAt, updatedAt, isPublic,
 * sharedWith (empty array), contents (empty array), tags (empty array).
 *
 * @example
 * {
 *   message: "Capsula creada correctamente",
 *   id: "firestoreDocId",
 *   capsule: { id: "firestoreDocId", type: "legacy", ... }
 * }
 */
export interface CapsuleCreateResponse {
  /** Human-readable confirmation message. */
  message: 'Capsula creada correctamente'
  /** Firestore document ID of the newly created capsule. */
  id: string
  /** The full capsule object as persisted (with ISO date strings). */
  capsule: CapsuleResponse
}

// ---------------------------------------------------------------------------
// Waitlist responses
// ---------------------------------------------------------------------------

/**
 * Response shape for GET /api/waitlist (HTTP 200).
 *
 * Public endpoint — returns the total count of waitlist entries. Falls back
 * to `{ count: 0 }` on any server error (never returns 5xx to the client).
 *
 * @example { count: 247 }
 */
export interface WaitlistCountResponse {
  count: number
}

/**
 * Response shape for POST /api/waitlist on successful new signup (HTTP 201).
 *
 * @example
 * {
 *   message: "Te has unido a la lista de espera",
 *   id: "firestoreDocId",
 *   unsubscribeUrl: "https://app.nuclea.es/api/waitlist/unsubscribe?token=..."
 * }
 */
export interface WaitlistSubmitResponse {
  /** Confirmation message. */
  message: 'Te has unido a la lista de espera'
  /** Firestore document ID of the new waitlist entry. */
  id: string
  /** Full URL the user can visit to unsubscribe from the waitlist. */
  unsubscribeUrl: string
}

/**
 * Response shape for POST /api/waitlist when the email is already registered (HTTP 200).
 *
 * Returned instead of WaitlistSubmitResponse when the email already exists in
 * the waitlist collection. Status is 200 (not 409) — the route treats this as
 * a soft success.
 *
 * @example { message: "Ya estas en la lista de espera", existing: true }
 */
export interface WaitlistDuplicateResponse {
  message: 'Ya estas en la lista de espera'
  existing: true
}

// ---------------------------------------------------------------------------
// Biometric consent responses — POST /api/consent/biometric
// ---------------------------------------------------------------------------

/**
 * Response shape for POST /api/consent/biometric (HTTP 201).
 *
 * Returned after successfully persisting a new biometric consent record
 * to the `users/{uid}/consents` subcollection.
 *
 * Note: The MEMORY.md documents a `message` field, but the actual route
 * returns only `consentId` and `signedAt`. No `message` field is present.
 *
 * @example
 * {
 *   consentId: "firestoreDocId",
 *   signedAt: "2026-02-21T10:00:00.000Z"
 * }
 */
export interface BiometricConsentSignResponse {
  /** Firestore document ID of the newly created consent record. */
  consentId: string
  /** ISO 8601 timestamp of when the consent was signed (approximate — server-side clock). */
  signedAt: string
}

// ---------------------------------------------------------------------------
// Biometric consent responses — DELETE /api/consent/biometric
// ---------------------------------------------------------------------------

/**
 * Response shape for DELETE /api/consent/biometric (HTTP 200).
 *
 * Returned after successfully revoking an active biometric consent record.
 * Also updates `aiAvatar.consentWithdrawnAt` on the user document if an
 * AI avatar exists.
 *
 * @example
 * {
 *   revokedAt: "2026-02-21T10:05:00.000Z",
 *   message: "Consentimiento revocado"
 * }
 */
export interface BiometricConsentRevokeResponse {
  /** ISO 8601 timestamp of when the revocation was processed (approximate — server-side clock). */
  revokedAt: string
  /** Human-readable confirmation message. */
  message: 'Consentimiento revocado'
}

// ---------------------------------------------------------------------------
// Biometric consent responses — GET /api/consent/biometric
// ---------------------------------------------------------------------------

/**
 * Inline consent detail object within BiometricConsentStatusResponse.
 *
 * Reflects the Firestore document fields. `signedAt` may be null if the
 * server timestamp has not yet been committed (rare race condition).
 *
 * Note: The field name is `consentId` (matching the POST response), NOT `id`.
 */
export interface BiometricConsentDetail {
  /** Firestore document ID of the active consent record. */
  consentId: string
  /** Whether the user granted consent for voice biometric data. */
  voiceConsent: boolean
  /** Whether the user granted consent for facial biometric data. */
  faceConsent: boolean
  /** Whether the user granted consent for personality/behavioral data. */
  personalityConsent: boolean
  /** Consent policy version in effect when consent was signed (e.g. "2.0"). */
  consentVersion: string
  /**
   * ISO 8601 timestamp of when the consent was signed, or null if the
   * Firestore server timestamp was not yet materialized on read.
   */
  signedAt: string | null
}

/**
 * Response shape for GET /api/consent/biometric (HTTP 200).
 *
 * Two possible shapes depending on whether an active (non-revoked) biometric
 * consent record exists for the authenticated user:
 *
 * - No active consent: `{ hasActiveConsent: false }` — `consent` field is absent
 * - Active consent found: `{ hasActiveConsent: true, consent: BiometricConsentDetail }`
 *
 * @example — no active consent
 * { hasActiveConsent: false }
 *
 * @example — active consent
 * {
 *   hasActiveConsent: true,
 *   consent: {
 *     consentId: "abc123",
 *     voiceConsent: true,
 *     faceConsent: false,
 *     personalityConsent: true,
 *     consentVersion: "2.0",
 *     signedAt: "2026-02-15T09:30:00.000Z"
 *   }
 * }
 */
export type BiometricConsentStatusResponse =
  | { hasActiveConsent: false }
  | { hasActiveConsent: true; consent: BiometricConsentDetail }
