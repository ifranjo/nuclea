════════════════════════════════════════════════════════════════════
RIVERTRACE: Auth & Biometric Consent Flow
════════════════════════════════════════════════════════════════════

Entry Point: PREREUNION_ANDREA/src/app/login/page.tsx:46
Exit Points: PREREUNION_ANDREA/src/app/api/consent/biometric/route.ts:72,
             PREREUNION_ANDREA/src/hooks/useAuth.ts:179-184

──────────────────────────────────────────────────────────────────
FLOW MAP
──────────────────────────────────────────────────────────────────

[1] TRIBUTARY: login/page.tsx - Google OAuth Sign-In Button Click
    │ Data: { acceptedTerms: undefined }
    ▼
[2] TRIBUTARY: useAuth.ts:70 - signInWithGoogle(acceptedTerms?)
    │ Data: Firebase Auth popup → FirebaseUser
    ▼
[3] DAM: useAuth.ts:78 - Check if user exists in Firestore
    │ BLOCKS IF: existingUser.exists() === true → returns 'signed_in'
    │ Data: userRef = doc(db, 'users', fbUser.uid)
    ▼
[4] DAM: useAuth.ts:86 - Consent check for new users
    │ BLOCKS IF: acceptedTerms === false → sets pendingConsent state
    │ Data: pendingFirebaseUser = fbUser, pendingConsent = true
    ▼
[5] CHANNEL: login/page.tsx:202-273 - Consent Modal UI (AnimatePresence)
    │ Data: pendingConsent state triggers modal render
    ▼
[6] DAM: login/page.tsx:60 - handleCompleteConsent validation
    │ BLOCKS IF: consentAccepted === false → toast.error
    │ Data: { consentAccepted: boolean }
    ▼
[7] TRANSFORMATION: useAuth.ts:109 - completeGoogleRegistration()
    │ Input: acceptedTerms (boolean)
    │ Output: createUserProfile(fbUser) call
    ▼
[8] DAM: useAuth.ts:114 - Terms rejection check
    │ BLOCKS IF: acceptedTerms === false → firebaseSignOut() + throw Error
    │ Data: "Debes aceptar los terminos y la politica de privacidad"
    ▼
[9] TRANSFORMATION: useAuth.ts:231-255 - createUserProfile()
    │ Input: FirebaseUser
    │ Output: Firestore users/{uid} document
    │ Fields: email, displayName, photoURL, plan='free', createdAt,
    │         termsAcceptedAt, privacyAcceptedAt,
    │         consentVersion='2.0', consentSource='signup_google'
    ▼
[10] DELTA: Firestore users/{uid} - User profile created with consent metadata

──────────────────────────────────────────────────────────────────
ALTERNATE FLOW: Email/Password Registration
──────────────────────────────────────────────────────────────────

[1] TRIBUTARY: registro/page.tsx:23 - handleRegister form submission
    │ Data: { name, email, password, confirmPassword, acceptedTerms }
    ▼
[2] DAM: registro/page.tsx:26-39 - Client-side validation
    │ BLOCKS IF: password !== confirmPassword
    │ BLOCKS IF: password.length < 6
    │ BLOCKS IF: acceptedTerms === false
    ▼
[3] TRIBUTARY: useAuth.ts:156 - signUpWithEmail()
    │ Data: { email, password, displayName, acceptedTerms }
    ▼
[4] DAM: useAuth.ts:159 - Terms acceptance check
    │ BLOCKS IF: acceptedTerms === false → throw Error
    ▼
[5] TRANSFORMATION: useAuth.ts:163 - createUserWithEmailAndPassword()
    │ Firebase Auth creates user
    ▼
[6] TRANSFORMATION: useAuth.ts:166-184 - Firestore profile creation
    │ Output: users/{uid} with consent metadata
    │ consentSource: 'signup_email' (vs 'signup_google')
    ▼
[7] DELTA: Firestore users/{uid} - User profile with consentVersion='2.0'

──────────────────────────────────────────────────────────────────
BIOMETRIC CONSENT FLOW (Art. 9.2.a RGPD)
──────────────────────────────────────────────────────────────────

[1] TRIBUTARY: consentimiento/page.tsx - User visits /consentimiento
    │ Data: firebaseUser from useAuth()
    ▼
[2] DAM: consentimiento/page.tsx:312-324 - Auth gate
    │ BLOCKS IF: !isAuthenticated → shows login prompt
    │ Data: "Para firmar el consentimiento biometrico, necesitas iniciar sesion"
    ▼
[3] CHANNEL: consentimiento/page.tsx:46-81 - Load active consent useEffect
    │ Data: GET /api/consent/biometric with Bearer token
    ▼
[4] DAM: api/consent/biometric/route.ts:202 - verifyBearerToken()
    │ BLOCKS IF: No Authorization header → AuthError 401
    │ BLOCKS IF: Invalid token → AuthError 401
    ▼
[5] TRANSFORMATION: api/consent/biometric/route.ts:205-213 - Query consents
    │ Query: users/{uid}/consents where type='biometric_art9' AND revokedAt=null
    │ OrderBy: signedAt desc, Limit: 1
    ▼
[6] DELTA: consentimiento/page.tsx:64-68 - Set activeConsent state

[7] TRIBUTARY: consentimiento/page.tsx:83 - handleSign() - User signs consent
    │ Data: { voiceConsent, faceConsent, personalityConsent } booleans
    ▼
[8] DAM: consentimiento/page.tsx:84 - At least one checkbox checked
    │ BLOCKS IF: !anyChecked → return early (button disabled anyway)
    ▼
[9] CHANNEL: POST /api/consent/biometric
    │ Headers: Authorization: Bearer {token}
    │ Body: { voiceConsent, faceConsent, personalityConsent }
    ▼
[10] DAM: api/consent/biometric/route.ts:42 - verifyBearerToken()
    ▼
[11] DAM: api/consent/biometric/route.ts:44 - validateWithSchema()
    │ Schema: biometricConsentSchema (Zod)
    │ BLOCKS IF: All consents false → "Al menos un tipo de consentimiento debe ser aceptado"
    │ BLOCKS IF: Missing fields → ApiValidationError 400
    ▼
[12] TRANSFORMATION: api/consent/biometric/route.ts:48-59 - Build consent document
    │ Fields: userId, type='biometric_art9', voiceConsent, faceConsent,
    │         personalityConsent, consentVersion='2.0', signedAt=serverTimestamp,
    │         revokedAt=null, ipAddress, userAgent
    ▼
[13] DELTA: api/consent/biometric/route.ts:61-65 - Firestore write
    │ Path: users/{uid}/consents/{consentId}
    │ Output: { consentId, signedAt }

──────────────────────────────────────────────────────────────────
CONSENT REVOCATION FLOW
──────────────────────────────────────────────────────────────────

[1] TRIBUTARY: consentimiento/page.tsx:128 - handleRevoke()
    │ Data: activeConsent.consentId, revokeReason (optional)
    ▼
[2] DAM: consentimiento/page.tsx:129 - Has active consent check
    ▼
[3] CHANNEL: DELETE /api/consent/biometric
    │ Headers: Authorization: Bearer {token}
    │ Body: { consentId, reason? }
    ▼
[4] DAM: api/consent/biometric/route.ts:103 - verifyBearerToken()
    ▼
[5] DAM: api/consent/biometric/route.ts:105 - validateWithSchema()
    │ Schema: revokeConsentSchema (consentId required, reason optional max 1000 chars)
    ▼
[6] DAM: api/consent/biometric/route.ts:115-122 - Consent exists check
    │ BLOCKS IF: !consentDoc.exists → 404 "Consentimiento no encontrado"
    ▼
[7] DAM: api/consent/biometric/route.ts:126-131 - Ownership check
    │ BLOCKS IF: consentData.userId !== userId → 403 "No autorizado"
    ▼
[8] DAM: api/consent/biometric/route.ts:133-138 - Already revoked check
    │ BLOCKS IF: revokedAt !== null → 409 "Este consentimiento ya ha sido revocado"
    ▼
[9] TRANSFORMATION: api/consent/biometric/route.ts:141-154 - Build revocation payload
    │ Fields: revokedAt=serverTimestamp, revocationIpAddress, revocationUserAgent,
    │         scheduledProcessorDeletionAt=(now + 30 days), processorDeletionStatus='scheduled',
    │         revocationReason (if provided)
    ▼
[10] TRANSFORMATION: api/consent/biometric/route.ts:157-166 - Update AIAvatar
    │ Condition: userData?.aiAvatar exists
    │ Updates: aiAvatar.isActive=false, aiAvatar.consentWithdrawnAt=serverTimestamp
    ▼
[11] DELTA: Firestore users/{uid}/consents/{consentId} - Revocation persisted

──────────────────────────────────────────────────────────────────
DAMS INVENTORY (Security Controls)
──────────────────────────────────────────────────────────────────
| # | File | Line | Purpose | Failure |
|---|------|------|---------|---------|
| 1 | useAuth.ts | 78 | Check existing user | Returns 'signed_in' if exists |
| 2 | useAuth.ts | 86-97 | Google OAuth consent gate | Sets pendingConsent if no terms accepted |
| 3 | useAuth.ts | 114 | Terms rejection | Signs out + error if terms declined |
| 4 | useAuth.ts | 159 | Email signup terms check | Throws if terms not accepted |
| 5 | registro/page.tsx | 26-39 | Client validation | Password match, length, terms |
| 6 | firebase-admin.ts | 77-78 | Bearer token presence | AuthError 401 if missing |
| 7 | firebase-admin.ts | 82-86 | Token verification | AuthError 401 if invalid |
| 8 | api-validation.ts | 71-78 | Biometric consent schema | Requires at least one true consent |
| 9 | api-validation.ts | 80-83 | Revoke consent schema | Requires consentId |
| 10 | api/consent/biometric | 115-122 | Consent exists check | 404 if not found |
| 11 | api/consent/biometric | 126-131 | Ownership verification | 403 if wrong user |
| 12 | api/consent/biometric | 133-138 | Double-revocation prevention | 409 if already revoked |
| 13 | consentimiento/page.tsx | 312-324 | Auth gate for consent UI | Shows login prompt if not auth |
| 14 | avatar-guard.ts | 10-16 | Avatar active assertion | Throws AvatarDisabledError if consent withdrawn |

──────────────────────────────────────────────────────────────────
TRANSFORMATIONS LOG
──────────────────────────────────────────────────────────────────
| # | Location | Input → Output |
|---|----------|----------------|
| 1 | useAuth.ts:231-255 | FirebaseUser → Firestore User profile + consent metadata |
| 2 | useAuth.ts:166-184 | Form data → Firestore User profile (email signup) |
| 3 | api/consent/biometric:48-59 | Checkbox booleans → Consent document with audit fields |
| 4 | api/consent/biometric:141-154 | Revocation request → Revoked consent with 30-day deletion schedule |
| 5 | api/consent/biometric:157-166 | Revocation → AIAvatar deactivation (isActive=false) |
| 6 | firebase-admin.ts:16-34 | Env vars → PEM-validated credentials |
| 7 | rate-limit.ts:20-22 | IP string → SHA-256 hash |
| 8 | types/index.ts:125-133 | StoredCapsuleType → Normalized CapsuleType |

──────────────────────────────────────────────────────────────────
CONSENT VERSIONING
──────────────────────────────────────────────────────────────────

CURRENT_CONSENT_VERSION = '2.0'
Location: src/types/index.ts:2

Consent Fields Persisted:
- termsAcceptedAt: Date (serverTimestamp on write, .toDate() on read)
- privacyAcceptedAt: Date (serverTimestamp on write, .toDate() on read)
- consentVersion: string (e.g., '2.0')
- consentSource: 'signup_google' | 'signup_email' | 'waitlist' | etc.

Biometric Consent (Art. 9.2.a RGPD):
- Type: 'biometric_art9'
- Granular flags: voiceConsent, faceConsent, personalityConsent
- Signed at: serverTimestamp
- Revoked at: serverTimestamp (when revoked)
- Scheduled deletion: 30 days after revocation

Audit Trail Fields:
- ipAddress: from x-forwarded-for or x-real-ip headers
- userAgent: request user-agent string
- revocationIpAddress: IP at time of revocation
- revocationUserAgent: UA at time of revocation
- revocationReason: optional user-provided reason

──────────────────────────────────────────────────────────────────
MERMAID DIAGRAM
──────────────────────────────────────────────────────────────────

```mermaid
flowchart TD
    subgraph "Entry Points"
        A1["/login - Google OAuth"]
        A2["/registro - Email/Password"]
        A3["/consentimiento - Biometric Consent"]
    end

    subgraph "useAuth Hook"
        B1[signInWithGoogle]
        B2[signUpWithEmail]
        B3[completeGoogleRegistration]
        B4[onAuthStateChanged]
    end

    subgraph "Firestore - Users Collection"
        C1[(users/{uid})]
        C2[consents subcollection]
    end

    subgraph "API Routes"
        D1[/api/consent/biometric POST]
        D2[/api/consent/biometric GET]
        D3[/api/consent/biometric DELETE]
    end

    subgraph "Security Layer"
        E1[verifyBearerToken]
        E2[Zod Schema Validation]
        E3[Ownership Check]
    end

    A1 -->|"No prior consent"| B1
    B1 -->|"New user"| B3
    B3 -->|"Accepted terms"| C1
    B1 -->|"Existing user"| B4
    B4 --> C1

    A2 --> B2
    B2 -->|"acceptedTerms=true"| C1

    A3 -->|"Sign consent"| D1
    A3 -->|"Check status"| D2
    A3 -->|"Revoke"| D3

    D1 --> E1
    D1 --> E2
    D2 --> E1
    D3 --> E1
    D3 --> E2
    D3 --> E3

    D1 -->|"Create consent doc"| C2
    D3 -->|"Update consent + avatar"| C2
    D3 -->|"Deactivate avatar"| C1

    style C1 fill:#f9f,stroke:#333
    style C2 fill:#f9f,stroke:#333
    style E1 fill:#ff9,stroke:#333
    style E2 fill:#ff9,stroke:#333
    style E3 fill:#ff9,stroke:#333
```

──────────────────────────────────────────────────────────────────
SECURITY OBSERVATIONS
──────────────────────────────────────────────────────────────────

✓ STRENGTHS:

1. Explicit Consent Pattern
   - Google OAuth new users MUST accept terms before profile creation
   - Firebase Auth session kept alive during pending consent (not signed out)
   - Clean separation: auth vs profile creation

2. Granular Biometric Consent
   - Art. 9.2.a RGPD compliant with 3 separate consent categories
   - At least one must be selected (Zod .refine validation)
   - Each consent independently tracked

3. Audit Trail Completeness
   - IP address and User-Agent captured on sign AND revoke
   - Server timestamps for all events
   - 30-day deletion schedule for processor data after revocation

4. Ownership Verification
   - All API routes verify Bearer token
   - Revocation checks consentData.userId === token userId
   - Prevents cross-user consent manipulation

5. Double-Revocation Prevention
   - Returns 409 if consent already revoked
   - Idempotent-ish behavior for retry scenarios

6. Avatar Guard Pattern
   - avatar-guard.ts provides assertAvatarActive() helper
   - Throws AvatarDisabledError if consentWithdrawnAt is set
   - Can be used throughout app to gate AI avatar features

7. Rate Limiting Infrastructure
   - Fixed-window rate limiting via Firestore
   - SHA-256 hashed keys for privacy
   - Used on API routes (though not explicitly on consent endpoints)

8. Firebase Admin Fail-Fast
   - Cached initialization with detailed error messages
   - PEM format validation for private key
   - Context-aware error messages

⚠ POTENTIAL CONCERNS:

1. Consent Version Hardcoding
   - consentimiento/page.tsx:118 hardcodes '2.0' instead of importing CURRENT_CONSENT_VERSION
   - Could drift if version changes

2. No Rate Limiting on Consent Endpoints
   - Biometric consent POST/DELETE not rate limited
   - Could be abused for audit log spam

3. Token Expiry During Pending Consent
   - Google OAuth pending state keeps Firebase session
   - If token expires before consent completion, flow breaks
   - No explicit token refresh handling

4. IP Address Extraction
   - x-forwarded-for takes first IP only
   - Could be spoofed in some proxy configurations
   - No validation of IP format

5. Scheduled Deletion Not Enforced
   - scheduledProcessorDeletionAt is stored but no visible cron/scheduler
   - Actual deletion from ElevenLabs requires external process

6. No Consent Re-confirmation
   - Users can sign consent multiple times (new documents each time)
   - No validation that user hasn't already given consent
   - Could lead to duplicate consent records

──────────────────────────────────────────────────────────────────
FILE REFERENCES
──────────────────────────────────────────────────────────────────

| # | File | Purpose | Lines |
|---|------|---------|-------|
| 1 | src/hooks/useAuth.ts | Main auth hook with consent flow | 256 |
| 2 | src/app/login/page.tsx | Login page with consent modal | 277 |
| 3 | src/app/registro/page.tsx | Registration page | 222 |
| 4 | src/app/consentimiento/page.tsx | Biometric consent UI (RGPD Art. 9.2.a) | 587 |
| 5 | src/app/api/consent/biometric/route.ts | Biometric consent API (POST/GET/DELETE) | 248 |
| 6 | src/lib/api-validation.ts | Zod schemas for validation | 84 |
| 7 | src/lib/firebase.ts | Firebase client config | 31 |
| 8 | src/lib/avatar-guard.ts | Avatar activation guard | 18 |
| 9 | src/lib/firebase-admin.ts | Firebase Admin SDK + auth | 89 |
| 10 | src/types/index.ts | Type definitions + CURRENT_CONSENT_VERSION | 183 |
| 11 | src/lib/rate-limit.ts | Rate limiting utilities | 89 |
| 12 | src/lib/api-validation.test.ts | Unit tests for validation schemas | 164 |

──────────────────────────────────────────────────────────────────
CRITICAL CODE SNIPPETS
──────────────────────────────────────────────────────────────────

// 1. Google OAuth Pending Consent State (useAuth.ts:24-25, 91-96)
const [pendingConsent, setPendingConsent] = useState(false)
const [pendingFirebaseUser, setPendingFirebaseUser] = useState<FirebaseUser | null>(null)
// ...
setPendingFirebaseUser(fbUser)
setPendingConsent(true)
// Do NOT sign out — keep Firebase session alive
return 'pending_consent'

// 2. Bearer Token Verification (firebase-admin.ts:75-88)
export async function verifyBearerToken(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('No authorization token', 401)
  }
  const token = authHeader.split('Bearer ')[1]
  const decodedToken = await getAdminAuth('verifyBearerToken').verifyIdToken(token)
  return decodedToken.uid
}

// 3. Biometric Consent Schema Validation (api-validation.ts:71-78)
export const biometricConsentSchema = z.object({
  voiceConsent: z.boolean(),
  faceConsent: z.boolean(),
  personalityConsent: z.boolean(),
}).refine(
  (data) => data.voiceConsent || data.faceConsent || data.personalityConsent,
  { message: 'Al menos un tipo de consentimiento debe ser aceptado' }
)

// 4. Consent Document Creation (route.ts:48-59)
const consentData = {
  userId,
  type: 'biometric_art9',
  voiceConsent: parsed.voiceConsent,
  faceConsent: parsed.faceConsent,
  personalityConsent: parsed.personalityConsent,
  consentVersion: CURRENT_CONSENT_VERSION,
  signedAt: FieldValue.serverTimestamp(),
  revokedAt: null,
  ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
}

// 5. Avatar Deactivation on Revocation (route.ts:157-166)
if (userData?.aiAvatar) {
  await userRef.update({
    'aiAvatar.isActive': false,
    'aiAvatar.consentWithdrawnAt': FieldValue.serverTimestamp(),
  })
}

// 6. Avatar Guard (avatar-guard.ts:10-16)
export function assertAvatarActive(aiAvatar?: AIAvatar | null): void {
  if (!aiAvatar) return
  const revokedAt = aiAvatar.consentWithdrawnAt
  if (revokedAt === null || revokedAt === undefined) return
  throw new AvatarDisabledError()
}

════════════════════════════════════════════════════════════════════
END OF RIVERTRACE REPORT
════════════════════════════════════════════════════════════════════
